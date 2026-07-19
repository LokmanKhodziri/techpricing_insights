import type { MarketplacePlatform, Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { isPrismaUniqueViolation } from "@/lib/db-errors";

export type PendingListingPayload = {
  platform: MarketplacePlatform;
  platformListingId?: string;
  sourceUrl?: string;
  titleRaw: string;
  titleNormalized: string;
  priceSen: number;
  originalPriceSen?: number;
  shippingSen?: number;
  sellerName?: string;
  sellerId?: string;
  capturedAt: string;
  importBatchId?: string;
  rawPayload: Record<string, unknown>;
};

export function parsePendingListings(value: unknown): PendingListingPayload[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (entry): entry is PendingListingPayload =>
      Boolean(entry) &&
      typeof entry === "object" &&
      typeof (entry as PendingListingPayload).titleRaw === "string" &&
      typeof (entry as PendingListingPayload).priceSen === "number" &&
      typeof (entry as PendingListingPayload).capturedAt === "string",
  );
}

export async function materializePendingListings(input: {
  titleNormalized: string;
  productId: string;
}): Promise<number> {
  const candidate = await db.normalizationCandidate.findUnique({
    where: { titleNormalized: input.titleNormalized },
    select: { id: true, pendingListings: true },
  });

  if (!candidate) {
    return 0;
  }

  const pending = parsePendingListings(candidate.pendingListings);
  if (pending.length === 0) {
    return 0;
  }

  let created = 0;

  for (const row of pending) {
    try {
      await db.listing.create({
        data: {
          productId: input.productId,
          platform: row.platform,
          platformListingId: row.platformListingId,
          sourceUrl: row.sourceUrl,
          titleRaw: row.titleRaw,
          titleNormalized: row.titleNormalized,
          priceSen: row.priceSen,
          originalPriceSen: row.originalPriceSen,
          shippingSen: row.shippingSen,
          sellerName: row.sellerName,
          sellerId: row.sellerId,
          capturedAt: new Date(row.capturedAt),
          importBatchId: row.importBatchId,
          rawPayload: row.rawPayload as Prisma.InputJsonValue,
        },
      });
      created += 1;
    } catch (error) {
      if (isPrismaUniqueViolation(error)) {
        continue;
      }

      throw error;
    }
  }

  await db.normalizationCandidate.update({
    where: { id: candidate.id },
    data: {
      pendingListings: [],
    },
  });

  return created;
}
