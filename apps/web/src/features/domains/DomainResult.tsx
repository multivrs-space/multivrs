import { Bookmark, Check, ShoppingCart, Trash2 } from "lucide-react";
import type { DomainSearchResult } from "./domain-marketplace";
import { formatDomainPrice } from "./domain-price";

export function DomainResult({
  result,
  featured = false,
  canSave,
  saved,
  inCart,
  onSave,
  onAdd,
}: {
  result: DomainSearchResult;
  featured?: boolean;
  canSave: boolean;
  saved: boolean;
  inCart: boolean;
  onSave: (result: DomainSearchResult) => Promise<void>;
  onAdd: (result: DomainSearchResult) => void;
}) {
  const hasPrice =
    typeof result.price === "number" && Number.isFinite(result.price);
  const hasRenewalPrice =
    typeof result.renewalPrice === "number" &&
    Number.isFinite(result.renewalPrice);
  const numericPrice = hasPrice ? result.price : null;
  const numericRenewalPrice = hasRenewalPrice ? result.renewalPrice : null;
  const price =
    numericPrice === null
      ? null
      : formatDomainPrice(numericPrice, result.currency);
  const renewalPrice =
    numericRenewalPrice == null
      ? null
      : formatDomainPrice(numericRenewalPrice, result.currency);
  const discounted =
    numericPrice !== null &&
    numericRenewalPrice != null &&
    numericPrice < numericRenewalPrice;
  return (
    <article
      className={
        featured
          ? "min-h-32 border border-border bg-foreground/[0.04] p-5"
          : "flex min-h-20 items-center border-b border-r border-border px-4"
      }
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-foreground">
            {result.domain}
          </p>
          {result.premium ? (
            <span className="bg-cyan-500/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-cyan-300">
              Premium
            </span>
          ) : null}
        </div>
        {result.available && price ? (
          <div className="mt-2">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="text-sm font-medium text-foreground">{price}</span>
              <span className="text-xs text-muted-foreground">first year</span>
              {discounted && renewalPrice ? (
                <span className="text-xs text-muted-foreground line-through">
                  {renewalPrice}
                </span>
              ) : null}
            </div>
            {renewalPrice ? (
              <p className="mt-1 text-[11px] text-muted-foreground">
                Renews at {renewalPrice}/year
              </p>
            ) : null}
          </div>
        ) : (
          <p className="mt-2 text-xs text-muted-foreground">Unavailable</p>
        )}
      </div>
      {result.available ? (
        <div className="flex gap-1">
          {canSave ? (
            <button
              type="button"
              onClick={() => void onSave(result)}
              aria-label={
                saved
                  ? `Remove ${result.domain} from saved`
                  : `Save ${result.domain}`
              }
              className="grid size-8 place-items-center text-muted-foreground hover:text-foreground"
            >
              <Bookmark
                className="size-4"
                fill={saved ? "currentColor" : "none"}
              />
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => onAdd(result)}
            aria-label={
              inCart
                ? `Remove ${result.domain} from cart`
                : `Add ${result.domain} to cart`
            }
            className={`group/cart grid size-8 place-items-center border transition-colors ${
              inCart
                ? "border-emerald-400/35 bg-emerald-400/10 text-emerald-300 hover:border-red-300/35 hover:bg-red-300/10 hover:text-red-300"
                : "border-border text-foreground/65 hover:bg-foreground hover:text-background"
            }`}
          >
            {inCart ? (
              <span className="relative size-4">
                <Check className="absolute inset-0 size-4 transition-opacity group-hover/cart:opacity-0" />
                <Trash2 className="absolute inset-0 size-4 opacity-0 transition-opacity group-hover/cart:opacity-100" />
              </span>
            ) : (
              <ShoppingCart className="size-4" />
            )}
          </button>
        </div>
      ) : null}
    </article>
  );
}
