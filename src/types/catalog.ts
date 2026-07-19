import type { MarketplacePlatform, ProductCategory } from "@/lib/schemas/common";

export type ProductSummary = {
  id: string;
  slug: string;
  category: ProductCategory;
  brand: string;
  model: string;
  variant: string | null;
  listingCount: number;
};

export type ProductAliasSummary = {
  alias: string;
  aliasRaw: string | null;
  confidence: number;
  source: string;
};

export type ListingSummary = {
  id: string;
  platform: MarketplacePlatform;
  titleRaw: string;
  priceSen: number;
  originalPriceSen: number | null;
  capturedAt: string;
  sellerName: string | null;
  sourceUrl: string | null;
};

export type ProductDetail = {
  id: string;
  slug: string;
  category: ProductCategory;
  brand: string;
  model: string;
  variant: string | null;
  specs: Record<string, unknown>;
  matchKey: string;
  aliases: string[];
  msrpSen: number | null;
  listingCount: number;
  aliasesRef: ProductAliasSummary[];
  recentListings: ListingSummary[];
};
