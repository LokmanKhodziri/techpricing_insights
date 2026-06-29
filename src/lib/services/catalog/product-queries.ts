import { db } from "@/lib/db";
import type {
  ListingSummary,
  ProductDetail,
  ProductSummary,
} from "@/types/catalog";

const productListSelect = {
  id: true,
  slug: true,
  category: true,
  brand: true,
  model: true,
  variant: true,
  _count: { select: { listings: true } },
} as const;

const productDetailInclude = {
  aliasesRef: {
    select: {
      alias: true,
      aliasRaw: true,
      confidence: true,
      source: true,
    },
    orderBy: { confidence: "desc" as const },
  },
  listings: {
    orderBy: { capturedAt: "desc" as const },
    take: 20,
    select: {
      id: true,
      platform: true,
      titleRaw: true,
      priceSen: true,
      originalPriceSen: true,
      capturedAt: true,
      sellerName: true,
    },
  },
  _count: { select: { listings: true } },
} as const;

type ProductListRecord = {
  id: string;
  slug: string;
  category: ProductSummary["category"];
  brand: string;
  model: string;
  variant: string | null;
  _count: { listings: number };
};

type ProductDetailRecord = {
  id: string;
  slug: string;
  category: ProductDetail["category"];
  brand: string;
  model: string;
  variant: string | null;
  specs: unknown;
  matchKey: string;
  aliases: string[];
  msrpSen: number | null;
  aliasesRef: ProductDetail["aliasesRef"];
  listings: Array<{
    id: string;
    platform: ListingSummary["platform"];
    titleRaw: string;
    priceSen: number;
    originalPriceSen: number | null;
    capturedAt: Date;
    sellerName: string | null;
  }>;
  _count: { listings: number };
};

function toProductSummary(product: ProductListRecord): ProductSummary {
  return {
    id: product.id,
    slug: product.slug,
    category: product.category,
    brand: product.brand,
    model: product.model,
    variant: product.variant,
    listingCount: product._count.listings,
  };
}

function toProductDetail(product: ProductDetailRecord): ProductDetail {
  return {
    id: product.id,
    slug: product.slug,
    category: product.category,
    brand: product.brand,
    model: product.model,
    variant: product.variant,
    specs:
      product.specs && typeof product.specs === "object"
        ? (product.specs as Record<string, unknown>)
        : {},
    matchKey: product.matchKey,
    aliases: product.aliases,
    msrpSen: product.msrpSen,
    listingCount: product._count.listings,
    aliasesRef: product.aliasesRef,
    recentListings: product.listings.map((listing) => ({
      id: listing.id,
      platform: listing.platform,
      titleRaw: listing.titleRaw,
      priceSen: listing.priceSen,
      originalPriceSen: listing.originalPriceSen,
      capturedAt: listing.capturedAt.toISOString(),
      sellerName: listing.sellerName,
    })),
  };
}

export async function listProducts(options?: {
  category?: ProductSummary["category"];
  page?: number;
  pageSize?: number;
}) {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 20;
  const where = options?.category ? { category: options.category } : undefined;

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { updatedAt: "desc" },
      select: productListSelect,
    }),
    db.product.count({ where }),
  ]);

  return {
    items: products.map(toProductSummary),
    total,
    page,
    pageSize,
  };
}

export async function getProductById(id: string) {
  const product = await db.product.findUnique({
    where: { id },
    include: productDetailInclude,
  });

  return product ? toProductDetail(product) : null;
}

export async function getProductBySlug(slug: string) {
  const product = await db.product.findUnique({
    where: { slug },
    include: productDetailInclude,
  });

  return product ? toProductDetail(product) : null;
}
