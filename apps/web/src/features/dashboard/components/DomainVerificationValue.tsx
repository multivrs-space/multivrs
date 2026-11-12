import { CopyButton } from "@/components/CopyButton";

interface DomainVerificationValueProps {
  label: string;
  value: string;
  copy?: boolean;
}

/** A record value to paste at a registrar, with a copy key. */
export function DomainVerificationValue({
  label,
  value,
  copy = false,
}: DomainVerificationValueProps) {
  return (
    <div className="min-w-0 bg-card p-3">
      <p className="mb-1 font-geist-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <div className="flex items-center gap-2">
        <code className="min-w-0 truncate font-geist-mono text-[11.5px] text-foreground/85">
          {value}
        </code>
        {copy ? <CopyButton className="ml-auto size-7" text={value} /> : null}
      </div>
    </div>
  );
}
