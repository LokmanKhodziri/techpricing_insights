import type { ImportFileInput, RawListingRow } from "@/lib/schemas/listing";
import { resolveProductFromTitle } from "@/lib/services/normalization";

function parsePriceToSen(value: number | string): number {
  const amount =
    typeof value === "number"
      ? value
      : Number(value.replace(/[^\d.]/g, ""));

  if (Number.isNaN(amount)) {
    throw new Error(`Invalid price value: ${value}`);
  }

  return Math.round(amount * 100);
}

function parseCapturedAt(value?: string | Date): Date {
  if (!value) return new Date();
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

export type ParsedListingRow = {
  titleRaw: string;
  titleNormalized: string;
  priceSen: number;
  originalPriceSen?: number;
  shippingSen?: number;
  platformListingId?: string;
  sourceUrl?: string;
  sellerName?: string;
  sellerId?: string;
  capturedAt: Date;
  rawPayload: Record<string, unknown>;
  productId: string | null;
  matchKey: string | null;
};

export async function parseImportRow(
  row: RawListingRow,
  defaultPlatform?: ImportFileInput["platform"],
): Promise<ParsedListingRow> {
  const normalization = await resolveProductFromTitle(row.title);

  return {
    titleRaw: row.title,
    titleNormalized: normalization.titleNormalized,
    priceSen: parsePriceToSen(row.price),
    originalPriceSen: row.originalPrice
      ? parsePriceToSen(row.originalPrice)
      : undefined,
    shippingSen: row.shipping ? parsePriceToSen(row.shipping) : undefined,
    platformListingId: row.platformListingId,
    sourceUrl: row.sourceUrl,
    sellerName: row.sellerName,
    sellerId: row.sellerId,
    capturedAt: parseCapturedAt(row.capturedAt),
    rawPayload: { ...row, defaultPlatform },
    productId: normalization.productId,
    matchKey: normalization.matchKey,
  };
}
