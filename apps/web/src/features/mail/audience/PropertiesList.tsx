"use client";

import { CopyButton } from "@/components/CopyButton";
import { DashCard } from "@/components/dashboard/DashCard";
import { useMailResources } from "@/features/mail/mail-context";

const count = new Intl.NumberFormat("en-US");

const BUILT_IN = [
  { key: "first_name", about: "From the contact's name" },
  { key: "last_name", about: "From the contact's name" },
  { key: "email", about: "Their address" },
];

function Row({
  tag,
  about,
  meta,
}: {
  tag: string;
  about: string;
  meta?: string;
}) {
  return (
    <li className="flex items-center gap-3 px-5 py-2.5">
      <code className="min-w-0 truncate font-geist-mono text-[12.5px] text-foreground">{`{{${tag}}}`}</code>
      <span className="min-w-0 flex-1 truncate text-[12.5px] text-muted-foreground">
        {about}
      </span>
      {meta ? (
        <span className="hidden shrink-0 font-geist-mono text-[11.5px] text-muted-foreground sm:inline">
          {meta}
        </span>
      ) : null}
      <CopyButton className="size-7 shrink-0" text={`{{${tag}}}`} />
    </li>
  );
}

/**
 * Properties are facts about each contact (company, plan, city) that a
 * broadcast can write in for every person. They come from columns kept when
 * importing a CSV.
 */
export function PropertiesList() {
  const { audience } = useMailResources();
  return (
    <div className="space-y-3">
      <DashCard
        aria-label="How properties work"
        className="px-5 py-4 text-[13px] leading-relaxed text-muted-foreground"
      >
        Put a property in a broadcast's subject or body and each person gets
        their own value:{" "}
        <code className="font-geist-mono text-foreground">
          {"Hi {{first_name|there}}"}
        </code>{" "}
        reads “Hi Ada”, or “Hi there” when a contact has no first name. Add your
        own properties by keeping extra columns when you import a CSV.
      </DashCard>
      <DashCard aria-label="Properties">
        <p className="px-5 pt-4 pb-1 font-geist-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70">
          Every contact
        </p>
        <ul className="divide-y divide-hairline">
          {BUILT_IN.map((item) => (
            <Row about={item.about} key={item.key} tag={item.key} />
          ))}
        </ul>
        <p className="border-t border-hairline px-5 pt-4 pb-1 font-geist-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70">
          Your properties · {audience.properties.length}
        </p>
        {audience.properties.length ? (
          <ul className="divide-y divide-hairline">
            {audience.properties.map((property) => (
              <Row
                about={`e.g. ${property.example}`}
                key={property.key}
                meta={`${count.format(property.contacts)} contacts`}
                tag={property.key}
              />
            ))}
          </ul>
        ) : (
          <p className="px-5 pt-1 pb-5 text-[12.5px] text-muted-foreground">
            None yet. Import a CSV and keep columns like company or plan to add
            some.
          </p>
        )}
      </DashCard>
    </div>
  );
}
