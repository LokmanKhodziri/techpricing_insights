"use client";

import { useEffect, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { useAppRole } from "@/hooks/use-app-role";
import { useUpdateListingPrice } from "@/hooks/use-update-listing-price";
import { formatMyrFromSen, senToMyr } from "@/lib/format";
import type { ListingDetail } from "@/types/catalog";
import { cn } from "@/lib/utils";

type ListingPriceEditorProps = {
  listing: ListingDetail;
};

export function ListingPriceEditor({ listing }: ListingPriceEditorProps) {
  const { isAdmin } = useAppRole();
  const mutation = useUpdateListingPrice();
  const [priceMyr, setPriceMyr] = useState(String(senToMyr(listing.priceSen)));
  const [originalPriceMyr, setOriginalPriceMyr] = useState(
    listing.originalPriceSen !== null
      ? String(senToMyr(listing.originalPriceSen))
      : "",
  );

  useEffect(() => {
    setPriceMyr(String(senToMyr(listing.priceSen)));
    setOriginalPriceMyr(
      listing.originalPriceSen !== null
        ? String(senToMyr(listing.originalPriceSen))
        : "",
    );
  }, [listing.priceSen, listing.originalPriceSen]);

  if (!isAdmin) {
    return (
      <section className="rounded-xl border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
        Only admins can update listing prices. Ask an admin to promote your
        account, or sign out and sign in again after your role is updated.
      </section>
    );
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const price = Number(priceMyr);
    if (!Number.isFinite(price) || price <= 0) {
      return;
    }

    const originalPrice = originalPriceMyr
      ? Number(originalPriceMyr)
      : undefined;

    mutation.mutate({
      listingId: listing.id,
      priceMyr: price,
      originalPriceMyr:
        originalPrice !== undefined && Number.isFinite(originalPrice)
          ? originalPrice
          : undefined,
    });
  };

  return (
    <section className="rounded-xl border border-dashed border-border bg-muted/20 p-4">
      <div className="space-y-1">
        <h2 className="text-sm font-medium">Admin · Update listing price</h2>
        <p className="text-xs text-muted-foreground">
          Shopee/Lazada often show a lower &quot;after voucher&quot; price. Store
          that as <strong>Price after voucher</strong> and the higher shelf price
          as <strong>List price before voucher</strong>.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-muted-foreground">
              Price after voucher (MYR)
            </span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              value={priceMyr}
              onChange={(event) => setPriceMyr(event.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2"
              disabled={mutation.isPending}
              required
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-muted-foreground">
              List price before voucher (MYR, optional)
            </span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              value={originalPriceMyr}
              onChange={(event) => setOriginalPriceMyr(event.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2"
              disabled={mutation.isPending}
            />
          </label>
        </div>

        <button
          type="submit"
          className={cn(buttonVariants({ size: "sm" }))}
          disabled={mutation.isPending || !priceMyr}
        >
          {mutation.isPending ? "Updating..." : "Save price"}
        </button>
      </form>

      {mutation.isError && (
        <p className="mt-2 text-xs text-destructive">
          {(mutation.error as Error).message}
        </p>
      )}

      {mutation.isSuccess && (
        <p className="mt-2 text-xs text-green-700 dark:text-green-400">
          Listing price updated to {formatMyrFromSen(mutation.data.priceSen)}.
          Product charts will use this value.
        </p>
      )}
    </section>
  );
}
