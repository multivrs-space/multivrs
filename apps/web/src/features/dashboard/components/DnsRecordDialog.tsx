"use client";

import { useReducer } from "react";
import { DashDialogHeader } from "@/components/dashboard/DashDialogHeader";
import { DASH_DIALOG } from "@/components/dashboard/menu";
import { LiveNetwork } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import type { DnsRecordInput } from "@/features/dashboard/domain-dns-api";
import type { DnsRecord, DnsRecordType } from "@/lib/domains/dns.types";
import { DnsRecordFields } from "./DnsRecordFields";

interface DnsRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record?: DnsRecord;
  pending: boolean;
  onSubmit: (record: DnsRecordInput) => void;
}

export function DnsRecordDialog({
  open,
  onOpenChange,
  record,
  pending,
  onSubmit,
}: DnsRecordDialogProps) {
  const [state, update] = useReducer(
    (current: RecordFormState, patch: Partial<RecordFormState>) => ({
      ...current,
      ...patch,
    }),
    record,
    initialState,
  );

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({
      name: state.name,
      type: state.type,
      value: state.value,
      ttl: state.ttl,
      priority:
        state.type === "MX" || state.type === "SRV"
          ? Number(state.priority)
          : null,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={DASH_DIALOG}>
        <form onSubmit={submit} className="grid gap-6">
          <DashDialogHeader
            description="Changes publish to the authoritative DNS within a minute."
            icon={LiveNetwork}
            title={record ? "Edit DNS record" : "Add DNS record"}
          />
          <DnsRecordFields
            name={state.name}
            setName={(name) => update({ name })}
            type={state.type}
            setType={(type) => update({ type })}
            value={state.value}
            setValue={(value) => update({ value })}
            ttl={state.ttl}
            setTtl={(ttl) => update({ ttl })}
            priority={state.priority}
            setPriority={(priority) => update({ priority })}
          />
          <DialogFooter className="gap-2">
            <Button
              onClick={() => onOpenChange(false)}
              size="sm"
              type="button"
              variant="quiet"
            >
              Cancel
            </Button>
            <Button disabled={pending} size="sm" type="submit" variant="hero">
              {pending ? "Saving…" : "Save record"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface RecordFormState {
  name: string;
  type: DnsRecordType;
  value: string;
  ttl: number;
  priority: string;
}

function initialState(record?: DnsRecord): RecordFormState {
  return {
    name: record?.name ?? "@",
    type: record?.type ?? "A",
    value: record?.value ?? "",
    ttl: record?.ttl ?? 3600,
    priority: String(record?.priority ?? 10),
  };
}
