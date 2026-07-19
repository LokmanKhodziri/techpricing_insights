import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { ListingPriceEditor } from "@/components/listings/listing-price-editor";
import { PLATFORM_LABELS } from "@/lib/constants/platforms";
import { formatMyrFromSen } from "@/lib/format";
import type { ListingDetail } from "@/types/catalog";
import { cn } from "@/lib/utils";

type ListingDetailViewProps = {
  listing: ListingDetail;
};

export function ListingDetailView({ listing }: ListingDetailViewProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            {PLATFORM_LABELS[listing.platform] ?? listing.platform}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(listing.capturedAt).toLocaleString("en-MY")}
          </span>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">
          {listing.titleRaw}
        </h1>

        <p className="text-sm text-muted-foreground">
          Product:{" "}
          <Link
            href={`/products/${listing.productSlug}`}
            className="font-medium text-foreground hover:underline"
          >
            {listing.productName}
          </Link>
        </p>
      </div>

      <section className="grid gap-4 rounded-xl border border-border p-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="text-xs text-muted-foreground">Price after voucher</p>
          <p className="mt-1 text-lg font-semibold">
            {formatMyrFromSen(listing.priceSen)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">
            List price (before voucher)
          </p>
          <p className="mt-1 text-lg font-semibold">
            {listing.originalPriceSen !== null
              ? formatMyrFromSen(listing.originalPriceSen)
              : "—"}
          </p>
          {listing.originalPriceSen !== null &&
            listing.originalPriceSen > listing.priceSen && (
              <p className="mt-1 text-xs text-emerald-600">
                Voucher saves{" "}
                {formatMyrFromSen(listing.originalPriceSen - listing.priceSen)}
              </p>
            )}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Seller</p>
          <p className="mt-1 text-sm font-medium">
            {listing.sellerName ?? "Unknown seller"}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Condition</p>
          <p className="mt-1 text-sm font-medium">{listing.condition}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Platform listing ID</p>
          <p className="mt-1 font-mono text-xs">
            {listing.platformListingId ?? "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Shipping</p>
          <p className="mt-1 text-sm font-medium">
            {listing.shippingSen !== null
              ? formatMyrFromSen(listing.shippingSen)
              : "—"}
          </p>
        </div>
      </section>

      <ListingPriceEditor listing={listing} />

      {listing.sourceUrl && (
        <a
          href={listing.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "inline-flex items-center gap-2",
          )}
        >
          View on {PLATFORM_LABELS[listing.platform] ?? listing.platform}
          <ExternalLink className="size-4" aria-hidden="true" />
        </a>
      )}
    </div>
  );
}

export function ListingBackLink({ productSlug }: { productSlug: string }) {
  return (
    <Link
      href={`/products/${productSlug}`}
      className="inline-flex text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      ← Back to product
    </Link>
  );
}
