import type { Metadata } from "next";
import { ComingSoonPage } from "@/components/marketing/ComingSoonPage";

export const metadata: Metadata = {
  title: "Multivrs | Fluid Compute",
  description: "Multivrs Fluid Compute & Serverless Runtime.",
};

export default function FluidPage() {
  return <ComingSoonPage />;
}
