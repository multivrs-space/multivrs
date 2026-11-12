import { prisma } from "@/lib/prisma";

export async function appendRunnerLog(
  deploymentId: string,
  message: string,
): Promise<void> {
  await prisma.deploymentLog.create({
    data: { deploymentId, level: "info", message },
  });
}

/**
 * Batch a running command's output into build log lines, about every
 * second and a half, so the deployment page can follow it live.
 */
export function createRunnerLogStream(deploymentId: string) {
  let buffer = "";
  let timer: ReturnType<typeof setTimeout> | null = null;
  let writes: Promise<unknown> = Promise.resolve();
  const flush = () => {
    if (timer) clearTimeout(timer);
    timer = null;
    const message = buffer.trim();
    buffer = "";
    if (!message) return writes;
    writes = writes
      .then(() =>
        prisma.deploymentLog.create({
          data: {
            deploymentId,
            level: "info",
            message: message.slice(0, 20_000),
          },
        }),
      )
      .catch(() => undefined);
    return writes;
  };
  return {
    write(text: string) {
      buffer += text;
      if (buffer.length >= 4_000) void flush();
      else timer ??= setTimeout(() => void flush(), 1_500);
    },
    /** Write what's left; await before reporting the build's outcome. */
    close: flush,
  };
}
