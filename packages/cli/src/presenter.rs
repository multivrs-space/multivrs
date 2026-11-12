//! What a customer sees of their build: Multivrs steps and their framework's
//! own output. Never the adapters, caches and colour codes underneath.

use crate::framework::Framework;
use std::time::Duration;

/// Lines that describe the platform's plumbing, not the customer's app. Only
/// adapter output: a customer's own tools (even wrangler) always show.
const HIDDEN: [&str; 10] = [
    "OpenNext",
    "@opennextjs/",
    "opennextjs-cloudflare",
    "workerd compatibility_date",
    "# copyPackageTemplateFiles",
    "Applying code patches",
    "Worker saved in",
    "Resolving dependencies",
    "Resolved, downloaded and extracted",
    "Saved lockfile",
];

/// Adapter progress worth keeping, in our words.
const RENAMED: [(&str, &str); 4] = [
    ("Bundling the OpenNext server", "Packaging the server"),
    ("OpenNext build complete", "Server package ready"),
    ("Bundling middleware function", "Packaging middleware"),
    ("Bundling static assets", "Packaging static assets"),
];

/// One line of tool output as the customer should read it, or `None` to hide it.
pub(crate) fn present_line(raw: &str) -> Option<String> {
    let line = strip_ansi(raw);
    let trimmed = line.trim();
    for (from, to) in RENAMED {
        if trimmed.contains(from) {
            return Some(to.to_string());
        }
    }
    if is_box_border(trimmed) || HIDDEN.iter().any(|needle| trimmed.contains(needle)) {
        return None;
    }
    Some(scrub_tool_paths(&line))
}

/// "Installing dependencies with bun", or the customer's own command verbatim.
pub(crate) fn install_label(command: &str, custom: bool) -> String {
    if custom {
        return format!("Installing dependencies: {command}");
    }
    let manager = ["pnpm", "yarn", "npm", "bun"]
        .into_iter()
        .find(|name| command.contains(name))
        .unwrap_or("the project's package manager");
    format!("Installing dependencies with {manager}")
}

/// "Building with Next.js", or the customer's own build command verbatim.
pub(crate) fn build_label(framework: Framework, command: &str, custom: bool) -> String {
    if custom {
        format!("Running build command: {command}")
    } else {
        format!("Building with {}", framework.name())
    }
}

/// The line that best explains a failed step, already cleaned for display.
pub(crate) fn failure_reason(output: &str) -> Option<String> {
    let lines: Vec<String> = output.lines().filter_map(present_line).collect();
    lines
        .iter()
        .rev()
        .find(|line| {
            let lower = line.to_lowercase();
            (lower.contains("error") || lower.contains("failed"))
                && !line.trim_start().starts_with("at ")
        })
        .or_else(|| lines.iter().rev().find(|line| !line.trim().is_empty()))
        .map(|line| line.trim().chars().take(300).collect())
}

/// "0.8s", "2.7s", "14s": tenths only while they still matter.
pub(crate) fn duration(elapsed: Duration) -> String {
    let seconds = elapsed.as_secs_f64();
    if seconds < 10.0 {
        format!("{seconds:.1}s")
    } else {
        format!("{seconds:.0}s")
    }
}

fn is_box_border(line: &str) -> bool {
    !line.is_empty() && line.chars().all(|c| "┌┐└┘─│├┤ ".contains(c))
}

/// Remove escape sequences such as `ESC[36m` so logs read as plain text.
fn strip_ansi(text: &str) -> String {
    let mut out = String::with_capacity(text.len());
    let mut chars = text.chars().peekable();
    while let Some(c) = chars.next() {
        if c == '\u{1b}' && chars.peek() == Some(&'[') {
            chars.next();
            for next in chars.by_ref() {
                if ('@'..='~').contains(&next) {
                    break;
                }
            }
        } else {
            out.push(c);
        }
    }
    out
}

/// Drop one-off tool cache paths (`file:///tmp/bunx-…/node_modules/`) from stack lines.
fn scrub_tool_paths(line: &str) -> String {
    let mut out = line.to_string();
    while let Some(start) = out.find("/tmp/bunx-") {
        let Some(offset) = out[start..].find("node_modules/") else {
            break;
        };
        let from = if out[..start].ends_with("file://") {
            start - 7
        } else {
            start
        };
        out.replace_range(from..start + offset + "node_modules/".len(), "");
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn hides_adapter_banners_and_colour_codes() {
        assert_eq!(present_line("│ OpenNext — Cloudflare build │"), None);
        assert_eq!(present_line("┌─────────────────────────────┐"), None);
        assert_eq!(
            present_line("Resolved, downloaded and extracted [1224]"),
            None
        );
        assert_eq!(
            present_line("\u{1b}[32m✓\u{1b}[0m server ready").as_deref(),
            Some("✓ server ready")
        );
        assert_eq!(
            present_line("Bundling the OpenNext server...").as_deref(),
            Some("Packaging the server")
        );
        assert_eq!(
            present_line("✓ Compiled successfully in 2.1s").as_deref(),
            Some("✓ Compiled successfully in 2.1s")
        );
    }

    #[test]
    fn scrubs_tool_cache_paths() {
        assert_eq!(
            present_line(
                "    at build (file:///tmp/bunx-0-x@latest/node_modules/next/dist/build.js:9:1)"
            )
            .as_deref(),
            Some("    at build (next/dist/build.js:9:1)")
        );
    }

    #[test]
    fn labels_steps_in_plain_words() {
        assert_eq!(
            install_label(
                "NODE_ENV=development '/usr/local/bin/bun' install --frozen-lockfile",
                false
            ),
            "Installing dependencies with bun"
        );
        assert_eq!(
            install_label("pnpm i", true),
            "Installing dependencies: pnpm i"
        );
        assert_eq!(
            build_label(Framework::Next, "x", false),
            "Building with Next.js"
        );
        assert_eq!(
            build_label(Framework::Next, "next build", true),
            "Running build command: next build"
        );
    }

    #[test]
    fn durations_read_like_a_build_log() {
        assert_eq!(duration(Duration::from_millis(840)), "0.8s");
        assert_eq!(duration(Duration::from_millis(2_700)), "2.7s");
        assert_eq!(duration(Duration::from_millis(14_200)), "14s");
    }

    #[test]
    fn explains_a_failure_in_one_line() {
        let output = "info\n\u{1b}[31mError: Cannot find module 'x'\u{1b}[0m\n    at load (file:///tmp/bunx-0-a/node_modules/m.js:1:1)\n";
        assert_eq!(
            failure_reason(output).as_deref(),
            Some("Error: Cannot find module 'x'")
        );
        assert_eq!(failure_reason("").as_deref(), None);
    }
}
