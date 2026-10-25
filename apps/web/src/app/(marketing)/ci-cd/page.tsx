import type { Metadata } from "next";
import { ComingSoonPage } from "@/components/marketing/ComingSoonPage";

export const metadata: Metadata = {
  title: "Multivrs | CI/CD",
  description: "Multivrs Automated Continuous Integration & Deployment.",
};

export default function CiCdPage() {
  return <ComingSoonPage />;
}
