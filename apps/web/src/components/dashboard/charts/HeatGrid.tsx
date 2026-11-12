import { cn } from "@/lib/utils";

const LEVELS = [
  "hatch",
  "bg-primary/20",
  "bg-primary/45",
  "bg-primary/70",
  "bg-primary",
] as const;

export const HEAT_LEGEND = [
  { level: 0, label: "None" },
  { level: 1, label: "Low" },
  { level: 2, label: "Some" },
  { level: 3, label: "Busy" },
  { level: 4, label: "Peak" },
] as const;

interface HeatGridProps {
  columns: readonly string[];
  rows: {
    label: string;
    cells: { level: 0 | 1 | 2 | 3 | 4; title: string }[];
  }[];
  label: string;
  className?: string;
}

/**
 * A grid of rounded tiles, quiet cells hatched and busy ones filled with the
 * brand colour. Server-rendered; each tile names its own value on hover.
 */
export function HeatGrid({ columns, rows, label, className }: HeatGridProps) {
  return (
    <div className={cn("min-w-0", className)}>
      <table
        aria-label={label}
        className="w-full table-fixed border-separate border-spacing-1.5"
      >
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th
                className="w-12 pr-1 text-right align-middle font-geist-mono text-[10.5px] font-normal text-muted-foreground"
                scope="row"
              >
                {row.label}
              </th>
              {row.cells.map((cell, index) => (
                <td className="p-0" key={columns[index]}>
                  <span
                    className={cn(
                      "block h-7 rounded-[7px] transition-transform duration-200 ease-out-expo hover:scale-[1.06]",
                      LEVELS[cell.level],
                    )}
                    title={cell.title}
                  >
                    <span className="sr-only">{cell.title}</span>
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td />
            {columns.map((column) => (
              <th
                className="pt-1 text-center font-geist-mono text-[10.5px] font-normal text-muted-foreground"
                key={column}
                scope="col"
              >
                {column}
              </th>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

/** The key under a heat grid: one swatch per level. */
export function HeatLegend({ className }: { className?: string }) {
  return (
    <ul
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-muted-foreground",
        className,
      )}
    >
      {HEAT_LEGEND.map((item) => (
        <li className="flex items-center gap-1.5" key={item.label}>
          <span className={cn("size-3 rounded-[4px]", LEVELS[item.level])} />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
