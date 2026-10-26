import type { Metadata } from "next";
import { Suspense } from "react";
import { NewProjectImportFlow } from "@/features/dashboard/components/NewProjectImportFlow";

/** Reads the URL and session at request time, like the rest of the dashboard. */
export const instant = false;

export const metadata: Metadata = {
  title: "Configure Project — Multivrs",
  description:
    "Review the detected framework and deploy a repository on Multivrs",
};

export default async function NewProjectImportPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return (
    <Suspense
      fallback={
        <div className="px-5 py-6 text-sm text-muted-foreground lg:px-8">
          Loading repository…
        </div>
      }
    >
      <NewProjectImportFlow
        username={username}
        deploymentDomain={
          process.env.MULTIVRS_DEPLOYMENT_DOMAIN ?? "multivrs.app"
        }
      />
    </Suspense>
  );
}
