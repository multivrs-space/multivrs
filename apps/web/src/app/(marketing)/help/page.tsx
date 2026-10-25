import type { Metadata } from "next";
import { ComingSoonPage } from "@/components/marketing/ComingSoonPage";

export const metadata: Metadata = {
  title: "Multivrs | Help Center",
  description: "Knowledge base, troubleshooting guides, and support resources.",
};

export default function HelpPage() {
  return <ComingSoonPage />;
}
