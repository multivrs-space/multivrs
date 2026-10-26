import type { Metadata } from "next";
import { NewProjectFlow } from "@/features/dashboard/components/NewProjectFlow";

/** Reads the URL and session at request time, like the rest of the dashboard. */
export const instant = false;

export const metadata: Metadata = {
  title: "New Project — Multivrs",
  description: "Import a Git repository and deploy it on Multivrs",
};

export default async function NewProjectPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return <NewProjectFlow username={username} />;
}
