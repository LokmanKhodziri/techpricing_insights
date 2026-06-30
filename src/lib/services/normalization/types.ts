import type { AliasSource } from "@prisma/client";

export type NormalizationMatchSource =
  | "ALIAS"
  | "RULE"
  | "MATCH_KEY"
  | "FUZZY"
  | "UNMATCHED";

export type NormalizationResult = {
  titleNormalized: string;
  productId: string | null;
  matchKey: string | null;
  confidence: number;
  source: NormalizationMatchSource;
  aliasSource: AliasSource | null;
  suggestedProductId: string | null;
};
