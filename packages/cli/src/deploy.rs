use anyhow::{Context, Result, bail};
use builder_core::{ArtifactPayload, create_artifact_payload_with_output, optimize_assets};
use std::io::{BufRead, BufReader, Read};
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::thread;
use std::time::Instant;

use crate::api::ApiClient;
use crate::framework::{detect_framework, detect_install_command, resolve_output_dir};
use crate::framework_output::resolve_build_output;
use crate::presenter;

/// Where step lines go: printed always, and posted to the API unless the
/// build worker is already streaming everything this process prints.
struct Steps<'a> {
    api: &'a ApiClient,
    project_id: &'a str,
    deployment_id: &'a str,
    streamed: bool,
}

impl Steps<'_> {
    fn say(&self, line: &str) -> Result<()> {
        println!("{line}");
        if !self.streamed {
            self.api
                .append_log(self.project_id, self.deployment_id, "info", line)?;
        }
        Ok(())
    }
}

pub(crate) fn deploy(prod: bool) -> Result<()> {
    let started = Instant::now();
    let token = deployment_token()?;
    let cwd = std::env::current_dir()?;
    let (_root, link) = cli_config::find_link(&cwd)?.ok_or_else(|| {
        anyhow::anyhow!("No linked project — run `multivrs link --project <id>`.")
    })?;
    let target = if prod { "production" } else { "preview" };
    let framework = match non_empty_env("MULTIVRS_FRAMEWORK") {
        Some(id) => crate::framework::Framework::from_id(&id)?,
        None => detect_framework(&cwd)?,
    };
    let api = ApiClient::new(token);
    let deployment = match non_empty_env("MULTIVRS_DEPLOYMENT_ID") {
        Some(id) => crate::api::Deployment { id, url: None },
        None => api.create_deployment(&link.project_id, target)?,
    };
    api.update_status(&link.project_id, &deployment.id, "building", None)?;
    let steps = Steps {
        api: &api,
        project_id: &link.project_id,
        deployment_id: &deployment.id,
        streamed: non_empty_env("MULTIVRS_LOG_STREAMED").is_some(),
    };
    steps.say(&format!(
        "Detected {} · deploying to {target}",
        framework.name()
    ))?;
    let build = (|| -> Result<ArtifactPayload> {
        let custom_install = non_empty_env("MULTIVRS_INSTALL_COMMAND");
        let is_custom_install = custom_install.is_some();
        if let Some(command) = custom_install.or_else(|| detect_install_command(&cwd)) {
            let label = presenter::install_label(&command, is_custom_install);
            steps.say(&label)?;
            let step = Instant::now();
            run_shell(&command, &cwd, &label)?;
            steps.say(&format!(
                "Installed dependencies in {}",
                presenter::duration(step.elapsed())
            ))?;
        }
        let custom_build = non_empty_env("MULTIVRS_BUILD_COMMAND");
        if framework == crate::framework::Framework::Next && custom_build.is_none() {
            prepare_next(&steps, &cwd)?;
        }
        let is_custom_build = custom_build.is_some();
        if let Some(command) = custom_build.or_else(|| framework.build_command()) {
            let label = presenter::build_label(framework, &command, is_custom_build);
            steps.say(&label)?;
            let step = Instant::now();
            run_shell(&command, &cwd, &label)?;
            steps.say(&format!("Built in {}", presenter::duration(step.elapsed())))?;
        }
        let output_dir = resolve_output_directory(framework, &cwd)?;
        let output = resolve_build_output(framework, &output_dir)?;
        let optimized = optimize_assets(&output_dir)?;
        // One summary line; per-file skips (no optimizer for that type) are noise.
        steps.say(&format!(
            "Optimized {} assets ({} left as they are)",
            optimized.created, optimized.skipped
        ))?;
        create_artifact_payload_with_output(&output_dir, target, output)
    })();
    let artifact = match build {
        Ok(artifact) => artifact,
        Err(error) => {
            record_failure(&steps, &error);
            return Err(error);
        }
    };
    steps.say(&format!("Uploading {} files", artifact.files.len()))?;
    let upload = Instant::now();
    let ready = match api
        .deploy_artifact(&link.project_id, &deployment.id, &artifact)
        .map_err(|error| anyhow::anyhow!("Uploading the build failed: {error}"))
    {
        Ok(ready) => ready,
        Err(error) => {
            record_failure(&steps, &error);
            return Err(error);
        }
    };
    println!(
        "Uploaded in {} · ready in {}{}",
        presenter::duration(upload.elapsed()),
        presenter::duration(started.elapsed()),
        ready.url.map(|url| format!(" · {url}")).unwrap_or_default()
    );
    Ok(())
}

/// Give a Next.js checkout what it needs to build for the Multivrs edge.
fn prepare_next(steps: &Steps, cwd: &Path) -> Result<()> {
    let setup = crate::next_setup::next_setup(cwd);
    if !setup.install_adapter && !setup.write_config && !setup.write_next_config {
        return Ok(());
    }
    let label = "Preparing Next.js for the Multivrs edge";
    steps.say(label)?;
    if setup.install_adapter {
        let command = crate::next_setup::adapter_install_command(&crate::framework::bun_binary());
        run_shell(&command, cwd, label)?;
    }
    if setup.write_next_config {
        crate::next_setup::write_empty_next_config(cwd)?;
    }
    if setup.write_config {
        crate::next_setup::write_default_config(cwd)?;
    }
    Ok(())
}

fn non_empty_env(name: &str) -> Option<String> {
    std::env::var(name)
        .ok()
        .map(|value| value.trim().to_owned())
        .filter(|value| !value.is_empty())
}

fn deployment_token() -> Result<String> {
    if let Some(token) = non_empty_env("MULTIVRS_TOKEN") {
        return Ok(token);
    }
    cli_auth::Store::at_home()?
        .load()?
        .map(|credentials| credentials.token)
        .ok_or_else(|| {
            anyhow::anyhow!("Not logged in — run `multivrs login --token <token>` first.")
        })
}

fn resolve_output_directory(framework: crate::framework::Framework, cwd: &Path) -> Result<PathBuf> {
    if let Some(directory) = non_empty_env("MULTIVRS_OUTPUT_DIRECTORY") {
        return Ok(cwd.join(directory));
    }
    resolve_output_dir(framework, cwd)
}

fn record_failure(steps: &Steps, error: &anyhow::Error) {
    let message = error.to_string();
    if !steps.streamed {
        let _ = steps
            .api
            .append_log(steps.project_id, steps.deployment_id, "error", &message);
    }
    let _ = steps.api.update_status(
        steps.project_id,
        steps.deployment_id,
        "error",
        Some(&message),
    );
}

pub(crate) fn run_shell(command: &str, cwd: &Path, label: &str) -> Result<()> {
    let mut child = Command::new("sh")
        .arg("-lc")
        .arg(command)
        .current_dir(cwd)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .with_context(|| format!("failed to run {command}"))?;
    let stdout = child
        .stdout
        .take()
        .context("build stdout was not captured")?;
    let stderr = child
        .stderr
        .take()
        .context("build stderr was not captured")?;
    let stdout_thread = forward_output(stdout, false);
    let stderr_thread = forward_output(stderr, true);
    let status = child.wait()?;
    let stdout = stdout_thread
        .join()
        .map_err(|_| anyhow::anyhow!("build stdout reader stopped unexpectedly"))?;
    let stderr = stderr_thread
        .join()
        .map_err(|_| anyhow::anyhow!("build stderr reader stopped unexpectedly"))?;
    if !status.success() {
        // The output was already shown line by line; name the step and why.
        match presenter::failure_reason(&format!("{stdout}\n{stderr}")) {
            Some(reason) => bail!("{label} failed: {reason}"),
            None => bail!("{label} failed (exit code {})", status.code().unwrap_or(-1)),
        }
    }
    Ok(())
}

fn forward_output<R: Read + Send + 'static>(reader: R, stderr: bool) -> thread::JoinHandle<String> {
    thread::spawn(move || {
        let mut captured = String::new();
        for raw in BufReader::new(reader).lines().map_while(Result::ok) {
            captured.push_str(&raw);
            captured.push('\n');
            let Some(line) = presenter::present_line(&raw) else {
                continue;
            };
            if stderr {
                eprintln!("{line}");
            } else {
                println!("{line}");
            }
        }
        captured
    })
}

pub(crate) fn truncate_log(message: &str) -> String {
    message.chars().take(20_000).collect()
}
