import { useId } from "react";
import { cn } from "@/lib/utils";

export interface ShareColumn {
  label: string;
  /** Percentage of the whole, 0–100. */
  share: number;
  /** The remainder bucket, drawn hatched. */
  rest?: boolean;
}

interface ShareColumnsProps {
  columns: ShareColumn[];
  className?: string;
}

/**
 * Side-by-side columns sized against the largest share: the leader lit in
 * primary, the runners-up in ink, the remainder hatched.
 */
export function ShareColumns({ columns, className }: ShareColumnsProps) {
  const id = useId();
  const max = Math.max(...columns.map((column) => column.share), 1);

  return (
    <div className={cn("flex items-end gap-1.5", className)}>
      {columns.map((column, index) => {
        const height = Math.max(4, (column.share / max) * 100);
        const fill = column.rest
          ? `url(#${id}-hatch)`
          : index === 0
            ? `url(#${id}-lead)`
            : `url(#${id}-ink)`;
        return (
          <figure className="flex min-w-0 flex-1 flex-col" key={column.label}>
            <p className="figure text-[22px] font-semibold leading-none text-foreground">
              {Math.round(column.share)}%
            </p>
            <svg
              aria-hidden="true"
              className="mt-2 h-16 w-full"
              preserveAspectRatio="none"
              viewBox="0 0 10 100"
            >
              {index === 0 ? (
                <defs>
                  <linearGradient id={`${id}-lead`} x1="0" x2="0" y1="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="var(--primary)"
                      stopOpacity={0.9}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--primary)"
                      stopOpacity={0.15}
                    />
                  </linearGradient>
                  <linearGradient id={`${id}-ink`} x1="0" x2="0" y1="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="var(--foreground)"
                      stopOpacity={0.22}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--foreground)"
                      stopOpacity={0.04}
                    />
                  </linearGradient>
                  <pattern
                    height="4"
                    id={`${id}-hatch`}
                    patternTransform="rotate(45)"
                    patternUnits="userSpaceOnUse"
                    width="4"
                  >
                    <rect
                      fill="var(--primary)"
                      fillOpacity={0.45}
                      height="4"
                      width="1.4"
                    />
                  </pattern>
                </defs>
              ) : null}
              <rect
                fill={fill}
                height={height}
                width={10}
                x={0}
                y={100 - height}
              />
              <rect
                fill={
                  index === 0 ? "var(--primary)" : "var(--muted-foreground)"
                }
                height={2.5}
                opacity={index === 0 ? 1 : 0.6}
                width={10}
                x={0}
                y={100 - height}
              />
            </svg>
            <figcaption className="mt-1.5 truncate text-[11px] text-muted-foreground">
              {column.label}
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}
