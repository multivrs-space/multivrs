"use client";

import type { Project } from "@multivrs/client";
import Link from "next/link";
import { CopyButton } from "@/components/CopyButton";
import { DashCard } from "@/components/dashboard/DashCard";
import {
  type AnimatedIcon,
  LiveActivity,
  LiveArrowUpRight,
  LiveGlobe,
  LiveKeyRound,
  LiveRocket,
} from "@/components/icons/animated";
import { buttonVariants } from "@/components/ui/button-variants";
import { BuildPhases } from "@/features/dashboard/components/deployments/BuildPhases";
import type { BuildPhase } from "@/features/dashboard/lib/build-phases";
import { Object3DSlot } from "@/features/dashboard/three/Object3DSlot";

/** The moment the first build goes live: where it is, and what to do next. */
export function DeploySuccess({
  address,
  detailsHref,
  phases,
  project,
  total,
  username,
}: {
  address: string;
  detailsHref: string;
  phases: readonly BuildPhase[];
  project: Project;
  total: string | null;
  username: string;
}) {
  const base = `/${username}/${project.slug}`;
  const next: {
    icon: AnimatedIcon;
    title: string;
    body: string;
    href: string;
  }[] = [
    {
      icon: LiveGlobe,
      title: "Add a domain",
      body: "Put it on an address you own.",
      href: `${base}/domains`,
    },
    {
      icon: LiveActivity,
      title: "Watch traffic",
      body: "Visitors, pages and countries.",
      href: `${base}/analytics`,
    },
    {
      icon: LiveKeyRound,
      title: "Manage variables",
      body: "Keys and settings for builds.",
      href: `${base}/environment-variables`,
    },
  ];
  return (
    <div className="grid gap-3">
      <DashCard
        aria-label="Deployment ready"
        className="items-center px-6 pt-10 pb-8 text-center"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-1/2 size-[28rem] -translate-x-1/2 -translate-y-1/3 rounded-full bg-primary/15 blur-3xl"
        />
        <Object3DSlot
          className="relative size-40"
          label="A rocket, launched"
          parts={LiveRocket.parts}
        >
          <LiveRocket className="size-[42%]" strokeWidth={1.5} />
        </Object3DSlot>
        <p className="relative mt-3 font-geist-mono text-[10.5px] tracking-[0.16em] text-muted-foreground uppercase">
          Production{total ? ` · live in ${total}` : ""}
        </p>
        <h1 className="relative mt-2 text-[28px] leading-[1.05] font-semibold tracking-[-0.03em] text-foreground sm:text-[32px]">
          {project.name} is live
        </h1>
        <span className="surface-inset relative mt-5 flex h-10 max-w-full items-center gap-1 rounded-full pr-1 pl-4 font-geist-mono text-[12.5px]">
          <span className="truncate">
            {address.replace(/^https?:\/\//, "")}
          </span>
          <CopyButton className="size-8" text={address} />
        </span>
        <div className="relative mt-5 flex flex-wrap justify-center gap-2">
          <a
            className={buttonVariants({ size: "sm", variant: "hero" })}
            data-icon-trigger
            href={address}
            rel="noreferrer"
            target="_blank"
          >
            Visit site
            <LiveArrowUpRight strokeWidth={2} />
          </a>
          <Link
            className={buttonVariants({ size: "sm", variant: "raised" })}
            href={base}
          >
            Go to the project
          </Link>
        </div>
        <div className="relative mt-8 w-full max-w-3xl text-left">
          <BuildPhases phases={phases} />
          <Link
            className="mt-3 inline-block text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            href={detailsHref}
          >
            See the full build log
          </Link>
        </div>
      </DashCard>
      <ul className="grid gap-3 sm:grid-cols-3">
        {next.map((item) => (
          <li key={item.title}>
            <Link
              className="surface-card flex h-full items-start gap-3 rounded-card p-4 transition-transform hover:-translate-y-0.5"
              data-icon-trigger
              href={item.href}
            >
              <span className="surface-inset grid size-9 shrink-0 place-items-center rounded-[10px] text-primary">
                <item.icon className="size-4" strokeWidth={1.75} />
              </span>
              <span className="min-w-0">
                <span className="block text-[13.5px] font-semibold tracking-[-0.01em] text-foreground">
                  {item.title}
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {item.body}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
