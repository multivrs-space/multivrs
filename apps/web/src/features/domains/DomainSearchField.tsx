import { ArrowRight, Search, X } from "lucide-react";

export function DomainSearchField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="off"
        aria-label="Search domains"
        placeholder="Search a domain or describe your idea"
        className="h-12 w-full border border-border bg-muted pl-11 pr-12 text-sm text-foreground outline-hidden transition focus:border-white/45 focus:ring-2 focus:ring-border"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
        >
          <X className="size-4" />
        </button>
      ) : (
        <span
          aria-hidden
          className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center text-muted-foreground"
        >
          <ArrowRight className="size-4" />
        </span>
      )}
    </div>
  );
}
