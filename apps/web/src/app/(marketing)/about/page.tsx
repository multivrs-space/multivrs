import type { Metadata } from "next";
import { ComingSoonPage } from "@/components/marketing/ComingSoonPage";

export const metadata: Metadata = {
  title: "Multivrs | About",
  description:
    "We're building Multivrs to bring app deployment, domains, email, and cloud infrastructure together in one platform.",
};

export default function AboutPage() {
  return <ComingSoonPage />;
}
