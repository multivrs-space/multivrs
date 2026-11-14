import { getAdminOverview } from "@/app/admin/_actions/queries";
import { TrafficChart } from "@/components/dashboard/charts/TrafficChart";
import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import {
  formatWhole,
  percentChange,
  shareOf,
} from "@/components/dashboard/lib/format";
import { Metric } from "@/components/dashboard/Metric";
import { type Stat, StatStrip } from "@/components/dashboard/StatStrip";

export const instant = false;

function shortDay(day: string): string {
  return new Date(`${day}T00:00:00Z`).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
  });
}

function providerLabel(provider: string): string {
  const labels: Record<string, string> = {
    credential: "Email & password",
    github: "GitHub",
    google: "Google",
  };
  return labels[provider] ?? provider;
}

export default async function AdminOverviewPage() {
  const overview = await getAdminOverview();
  const unverified = overview.totalUsers - overview.verifiedUsers;
  const passwordless = overview.providerCounts
    .filter((entry) => entry.provider !== "credential")
    .reduce((sum, entry) => sum + entry.count, 0);

  const stats: Stat[] = [
    {
      label: "Verified emails",
      value: formatWhole(overview.verifiedUsers),
      hint: `${shareOf(overview.verifiedUsers, overview.totalUsers).toFixed(0)}% of all users`,
    },
    {
      label: "Unverified",
      value: formatWhole(unverified),
      hint: "Signed up, email not confirmed",
      tone: unverified > 0 ? "warn" : "default",
    },
    {
      label: "Active sessions",
      value: formatWhole(overview.activeSessions),
      hint: "Non-expired sessions right now",
    },
    {
      label: "Two-factor on",
      value: formatWhole(overview.usersWith2fa),
      hint: `${shareOf(overview.usersWith2fa, overview.totalUsers).toFixed(0)}% of all users`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-2">
        <DashCard className="p-5">
          <Metric
            delta={percentChange(
              overview.newLast30Days,
              overview.newPrevious30Days,
            )}
            label="Users, all time"
            value={formatWhole(overview.totalUsers)}
          />
          <p className="mt-3 text-[13px] text-muted-foreground">
            {formatWhole(overview.newLast7Days)} in the last 7 days ·{" "}
            {formatWhole(overview.newLast30Days)} in the last 30
          </p>
        </DashCard>
        <DashCard className="p-5">
          <StatStrip stats={stats} />
        </DashCard>
      </div>

      <DashCard>
        <DashCardHeader
          description="New accounts per day"
          title="Signups, last 30 days"
        />
        <div className="min-h-0 flex-1 p-5">
          <TrafficChart
            buckets={overview.trend.map((point) => ({
              label: shortDay(point.day),
              value: point.count,
            }))}
            valueLabel="signups"
          />
        </div>
      </DashCard>

      <DashCard>
        <DashCardHeader
          description="How people sign in, by credential"
          title="Sign-in methods"
        />
        {overview.providerCounts.length === 0 ? (
          <p className="p-5 text-[13px] text-muted-foreground">
            No linked credentials yet.
          </p>
        ) : (
          <ul className="divide-y divide-hairline px-5 pb-3">
            {overview.providerCounts.map((entry) => (
              <li
                className="flex items-center justify-between gap-3 py-2.5 text-[13px]"
                key={entry.provider}
              >
                <span className="text-foreground">
                  {providerLabel(entry.provider)}
                </span>
                <span className="figure font-semibold text-muted-foreground">
                  {formatWhole(entry.count)}
                  {" · "}
                  {shareOf(
                    entry.count,
                    overview.providerCounts.reduce(
                      (sum, item) => sum + item.count,
                      0,
                    ),
                  ).toFixed(0)}
                  %
                </span>
              </li>
            ))}
            {passwordless > 0 ? (
              <li className="text-[11.5px] text-muted-foreground">
                A user can hold more than one credential; rows count
                credentials, not people.
              </li>
            ) : null}
          </ul>
        )}
      </DashCard>
    </div>
  );
}
