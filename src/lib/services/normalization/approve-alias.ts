import type { AliasSource } from "@prisma/client";

import { db } from "@/lib/db";
import { AppError } from "@/lib/errors/app-error";
import { materializePendingListings } from "@/lib/services/normalization/pending-listings";
import { normalizeTitle } from "@/lib/services/normalization/tokenizer";

export async function createProductAlias(input: {
  productId: string;
  titleRaw: string;
  titleNormalized?: string;
  source?: AliasSource;
  confidence?: number;
}) {
  const alias = input.titleNormalized ?? normalizeTitle(input.titleRaw);

  const product = await db.product.findUnique({
    where: { id: input.productId },
    select: { id: true, aliases: true },
  });

  if (!product) {
    throw new AppError("NOT_FOUND", "Product not found", 404);
  }

  const aliasRecord = await db.productAlias.upsert({
    where: { alias },
    create: {
      productId: input.productId,
      alias,
      aliasRaw: input.titleRaw,
      confidence: input.confidence ?? 1,
      source: input.source ?? "MANUAL",
    },
    update: {
      productId: input.productId,
      aliasRaw: input.titleRaw,
      confidence: input.confidence ?? 1,
      source: input.source ?? "MANUAL",
    },
  });

  if (!product.aliases.includes(alias)) {
    await db.product.update({
      where: { id: input.productId },
      data: {
        aliases: [...product.aliases, alias],
      },
    });
  }

  return aliasRecord;
}

export async function approveCandidate(input: {
  candidateId: string;
  productId: string;
}) {
  const candidate = await db.normalizationCandidate.findUnique({
    where: { id: input.candidateId },
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

  await createProductAlias({
    productId: input.productId,
    titleRaw: candidate.titleRaw,
    titleNormalized: candidate.titleNormalized,
    source: "MANUAL",
    confidence: 1,
  });

  const listingsCreated = await materializePendingListings({
    titleNormalized: candidate.titleNormalized,
    productId: input.productId,
  });

  const updatedCandidate = await db.normalizationCandidate.update({
    where: { id: input.candidateId },
    data: {
      status: "APPROVED",
      suggestedProductId: input.productId,
      confidence: 1,
    },
  });

  return {
    ...updatedCandidate,
    listingsCreated,
  };
}
