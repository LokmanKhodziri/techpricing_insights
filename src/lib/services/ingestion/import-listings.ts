import type { MarketplacePlatform, Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import type { ImportFileInput, RawListingRow } from "@/lib/schemas/listing";
import { createProductAlias } from "@/lib/services/normalization/approve-alias";
import { queueNormalizationCandidate } from "@/lib/services/normalization/candidates";
import { resolveProductFromTitle } from "@/lib/services/normalization";
import type { PendingListingPayload } from "@/lib/services/normalization/pending-listings";
import type { NormalizationResult } from "@/lib/services/normalization/types";

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
  normalization: NormalizationResult;
};

function buildPendingListing(
  parsed: ParsedListingRow,
  platform: MarketplacePlatform,
  importBatchId: string,
): PendingListingPayload {
  return {
    platform,
    platformListingId: parsed.platformListingId,
    sourceUrl: parsed.sourceUrl,
    titleRaw: parsed.titleRaw,
    titleNormalized: parsed.titleNormalized,
    priceSen: parsed.priceSen,
    originalPriceSen: parsed.originalPriceSen,
    shippingSen: parsed.shippingSen,
    sellerName: parsed.sellerName,
    sellerId: parsed.sellerId,
    capturedAt: parsed.capturedAt.toISOString(),
    importBatchId,
    rawPayload: parsed.rawPayload,
  };
}

async function resolveApprovedProductId(titleNormalized: string) {
  const candidate = await db.normalizationCandidate.findUnique({
    where: { titleNormalized },
    select: { status: true, suggestedProductId: true },
  });

  if (candidate?.status === "APPROVED" && candidate.suggestedProductId) {
    return candidate.suggestedProductId;
  }

  return null;
}

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
    normalization,
  };
}

export type ImportListingsResult = {
  batchId: string;
  rowCount: number;
  successCount: number;
  errorCount: number;
  queuedCount: number;
  errors: Array<{ row: number; message: string }>;
};

export async function importListings(
  input: ImportFileInput,
): Promise<ImportListingsResult> {
  const batch = await db.importBatch.create({
    data: {
      fileName: input.fileName,
      fileFormat: input.fileFormat,
      platform: input.platform,
      rowCount: input.rows.length,
    },
  });

  const errors: Array<{ row: number; message: string }> = [];
  let successCount = 0;
  let queuedCount = 0;

  for (const [index, row] of input.rows.entries()) {
    try {
      const parsed = await parseImportRow(row, input.platform);
      const platform = input.platform ?? "OTHER";
      let productId =
        parsed.productId ??
        (await resolveApprovedProductId(parsed.titleNormalized));

      if (!productId) {
        await queueNormalizationCandidate({
          titleRaw: parsed.titleRaw,
          normalization: parsed.normalization,
          importBatchId: batch.id,
          pendingListing: buildPendingListing(parsed, platform, batch.id),
        });
        queuedCount += 1;
        errors.push({
          row: index + 1,
          message: `Queued for review: ${parsed.titleRaw}`,
        });
        continue;
      }

      if (
        parsed.normalization.source === "FUZZY" &&
        productId
      ) {
        await createProductAlias({
          productId,
          titleRaw: parsed.titleRaw,
          titleNormalized: parsed.normalization.titleNormalized,
          source: "FUZZY",
          confidence: parsed.normalization.confidence,
        });
      }

      await db.listing.create({
        data: {
          productId,
          platform,
          platformListingId: parsed.platformListingId,
          sourceUrl: parsed.sourceUrl,
          titleRaw: parsed.titleRaw,
          titleNormalized: parsed.titleNormalized,
          priceSen: parsed.priceSen,
          originalPriceSen: parsed.originalPriceSen,
          shippingSen: parsed.shippingSen,
          sellerName: parsed.sellerName,
          sellerId: parsed.sellerId,
          capturedAt: parsed.capturedAt,
          importBatchId: batch.id,
          rawPayload: parsed.rawPayload as Prisma.InputJsonValue,
        },
      });

      successCount += 1;
    } catch (error) {
      errors.push({
        row: index + 1,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  await db.importBatch.update({
    where: { id: batch.id },
    data: {
      successCount,
      errorCount: errors.length,
      errors,
    },
  });

  return {
    batchId: batch.id,
    rowCount: input.rows.length,
    successCount,
    errorCount: errors.length,
    queuedCount,
    errors,
  };
}
