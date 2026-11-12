/** Ask for the build machine to start booting; nothing waits on the answer. */
export function warmBuildMachine(
  target: { account: string } | { projectId: string },
) {
  void fetch("/api/build/warm", {
    body: JSON.stringify(target),
    headers: { "content-type": "application/json" },
    method: "POST",
  }).catch(() => undefined);
}
