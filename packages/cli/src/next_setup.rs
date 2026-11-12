//! Next.js builds run through OpenNext, which refuses to start without an
//! `open-next.config.ts`, and that file only compiles when the project can
//! import `@opennextjs/cloudflare`. Projects that never set OpenNext up get
//! both in the build checkout. Nothing is written back to the repository.

use anyhow::Result;
use std::fs;
use std::path::Path;

/// Pinned so every build gets the adapter version Multivrs was tested with.
pub(crate) const OPENNEXT_VERSION: &str = "1.20.13";
pub(crate) const OPENNEXT_CONFIG: &str = "open-next.config.ts";

/// OpenNext's own default config, without the R2 cache the platform doesn't provision.
const DEFAULT_CONFIG: &str = r#"// Added by Multivrs for this build only; your repository is unchanged.
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({});
"#;

/// Next.js runs without a config file; OpenNext insists on finding one.
const NEXT_CONFIGS: [&str; 5] = [
    "next.config.js",
    "next.config.mjs",
    "next.config.cjs",
    "next.config.ts",
    "next.config.mts",
];

/// What a Next.js project still needs before OpenNext can build it.
#[derive(Debug, PartialEq, Eq)]
pub(crate) struct NextSetup {
    pub(crate) install_adapter: bool,
    pub(crate) write_config: bool,
    pub(crate) write_next_config: bool,
}

pub(crate) fn next_setup(cwd: &Path) -> NextSetup {
    let write_config = !cwd.join(OPENNEXT_CONFIG).exists();
    NextSetup {
        install_adapter: write_config && !depends_on(cwd, "@opennextjs/cloudflare"),
        write_config,
        write_next_config: !NEXT_CONFIGS.iter().any(|name| cwd.join(name).exists()),
    }
}

/// An empty Next.js config: the same as having none, but OpenNext can see it.
pub(crate) fn write_empty_next_config(cwd: &Path) -> Result<()> {
    fs::write(cwd.join("next.config.mjs"), "export default {};\n")?;
    Ok(())
}

/// The command that adds the pinned adapter to the checkout, when it's missing.
pub(crate) fn adapter_install_command(bun: &str) -> String {
    format!("{bun} add --dev @opennextjs/cloudflare@{OPENNEXT_VERSION}")
}

pub(crate) fn write_default_config(cwd: &Path) -> Result<()> {
    fs::write(cwd.join(OPENNEXT_CONFIG), DEFAULT_CONFIG)?;
    Ok(())
}

fn depends_on(cwd: &Path, name: &str) -> bool {
    let Ok(text) = fs::read_to_string(cwd.join("package.json")) else {
        return false;
    };
    let Ok(manifest) = serde_json::from_str::<serde_json::Value>(&text) else {
        return false;
    };
    ["dependencies", "devDependencies"].iter().any(|field| {
        manifest
            .get(field)
            .and_then(|deps| deps.get(name))
            .is_some()
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn a_bare_next_project_needs_the_adapter_and_a_config() {
        let dir = tempfile::tempdir().unwrap();
        fs::write(
            dir.path().join("package.json"),
            r#"{"dependencies":{"next":"16.2.9"}}"#,
        )
        .unwrap();
        assert_eq!(
            next_setup(dir.path()),
            NextSetup {
                install_adapter: true,
                write_config: true,
                write_next_config: true
            }
        );
        write_default_config(dir.path()).unwrap();
        write_empty_next_config(dir.path()).unwrap();
        let config = fs::read_to_string(dir.path().join(OPENNEXT_CONFIG)).unwrap();
        assert!(config.contains("defineCloudflareConfig"));
        assert_eq!(
            next_setup(dir.path()),
            NextSetup {
                install_adapter: false,
                write_config: false,
                write_next_config: false
            }
        );
    }

    #[test]
    fn an_installed_adapter_is_reused_and_an_existing_config_is_left_alone() {
        let dir = tempfile::tempdir().unwrap();
        fs::write(
            dir.path().join("package.json"),
            r#"{"devDependencies":{"@opennextjs/cloudflare":"^1.0.0"}}"#,
        )
        .unwrap();
        fs::write(dir.path().join("next.config.ts"), "export default {};").unwrap();
        assert_eq!(
            next_setup(dir.path()),
            NextSetup {
                install_adapter: false,
                write_config: true,
                write_next_config: false
            }
        );
        assert_eq!(
            adapter_install_command("bun"),
            format!("bun add --dev @opennextjs/cloudflare@{OPENNEXT_VERSION}")
        );
    }
}
