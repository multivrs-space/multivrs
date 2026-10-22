import { Skeleton } from "@/components/ui/skeleton";

const METADATA_FIELDS = [
  "expiration",
  "renewal",
  "registrar",
  "renewal-mode",
  "registered",
  "nameservers",
  "certificate",
] as const;

export default function LoadingDomainDns() {
  return (
    <div className="w-full px-8 py-6">
      {/* Top Breadcrumb Skeleton */}
      <Skeleton className="h-4 w-44 mb-4 bg-muted" />

      {/* Title & Action Bar Skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-64 rounded-lg bg-muted" />
          <Skeleton className="h-6 w-24 rounded-full bg-muted" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-32 rounded-md bg-muted" />
          <Skeleton className="h-9 w-9 rounded-md bg-muted" />
        </div>
      </div>

      {/* Horizontal Metadata Stats Bar Skeleton */}
      <div className="mb-10 rounded-xl border border-border bg-background p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          {METADATA_FIELDS.map((field) => (
            <div key={field} className="grid gap-1.5">
              <Skeleton className="h-3 w-20 bg-muted" />
              <Skeleton className="h-4 w-28 bg-muted" />
            </div>
          ))}
        </div>
      </div>

      {/* Connected Projects Section Skeleton */}
      <div className="mb-12">
        <Skeleton className="h-6 w-44 mb-2 bg-muted" />
        <Skeleton className="h-3 w-72 mb-4 bg-muted" />
        <div className="rounded-xl border border-border bg-background divide-y divide-border">
          <div className="p-4 flex justify-between items-center">
            <Skeleton className="h-4 w-48 bg-muted" />
            <Skeleton className="h-4 w-24 bg-muted" />
          </div>
          <div className="p-4 flex justify-between items-center">
            <Skeleton className="h-4 w-40 bg-muted" />
            <Skeleton className="h-4 w-24 bg-muted" />
          </div>
        </div>
      </div>

      {/* DNS Records Section Skeleton */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-2">
          <Skeleton className="h-6 w-36 bg-muted" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-28 bg-muted" />
            <Skeleton className="h-8 w-32 bg-muted" />
          </div>
        </div>
        <Skeleton className="h-3 w-96 mb-4 bg-muted" />
        <Skeleton className="h-28 w-full rounded-xl bg-muted mb-4" />
        <Skeleton className="h-48 w-full rounded-xl bg-muted" />
      </div>

      {/* Nameservers Section Skeleton */}
      <div className="mb-12">
        <Skeleton className="h-6 w-32 mb-2 bg-muted" />
        <Skeleton className="h-3 w-80 mb-4 bg-muted" />
        <Skeleton className="h-32 w-full rounded-xl bg-muted" />
      </div>
    </div>
  );
}
