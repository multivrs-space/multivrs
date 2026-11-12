"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  LiveLogOut,
  LiveMonitor,
  LiveSmartphone,
} from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import { MethodRow } from "@/features/dashboard/components/account/auth/MethodRow";
import {
  SettingsCard,
  SettingsCardBody,
} from "@/features/dashboard/components/settings/SettingsCard";
import { describeDevice } from "@/features/dashboard/lib/describe-device";
import { relativeTime } from "@/features/dashboard/lib/relative-time";
import type { AccountSession } from "@/features/dashboard/types/account-security.types";
import { authClient } from "@/lib/auth-client";

/** Browsers and devices signed in right now; sign out any you don't know. */
export function SessionsCard({ sessions }: { sessions: AccountSession[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const others = sessions.filter((session) => !session.current);

  function run(
    key: string,
    work: () => Promise<{ error?: unknown }>,
    done: string,
    failed: string,
  ) {
    setBusy(key);
    void work()
      .then((result) => {
        if (result.error) return void toast.error(failed);
        toast.success(done);
        router.refresh();
      })
      .catch(() => toast.error(failed))
      .finally(() => setBusy(null));
  }

  return (
    <SettingsCard id="sessions">
      <SettingsCardBody
        aside={
          others.length ? (
            <Button
              data-icon-trigger
              disabled={busy === "others"}
              onClick={() =>
                run(
                  "others",
                  () => authClient.revokeOtherSessions(),
                  "Signed out everywhere else.",
                  "Couldn't sign out the other sessions.",
                )
              }
              size="sm"
              variant="raised"
            >
              <LiveLogOut strokeWidth={1.75} />
              {busy === "others" ? "Signing out…" : "Sign out others"}
            </Button>
          ) : null
        }
        description="Signed in right now. Sign out anything you don't recognise."
        icon={LiveMonitor}
        title="Active sessions"
      >
        <ul className="divide-y divide-hairline">
          {sessions.map((session) => {
            const device = describeDevice(session.userAgent);
            const Icon = device.mobile ? LiveSmartphone : LiveMonitor;
            return (
              <MethodRow
                detail={
                  <span suppressHydrationWarning>
                    {[
                      session.ipAddress,
                      `Active ${relativeTime(session.lastActiveAt)}`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                }
                icon={<Icon className="size-4" strokeWidth={1.75} />}
                key={session.id}
                title={
                  <>
                    {device.label}
                    {session.current ? (
                      <span className="rounded-full bg-primary/10 px-1.5 text-[10.5px] font-medium text-primary">
                        This device
                      </span>
                    ) : null}
                  </>
                }
              >
                {session.current ? null : (
                  <Button
                    disabled={busy === session.id}
                    onClick={() =>
                      run(
                        session.id,
                        () =>
                          authClient.revokeSession({ token: session.token }),
                        "Session signed out.",
                        "That session couldn't be signed out.",
                      )
                    }
                    size="sm"
                    variant="quiet"
                  >
                    {busy === session.id ? "Signing out…" : "Sign out"}
                  </Button>
                )}
              </MethodRow>
            );
          })}
        </ul>
      </SettingsCardBody>
    </SettingsCard>
  );
}
