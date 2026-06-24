import { db } from "@/lib/db";
import {
  buildMatchKey,
  normalizeTitle,
  tokenizeTitle,
} from "@/lib/services/normalization/tokenizer";

export type NormalizationResult = {
  titleNormalized: string;
  productId: string | null;
  matchKey: string | null;
  confidence: number;
  source: "ALIAS" | "UNMATCHED";
};

export async function resolveProductFromTitle(
  titleRaw: string,
  categoryHint?: string,
): Promise<NormalizationResult> {
  const titleNormalized = normalizeTitle(titleRaw);
  const tokens = tokenizeTitle(titleRaw);

  const aliasHit = await db.productAlias.findUnique({
    where: { alias: titleNormalized },
    select: { productId: true, confidence: true },
  });

  if (aliasHit) {
    return {
      titleNormalized,
      productId: aliasHit.productId,
      matchKey: null,
      confidence: aliasHit.confidence,
      source: "ALIAS",
    };
  }

  const matchKeyParts = categoryHint
    ? [categoryHint.toLowerCase(), ...tokens]
    : tokens;

  return {
    titleNormalized,
    productId: null,
    matchKey: matchKeyParts.length > 0 ? buildMatchKey(matchKeyParts) : null,
    confidence: 0,
    source: "UNMATCHED",
  };
}
