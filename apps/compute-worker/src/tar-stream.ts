/**
 * A streaming ustar archive, so a waking container receives the whole app in
 * one `tar -x` instead of one command per file. Files are read in order and
 * never held in memory as a whole.
 */

const BLOCK = 512;
const encoder = new TextEncoder();

export interface TarEntry {
  path: string;
  size: number;
  body: ReadableStream<Uint8Array>;
}

/** Fit a path into ustar's name (100 bytes) and prefix (155 bytes) fields. */
export function ustarPath(path: string): { name: string; prefix: string } | null {
  if (encoder.encode(path).length <= 100) return { name: path, prefix: "" };
  for (let index = path.length - 1; index > 0; index -= 1) {
    if (path[index] !== "/") continue;
    const prefix = path.slice(0, index);
    const name = path.slice(index + 1);
    if (name && encoder.encode(name).length <= 100 && encoder.encode(prefix).length <= 155) {
      return { name, prefix };
    }
  }
  return null;
}

export function tarHeader(path: string, size: number, mtime: number): Uint8Array {
  const split = ustarPath(path);
  if (!split) throw new Error(`Path is too long for the runtime archive: ${path}`);
  const header = new Uint8Array(BLOCK);
  const write = (value: string, offset: number, length: number) =>
    header.set(encoder.encode(value).subarray(0, length), offset);
  const octal = (value: number, length: number) =>
    `${value.toString(8).padStart(length - 1, "0")}\0`;
  write(split.name, 0, 100);
  write("0000644\0", 100, 8);
  write("0000000\0", 108, 8);
  write("0000000\0", 116, 8);
  write(octal(size, 12), 124, 12);
  write(octal(mtime, 12), 136, 12);
  write("        ", 148, 8);
  write("0", 156, 1);
  write("ustar\0", 257, 6);
  write("00", 263, 2);
  write(split.prefix, 345, 155);
  const checksum = header.reduce((sum, byte) => sum + byte, 0);
  write(`${checksum.toString(8).padStart(6, "0")}\0 `, 148, 8);
  return header;
}

async function* tarChunks(entries: AsyncIterable<TarEntry>, mtime: number) {
  for await (const entry of entries) {
    yield tarHeader(entry.path, entry.size, mtime);
    let written = 0;
    const reader = entry.body.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      written += value.byteLength;
      yield value;
    }
    if (written !== entry.size) throw new Error(`Size changed while reading ${entry.path}`);
    const padding = (BLOCK - (entry.size % BLOCK)) % BLOCK;
    if (padding) yield new Uint8Array(padding);
  }
  // Two empty blocks end the archive.
  yield new Uint8Array(BLOCK * 2);
}

export function tarStream(entries: AsyncIterable<TarEntry>): ReadableStream<Uint8Array> {
  const chunks = tarChunks(entries, Math.floor(Date.now() / 1_000))[Symbol.asyncIterator]();
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      const next = await chunks.next();
      if (next.done) controller.close();
      else controller.enqueue(next.value);
    },
    async cancel() {
      await chunks.return?.(undefined);
    },
  });
}
