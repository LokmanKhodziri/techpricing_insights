"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { useAppRole } from "@/hooks/use-app-role";
import { PLATFORM_LABELS } from "@/lib/constants/platforms";
import { formatMyrFromSen } from "@/lib/format";
import type { ProductDetail } from "@/types/catalog";
import { cn } from "@/lib/utils";

type ProductListingsTableProps = {
  listings: ProductDetail["recentListings"];
};

export function ProductListingsTable({ listings }: ProductListingsTableProps) {
  const { isAdmin } = useAppRole();

  if (listings.length === 0) {
    return (
      <section className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
        <p>No marketplace listings recorded for this product yet.</p>
        <p className="mt-2">
          Upload a CSV on Imports to add seller listings. Admins can then update
          each seller&apos;s price from the table below.
        </p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-xl border border-border">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-medium">Recent listings</h2>
        {isAdmin && (
          <p className="mt-1 text-xs text-muted-foreground">
            Each row is a separate seller. Use{" "}
            <span className="font-medium">Update price</span> to edit that
            listing — the chart and table refresh automatically.
          </p>
        )}
      </div>
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left">
          <tr>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Platform</th>
            <th className="px-4 py-3 font-medium">Seller</th>
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">After voucher</th>
            <th className="px-4 py-3 font-medium">List price</th>
            <th className="px-4 py-3 font-medium text-right">Update</th>
            <th className="px-4 py-3 font-medium text-right">Shop</th>
          </tr>
        </thead>
        <tbody>
          {listings.map((listing) => (
            <tr key={listing.id} className="border-t border-border">
              <td className="px-4 py-3 text-muted-foreground">
                {new Date(listing.capturedAt).toLocaleDateString("en-MY")}
              </td>
              <td className="px-4 py-3">
                {PLATFORM_LABELS[listing.platform] ?? listing.platform}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {listing.sellerName ?? "—"}
              </td>
              <td className="max-w-xs truncate px-4 py-3">{listing.titleRaw}</td>
              <td className="px-4 py-3 font-medium">
                {formatMyrFromSen(listing.priceSen)}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {listing.originalPriceSen !== null
                  ? formatMyrFromSen(listing.originalPriceSen)
                  : "—"}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/listings/${listing.id}`}
                  className={cn(
                    buttonVariants({
                      variant: isAdmin ? "default" : "outline",
                      size: "sm",
                    }),
                  )}
                >
                  Update price
                </Link>
              </td>
              <td className="px-4 py-3 text-right">
                {listing.sourceUrl ? (
                  <a
                    href={listing.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "sm" }),
                      "inline-flex items-center gap-1.5",
                    )}
                  >
                    Shop
                    <ExternalLink className="size-3.5" aria-hidden="true" />
                  </a>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
