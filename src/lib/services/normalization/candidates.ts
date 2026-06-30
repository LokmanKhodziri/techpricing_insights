import type { AliasSource, NormalizationStatus } from "@prisma/client";

import { db } from "@/lib/db";
import type { NormalizationResult } from "@/lib/services/normalization/types";

export type NormalizationCandidateSummary = {
  id: string;
  titleRaw: string;
  titleNormalized: string;
  suggestedProductId: string | null;
  suggestedProductName: string | null;
  suggestedMatchKey: string | null;
  confidence: number;
  matchSource: AliasSource | null;
  status: NormalizationStatus;
  occurrenceCount: number;
  lastSeenAt: string;
};

export async function queueNormalizationCandidate(input: {
  titleRaw: string;
  normalization: NormalizationResult;
  importBatchId?: string;
}) {
  const existing = await db.normalizationCandidate.findUnique({
    where: { titleNormalized: input.normalization.titleNormalized },
  });

  if (existing?.status === "APPROVED") {
    return existing;
  }

  if (existing) {
    return db.normalizationCandidate.update({
      where: { id: existing.id },
      data: {
        titleRaw: input.titleRaw,
        suggestedProductId: input.normalization.suggestedProductId,
        suggestedMatchKey: input.normalization.matchKey,
        confidence: input.normalization.confidence,
        matchSource: input.normalization.aliasSource,
        status: existing.status === "REJECTED" ? "PENDING" : existing.status,
        occurrenceCount: { increment: 1 },
        importBatchId: input.importBatchId,
        lastSeenAt: new Date(),
      },
    });
  }

  return db.normalizationCandidate.create({
    data: {
      titleRaw: input.titleRaw,
      titleNormalized: input.normalization.titleNormalized,
      suggestedProductId: input.normalization.suggestedProductId,
      suggestedMatchKey: input.normalization.matchKey,
      confidence: input.normalization.confidence,
      matchSource: input.normalization.aliasSource,
      importBatchId: input.importBatchId,
    },
  });
}

export async function listPendingCandidates(limit = 50) {
  const candidates = await db.normalizationCandidate.findMany({
    where: { status: "PENDING" },
    orderBy: [{ occurrenceCount: "desc" }, { lastSeenAt: "desc" }],
    take: limit,
    include: {
      suggestedProduct: {
        select: { brand: true, model: true, variant: true },
      },
    },
  });

  return candidates.map((candidate): NormalizationCandidateSummary => ({
    id: candidate.id,
    titleRaw: candidate.titleRaw,
    titleNormalized: candidate.titleNormalized,
    suggestedProductId: candidate.suggestedProductId,
    suggestedProductName: candidate.suggestedProduct
      ? [candidate.suggestedProduct.brand, candidate.suggestedProduct.model, candidate.suggestedProduct.variant]
          .filter(Boolean)
          .join(" ")
      : null,
    suggestedMatchKey: candidate.suggestedMatchKey,
    confidence: candidate.confidence,
    matchSource: candidate.matchSource,
    status: candidate.status,
    occurrenceCount: candidate.occurrenceCount,
    lastSeenAt: candidate.lastSeenAt.toISOString(),
  }));
}

export async function rejectCandidate(candidateId: string) {
  return db.normalizationCandidate.update({
    where: { id: candidateId },
    data: { status: "REJECTED" },
  });
}
