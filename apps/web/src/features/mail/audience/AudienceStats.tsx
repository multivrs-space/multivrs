"use client";

import { StatStrip } from "@/components/dashboard/StatStrip";
import { useMailResources } from "@/features/mail/mail-context";

const count = new Intl.NumberFormat("en-US");

/** Everyone in the audience, and how many a broadcast can actually reach. */
export function AudienceStats() {
  const { audience } = useMailResources();
  return (
    <StatStrip
      stats={[
        { label: "All contacts", value: count.format(audience.total) },
        {
          label: "Subscribed",
          value: count.format(audience.subscribed),
          hint: "Get your broadcasts",
        },
        {
          label: "Unsubscribed",
          value: count.format(audience.unsubscribed),
          hint: "Never sent to again",
        },
      ]}
    />
  );
}
