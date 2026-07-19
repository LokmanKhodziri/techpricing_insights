import { db } from "@/lib/db";
import { AppError } from "@/lib/errors/app-error";
import type { ListingDetail } from "@/types/catalog";

const listingDetailSelect = {
  id: true,
  productId: true,
  platform: true,
  platformListingId: true,
  sourceUrl: true,
  titleRaw: true,
  priceSen: true,
  originalPriceSen: true,
  shippingSen: true,
  currency: true,
  condition: true,
  sellerName: true,
  sellerId: true,
  capturedAt: true,
  product: {
    select: {
      slug: true,
      brand: true,
      model: true,
      variant: true,
    },
  },
} as const;

type ListingRecord = {
  id: string;
  productId: string;
  platform: ListingDetail["platform"];
  platformListingId: string | null;
  sourceUrl: string | null;
  titleRaw: string;
  priceSen: number;
  originalPriceSen: number | null;
  shippingSen: number | null;
  currency: string;
  condition: string;
  sellerName: string | null;
  sellerId: string | null;
  capturedAt: Date;
  product: {
    slug: string;
    brand: string;
    model: string;
    variant: string | null;
  };
};

function toListingDetail(listing: ListingRecord): ListingDetail {
  const productName = [
    listing.product.brand,
    listing.product.model,
    listing.product.variant,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    id: listing.id,
    productId: listing.productId,
    productSlug: listing.product.slug,
    productName,
    platform: listing.platform,
    platformListingId: listing.platformListingId,
    titleRaw: listing.titleRaw,
    priceSen: listing.priceSen,
    originalPriceSen: listing.originalPriceSen,
    shippingSen: listing.shippingSen,
    currency: listing.currency,
    condition: listing.condition,
    capturedAt: listing.capturedAt.toISOString(),
    sellerName: listing.sellerName,
    sellerId: listing.sellerId,
    sourceUrl: listing.sourceUrl,
  };
}

export async function getListingById(id: string): Promise<ListingDetail | null> {
  const listing = await db.listing.findUnique({
    where: { id },
    select: listingDetailSelect,
  });

  return listing ? toListingDetail(listing) : null;
}

export async function updateListingPrice(
  listingId: string,
  input: { priceSen: number; originalPriceSen?: number },
) {
  const listing = await db.listing.findUnique({
    where: { id: listingId },
    select: { id: true },
  });

  if (!listing) {
    throw new AppError("NOT_FOUND", "Listing not found", 404);
  }

  const updated = await db.listing.update({
    where: { id: listingId },
    data: {
      priceSen: input.priceSen,
      ...(input.originalPriceSen !== undefined
        ? { originalPriceSen: input.originalPriceSen }
        : {}),
    },
    select: listingDetailSelect,
  });

  return toListingDetail(updated);
}
