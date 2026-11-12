import { DashDialogHeader } from "@/components/dashboard/DashDialogHeader";
import { DASH_FIELD } from "@/components/dashboard/menu";
import { LiveGlobe } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface AssignDomainNameStepProps {
  fullDomain: string;
  hostname: string;
  subdomain: string;
  onCancel(): void;
  onContinue(): void;
  onSubdomainChange(value: string): void;
}

/** Step 1 of 2: choose the subdomain (or the apex) to connect. */
export function AssignDomainNameStep({
  fullDomain,
  hostname,
  subdomain,
  onCancel,
  onContinue,
  onSubdomainChange,
}: AssignDomainNameStepProps) {
  return (
    <>
      <DashDialogHeader
        description="Enter a subdomain to connect, or leave it blank to use the apex."
        icon={LiveGlobe}
        title="Connect domain · 1 of 2"
      />
      <div className="space-y-1.5">
        <label className="block text-xs font-medium" htmlFor="connected-domain">
          Domain
        </label>
        <div
          className={cn(
            DASH_FIELD,
            "flex items-center px-3 font-geist-mono focus-within:ring-2 focus-within:ring-ring/50",
          )}
        >
          <input
            className="min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground/60"
            id="connected-domain"
            onChange={(event) => onSubdomainChange(event.target.value)}
            placeholder="subdomain"
            value={subdomain}
          />
          <span className="shrink-0 select-none text-muted-foreground">
            .{hostname}
          </span>
        </div>
        <p className="pt-1 text-xs text-muted-foreground">
          Will connect{" "}
          <span className="font-geist-mono text-foreground">{fullDomain}</span>
        </p>
      </div>
      <DialogFooter className="gap-2">
        <Button onClick={onCancel} size="sm" type="button" variant="quiet">
          Cancel
        </Button>
        <Button onClick={onContinue} size="sm" type="button" variant="hero">
          Continue
        </Button>
      </DialogFooter>
    </>
  );
}
