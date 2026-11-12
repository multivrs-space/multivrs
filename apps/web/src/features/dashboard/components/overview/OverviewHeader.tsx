import Link from "next/link";
import { LiveMail, LivePlus } from "@/components/icons/animated";
import { buttonVariants } from "@/components/ui/button-variants";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";
import { overviewViewer } from "@/features/dashboard/components/overview/overview-data";

/** A greeting, what this page is, and the two things people start most. */
export async function OverviewHeader({
  username: workspace,
}: {
  username: Promise<string>;
}) {
  const username = await workspace;
  const { firstName } = await overviewViewer(username);
  return (
    <DashboardPageHeader
      actions={
        <>
          <Link
            className={buttonVariants({ size: "sm", variant: "raised" })}
            data-icon-trigger
            href={`/${username}/~/emails?view=overview&compose=1`}
          >
            <LiveMail strokeWidth={1.75} />
            Compose
          </Link>
          <Link
            className={buttonVariants({ size: "sm", variant: "hero" })}
            data-icon-trigger
            href={`/${username}/new`}
          >
            <LivePlus strokeWidth={2} />
            New project
          </Link>
        </>
      }
      description="Hosting, traffic, builds and mail across the whole workspace, in one place."
      eyebrow={`${username} · Overview`}
      title={`Welcome back, ${firstName}`}
    />
  );
}
