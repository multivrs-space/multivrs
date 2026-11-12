import { formatCompact, shareOf } from "@/components/dashboard/lib/format";
import { cn } from "@/lib/utils";

export interface RankedRow {
  label: string;
  value: number;
}

interface RankedRowsProps {
  rows: RankedRow[];
  /** Column header for the label, e.g. "Page" or "Referrer". */
  labelHeading: string;
  valueHeading: string;
  /** Render labels in mono, for paths and hosts. */
  mono?: boolean;
  className?: string;
}

/**
 * A ranked table: label, value, and a share track with a marker at the
 * row's share of the total. Rows are real table rows for screen readers.
 */
export function RankedRows({
  rows,
  labelHeading,
  valueHeading,
  mono = false,
  className,
}: RankedRowsProps) {
  const total = rows.reduce((sum, row) => sum + row.value, 0);

  return (
    <table className={cn("w-full table-fixed text-[13px]", className)}>
      <thead>
        <tr className="text-left font-geist-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70">
          <th className="w-[46%] pb-2 font-normal">{labelHeading}</th>
          <th className="w-[18%] pb-2 text-right font-normal">
            {valueHeading}
          </th>
          <th className="pb-2 pl-6 font-normal">Share</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const share = shareOf(row.value, total);
          return (
            <tr
              className="group/row border-t border-hairline transition-colors hover:bg-foreground/[0.025]"
              key={row.label}
            >
              <td
                className={cn(
                  "truncate py-2.5 pr-3 text-foreground",
                  mono && "font-geist-mono text-[12px]",
                )}
                title={row.label}
              >
                {row.label}
              </td>
              <td className="figure py-2.5 text-right font-medium text-foreground">
                {formatCompact(row.value)}
              </td>
              <td className="py-2.5 pl-6">
                <div className="flex items-center gap-2.5">
                  <svg
                    aria-hidden="true"
                    className="h-2 min-w-0 flex-1 overflow-visible"
                    preserveAspectRatio="none"
                    viewBox="0 0 100 8"
                  >
                    <rect
                      className="fill-foreground/[0.08]"
                      height={2}
                      width={100}
                      y={3}
                    />
                    <rect
                      className="fill-primary"
                      height={2}
                      width={share}
                      y={3}
                    />
                    <rect
                      className="fill-primary"
                      height={8}
                      width={1.6}
                      x={Math.max(0, share - 0.8)}
                    />
                  </svg>
                  <span className="figure w-11 shrink-0 text-right text-xs text-muted-foreground">
                    {share.toFixed(share < 10 ? 1 : 0)}%
                  </span>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
