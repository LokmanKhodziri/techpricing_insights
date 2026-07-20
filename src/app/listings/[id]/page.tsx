"use client";

import Link from "next/link";
import { use } from "react";

import {
  ListingBackLink,
  ListingDetailView,
} from "@/components/listings/listing-detail-view";
import { useListing } from "@/hooks/use-listing";

type ListingDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default function ListingDetailPage({ params }: ListingDetailPageProps) {
  const { id } = use(params);
  const { data: listing, isLoading, isError, error } = useListing(id);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-sm text-muted-foreground">
        Loading listing...
      </div>
    );
  }

  if (isError || !listing) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-10">
        <LinkFallback />
        <p className="text-sm text-destructive">
          {(error as Error)?.message ?? "Listing not found"}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <ListingBackLink productSlug={listing.productSlug} />
      <ListingDetailView listing={listing} />
    </div>
  );
}

function LinkFallback() {
  return (
    <Link
      href="/products"
      className="inline-flex text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      ← Back to products
    </Link>
  );
}
