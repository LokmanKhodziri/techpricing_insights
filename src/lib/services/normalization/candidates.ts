import type { AliasSource, NormalizationStatus } from "@prisma/client";

import { db } from "@/lib/db";
import {
  extractCatalogProductIdentity,
  extractProductIdentity,
  identitiesCompatible,
} from "@/lib/services/normalization/identity";
import {
  formatProductDraftLabel,
  inferProductDraft,
} from "@/lib/services/normalization/infer-product-draft";
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
  inferredProductName: string | null;
  canCreateProduct: boolean;
};

function isStoredSuggestionValid(input: {
  titleNormalized: string;
  brand: string;
  model: string;
  variant: string | null;
}) {
  const titleIdentity = extractProductIdentity(input.titleNormalized);
  const productIdentity = extractCatalogProductIdentity(
    input.brand,
    input.model,
    input.variant,
  );

  return identitiesCompatible(titleIdentity, productIdentity);
}

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

  return candidates.map((candidate): NormalizationCandidateSummary => {
    const draft = inferProductDraft(candidate.titleRaw);
    const suggestionIsValid =
      candidate.suggestedProduct &&
      isStoredSuggestionValid({
        titleNormalized: candidate.titleNormalized,
        brand: candidate.suggestedProduct.brand,
        model: candidate.suggestedProduct.model,
        variant: candidate.suggestedProduct.variant,
      });

    return {
      id: candidate.id,
      titleRaw: candidate.titleRaw,
      titleNormalized: candidate.titleNormalized,
      suggestedProductId: suggestionIsValid ? candidate.suggestedProductId : null,
      suggestedProductName: suggestionIsValid
        ? [
            candidate.suggestedProduct!.brand,
            candidate.suggestedProduct!.model,
            candidate.suggestedProduct!.variant,
          ]
            .filter(Boolean)
            .join(" ")
        : null,
      suggestedMatchKey: suggestionIsValid ? candidate.suggestedMatchKey : null,
      confidence: suggestionIsValid ? candidate.confidence : 0,
      matchSource: suggestionIsValid ? candidate.matchSource : null,
      status: candidate.status,
      occurrenceCount: candidate.occurrenceCount,
      lastSeenAt: candidate.lastSeenAt.toISOString(),
      inferredProductName: draft ? formatProductDraftLabel(draft) : null,
      canCreateProduct: Boolean(draft),
    };
  });
}

export async function rejectCandidate(candidateId: string) {
  return db.normalizationCandidate.update({
    where: { id: candidateId },
    data: { status: "REJECTED" },
  });
}
