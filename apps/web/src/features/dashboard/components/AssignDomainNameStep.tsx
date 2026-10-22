import SpecularButton from "@/components/SpecularButton";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AssignDomainNameStepProps {
  fullDomain: string;
  hostname: string;
  subdomain: string;
  onCancel(): void;
  onContinue(): void;
  onSubdomainChange(value: string): void;
}

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
      <DialogHeader className="space-y-1.5 text-left">
        <DialogTitle className="text-lg font-semibold text-foreground">
          Connect Domain
        </DialogTitle>
        <DialogDescription className="text-xs text-muted-foreground">
          Enter a subdomain to connect, or leave blank to use the apex.
        </DialogDescription>
      </DialogHeader>
      <div className="my-4 space-y-2">
        <label
          htmlFor="connected-domain"
          className="block text-xs font-medium text-foreground/80"
        >
          Domain
        </label>
        <div className="flex h-10 w-full items-center rounded-lg border border-border bg-muted px-3 text-sm focus-within:border-white/40">
          <input
            id="connected-domain"
            value={subdomain}
            onChange={(event) => onSubdomainChange(event.target.value)}
            placeholder="subdomain"
            className="w-full bg-transparent text-foreground outline-hidden placeholder:text-muted-foreground"
          />
          <span className="shrink-0 select-none text-sm text-muted-foreground">
            .{hostname}
          </span>
        </div>
        <p className="pt-1 text-xs text-muted-foreground">
          Will connect{" "}
          <span className="font-medium text-foreground/70">{fullDomain}</span>
        </p>
      </div>
      <DialogFooter className="flex items-center justify-between pt-2 sm:justify-between">
        <SpecularButton
          size="sm"
          tint="#ffffff"
          tintOpacity={0.05}
          lineColor="#666666"
          baseColor="#333333"
          textColor="#cccccc"
          onClick={onCancel}
        >
          Cancel
        </SpecularButton>
        <SpecularButton
          size="sm"
          tint="#ffffff"
          tintOpacity={0.9}
          lineColor="#ffffff"
          baseColor="#ffffff"
          textColor="#000000"
          onClick={onContinue}
        >
          Continue
        </SpecularButton>
      </DialogFooter>
    </>
  );
}
