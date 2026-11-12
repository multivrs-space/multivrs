"use client";

import { MoreHorizontal } from "lucide-react";
import { DASH_MENU, DASH_MENU_ITEM } from "@/components/dashboard/menu";
import { LiveSettings, LiveTrash } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DnsRecord } from "@/lib/domains/dns.types";
import { cn } from "@/lib/utils";

interface DnsRecordsTableProps {
  records: DnsRecord[];
  onEdit: (record: DnsRecord) => void;
  onRemove: (record: DnsRecord) => void;
}

/** Type, name, value and TTL per record, with edit and delete. */
export function DnsRecordsTable({
  records,
  onEdit,
  onRemove,
}: DnsRecordsTableProps) {
  if (!records.length) {
    return (
      <div className="px-5 py-14 text-center">
        <span className="mx-auto mb-3 block size-2 rounded-full bg-primary shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_20%,transparent)]" />
        <p className="text-[13.5px] font-medium">This zone is ready</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Add your first record to start routing traffic.
        </p>
      </div>
    );
  }
  return (
    <div className="p-2 pt-4">
      <div className="hidden grid-cols-[72px_minmax(0,1fr)_minmax(0,2fr)_80px_36px] gap-4 px-3 pb-2 font-geist-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70 md:grid">
        <span>Type</span>
        <span>Name</span>
        <span>Value</span>
        <span>TTL</span>
        <span />
      </div>
      <div className="divide-y divide-hairline">
        {records.map((record) => (
          <DnsRecordRow
            key={record.id}
            onEdit={onEdit}
            onRemove={onRemove}
            record={record}
          />
        ))}
      </div>
    </div>
  );
}

function DnsRecordRow({
  record,
  onEdit,
  onRemove,
}: {
  record: DnsRecord;
  onEdit: (record: DnsRecord) => void;
  onRemove: (record: DnsRecord) => void;
}) {
  return (
    <div className="grid grid-cols-[60px_minmax(0,1fr)_36px] items-center gap-3 rounded-tile px-3 py-3 transition-colors hover:bg-foreground/[0.025] md:grid-cols-[72px_minmax(0,1fr)_minmax(0,2fr)_80px_36px] md:gap-4">
      <span className="w-fit rounded-full bg-primary/10 px-2 py-0.5 font-geist-mono text-[11px] font-semibold text-primary">
        {record.type}
      </span>
      <div className="min-w-0">
        <p className="truncate font-geist-mono text-[12px]">{record.name}</p>
        <p className="mt-1 truncate font-geist-mono text-[11px] text-muted-foreground md:hidden">
          {record.value}
        </p>
      </div>
      <p
        className="hidden truncate font-geist-mono text-[12px] text-foreground/80 md:block"
        title={record.value}
      >
        {record.value}
        {record.priority !== null ? (
          <span className="ml-2 text-muted-foreground">
            prio {record.priority}
          </span>
        ) : null}
      </p>
      <span className="hidden text-[12px] text-muted-foreground md:block">
        {formatTtl(record.ttl)}
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label={`Actions for ${record.type} ${record.name}`}
            className="size-8 text-muted-foreground"
            size="icon-sm"
            variant="quiet"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className={cn(DASH_MENU, "w-40")}>
          <DropdownMenuItem
            className={DASH_MENU_ITEM}
            data-icon-trigger
            onClick={() => onEdit(record)}
          >
            <LiveSettings strokeWidth={1.75} />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className={cn(
              DASH_MENU_ITEM,
              "text-rose-600 focus:text-rose-600 dark:text-rose-400",
            )}
            data-icon-trigger
            onClick={() => onRemove(record)}
          >
            <LiveTrash strokeWidth={1.75} />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function formatTtl(ttl: number): string {
  if (ttl < 3600) return `${ttl / 60} min`;
  if (ttl < 86400) return `${ttl / 3600} hr`;
  return `${ttl / 86400} day`;
}
