import type { AliasSource } from "@prisma/client";

import { db } from "@/lib/db";
import { applyTitleRules, extractCategoryHint } from "@/lib/services/normalization/rules";
import {
  FUZZY_AUTO_MATCH_THRESHOLD,
  FUZZY_SUGGEST_THRESHOLD,
  similarityRatio,
} from "@/lib/services/normalization/similarity";
import {
  extractCatalogProductIdentity,
  extractProductIdentity,
  identitiesCompatible,
} from "@/lib/services/normalization/identity";
import type { NormalizationResult } from "@/lib/services/normalization/types";
import {
  buildMatchKey,
  normalizeTitle,
  tokenizeTitle,
} from "@/lib/services/normalization/tokenizer";

async function findAliasMatch(titleNormalized: string) {
  return db.productAlias.findUnique({
    where: { alias: titleNormalized },
    select: { productId: true, confidence: true, source: true },
  });
}

async function findMatchKeyProduct(matchKey: string) {
  return db.product.findUnique({
    where: { matchKey },
    select: { id: true },
  });
}

function isCompatibleFuzzyTarget(
  titleNormalized: string,
  target: {
    alias: string;
    brand: string;
    model: string;
    variant: string | null;
  },
) {
  const titleIdentity = extractProductIdentity(titleNormalized);
  const aliasIdentity = extractProductIdentity(target.alias);
  const productIdentity = extractCatalogProductIdentity(
    target.brand,
    target.model,
    target.variant,
  );

  return (
    identitiesCompatible(titleIdentity, aliasIdentity) &&
    identitiesCompatible(titleIdentity, productIdentity)
  );
}

async function findFuzzyAliasMatch(titleNormalized: string) {
  const aliases = await db.productAlias.findMany({
    select: {
      alias: true,
      productId: true,
      confidence: true,
      source: true,
      product: {
        select: {
          brand: true,
          model: true,
          variant: true,
        },
      },
    },
  });

  let best: {
    productId: string;
    confidence: number;
    source: AliasSource;
    alias: string;
  } | null = null;

  for (const alias of aliases) {
    if (
      !isCompatibleFuzzyTarget(titleNormalized, {
        alias: alias.alias,
        brand: alias.product.brand,
        model: alias.product.model,
        variant: alias.product.variant,
      })
    ) {
      continue;
    }

    const score = similarityRatio(titleNormalized, alias.alias);
    if (score < FUZZY_SUGGEST_THRESHOLD) continue;

    if (!best || score > best.confidence) {
      best = {
        productId: alias.productId,
        confidence: score,
        source: alias.source,
        alias: alias.alias,
      };
    }
  }

  return best;
}

export async function resolveProductFromTitle(
  titleRaw: string,
  categoryHint?: string,
): Promise<NormalizationResult> {
  const titleNormalized = normalizeTitle(titleRaw);
  const hint = categoryHint ?? extractCategoryHint(titleRaw);

  const directAlias = await findAliasMatch(titleNormalized);
  if (directAlias) {
    return {
      titleNormalized,
      productId: directAlias.productId,
      matchKey: null,
      confidence: directAlias.confidence,
      source: "ALIAS",
      aliasSource: directAlias.source,
      suggestedProductId: null,
    };
  }

  const ruleVariants = applyTitleRules(titleRaw);
  for (const variant of ruleVariants) {
    if (variant === titleNormalized) continue;

    const aliasHit = await findAliasMatch(variant);
    if (aliasHit) {
      return {
        titleNormalized: variant,
        productId: aliasHit.productId,
        matchKey: null,
        confidence: aliasHit.confidence,
        source: "RULE",
        aliasSource: "RULE",
        suggestedProductId: null,
      };
    }

    const tokens = tokenizeTitle(variant);
    const matchKeyParts = hint ? [hint, ...tokens] : tokens;
    const matchKey =
      matchKeyParts.length > 0 ? buildMatchKey(matchKeyParts) : null;

    if (matchKey) {
      const product = await findMatchKeyProduct(matchKey);
      if (product) {
        return {
          titleNormalized: variant,
          productId: product.id,
          matchKey,
          confidence: 0.98,
          source: "MATCH_KEY",
          aliasSource: "RULE",
          suggestedProductId: null,
        };
      }
    }
  }

  const tokens = tokenizeTitle(titleRaw);
  const matchKeyParts = hint ? [hint, ...tokens] : tokens;
  const matchKey =
    matchKeyParts.length > 0 ? buildMatchKey(matchKeyParts) : null;

  if (matchKey) {
    const product = await findMatchKeyProduct(matchKey);
    if (product) {
      return {
        titleNormalized,
        productId: product.id,
        matchKey,
        confidence: 0.98,
        source: "MATCH_KEY",
        aliasSource: "RULE",
        suggestedProductId: null,
      };
    }
  }

  const fuzzy = await findFuzzyAliasMatch(titleNormalized);
  if (fuzzy) {
    const autoMatch = fuzzy.confidence >= FUZZY_AUTO_MATCH_THRESHOLD;

    return {
      titleNormalized,
      productId: autoMatch ? fuzzy.productId : null,
      matchKey,
      confidence: fuzzy.confidence,
      source: autoMatch ? "FUZZY" : "UNMATCHED",
      aliasSource: "FUZZY",
      suggestedProductId: autoMatch ? null : fuzzy.productId,
    };
  }

  return {
    titleNormalized,
    productId: null,
    matchKey,
    confidence: 0,
    source: "UNMATCHED",
    aliasSource: null,
    suggestedProductId: null,
  };
}
