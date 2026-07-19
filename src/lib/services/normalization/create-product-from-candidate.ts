import type { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { AppError } from "@/lib/errors/app-error";
import { createProductAlias } from "@/lib/services/normalization/approve-alias";
import {
  formatProductDraftLabel,
  inferProductDraft,
} from "@/lib/services/normalization/infer-product-draft";
import { materializePendingListings } from "@/lib/services/normalization/pending-listings";
import { buildMatchKey, buildSlug } from "@/lib/services/normalization/tokenizer";

async function ensureUniqueSlug(parts: string[]): Promise<string> {
  const base = buildSlug(parts);

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const slug = attempt === 0 ? base : `${base}-${attempt + 1}`;
    const existing = await db.product.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing) {
      return slug;
    }
  }

  throw new AppError(
    "CONFLICT",
    "Could not generate a unique product slug",
    409,
  );
}

async function ensureUniqueMatchKey(parts: string[]): Promise<string> {
  const base = buildMatchKey(parts);

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const matchKey = attempt === 0 ? base : `${base}-${attempt + 1}`;
    const existing = await db.product.findUnique({
      where: { matchKey },
      select: { id: true },
    });

    if (!existing) {
      return matchKey;
    }
  }

  throw new AppError(
    "CONFLICT",
    "Could not generate a unique product match key",
    409,
  );
}

export async function createProductFromCandidate(candidateId: string) {
  const candidate = await db.normalizationCandidate.findUnique({
    where: { id: candidateId },
  });

  if (!candidate) {
    throw new AppError("NOT_FOUND", "Normalization candidate not found", 404);
  }

  if (candidate.status !== "PENDING") {
    throw new AppError(
      "CONFLICT",
      `Candidate is already ${candidate.status.toLowerCase()}`,
      409,
    );
  }

  const draft = inferProductDraft(candidate.titleRaw);
  if (!draft) {
    throw new AppError(
      "VALIDATION_ERROR",
      "Cannot infer a CPU or GPU product from this title. Map it to an existing product instead.",
      422,
    );
  }

  const slug = await ensureUniqueSlug(draft.slugParts);
  const matchKey = await ensureUniqueMatchKey(draft.matchKeyParts);

  const product = await db.product.create({
    data: {
      slug,
      category: draft.category,
      brand: draft.brand,
      model: draft.model,
      variant: draft.variant,
      specs: draft.specs as Prisma.InputJsonValue,
      matchKey,
      aliases: [candidate.titleNormalized],
    },
  });

  await createProductAlias({
    productId: product.id,
    titleRaw: candidate.titleRaw,
    titleNormalized: candidate.titleNormalized,
    source: "MANUAL",
    confidence: 1,
  });

  const listingsCreated = await materializePendingListings({
    titleNormalized: candidate.titleNormalized,
    productId: product.id,
  });

  const updatedCandidate = await db.normalizationCandidate.update({
    where: { id: candidateId },
    data: {
      status: "APPROVED",
      suggestedProductId: product.id,
      suggestedMatchKey: matchKey,
      confidence: 1,
      matchSource: "MANUAL",
    },
  });

  return {
    product: {
      id: product.id,
      slug: product.slug,
      category: product.category,
      brand: product.brand,
      model: product.model,
      variant: product.variant,
      label: formatProductDraftLabel(draft),
    },
    listingsCreated,
    candidate: updatedCandidate,
  };
}
