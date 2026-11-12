import { toast } from "sonner";

const MAX_FILE_BYTES = 25 * 1024 * 1024;

export interface CsvSource {
  key: string;
  name: string;
  text: string;
}

/** The CSV files among those picked or dropped, read as text in the browser. */
export async function readCsvFiles(files: File[]): Promise<CsvSource[]> {
  const csv = files.filter(
    (file) => /\.csv$/i.test(file.name) || file.type === "text/csv",
  );
  if (csv.length < files.length) toast.error("Only .csv files can be imported");
  const large = csv.find((file) => file.size > MAX_FILE_BYTES);
  if (large)
    toast.error(`${large.name} is over 25 MB; split it into smaller files`);
  return Promise.all(
    csv
      .filter((file) => file.size <= MAX_FILE_BYTES)
      .map(async (file) => ({
        key: `${file.name}:${file.size}:${file.lastModified}`,
        name: file.name,
        text: await file.text(),
      })),
  );
}
