import { DashCard } from "@/components/dashboard/DashCard";
import { LiveCloud, LiveGlobe } from "@/components/icons/animated";

/** How the records get published: by Multivrs, or by you at your provider. */
export function MailDomainSetupCard({ automatic }: { automatic: boolean }) {
  const Icon = automatic ? LiveCloud : LiveGlobe;
  return (
    <DashCard aria-label="DNS setup">
      <div className="flex items-start gap-4 p-5" data-icon-trigger>
        <span className="surface-inset grid size-10 shrink-0 place-items-center rounded-tile text-primary">
          <Icon className="size-5" strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold tracking-[-0.015em] text-foreground">
            {automatic
              ? "Set up automatically"
              : "Add these at your DNS provider"}
          </h2>
          <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-muted-foreground">
            {automatic
              ? "Multivrs runs this domain's DNS, so the sending records are added and checked for you. Nothing to change at a registrar."
              : "Keep the domain wherever it lives, like Namecheap, GoDaddy or Porkbun, and add the records below there. Multivrs notices when they go live."}
          </p>
        </div>
      </div>
    </DashCard>
  );
}
