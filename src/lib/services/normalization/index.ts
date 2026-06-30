export type { NormalizationResult } from "@/lib/services/normalization/types";
export { resolveProductFromTitle } from "@/lib/services/normalization/resolve-product";
export {
  applyTitleRules,
  extractCategoryHint,
} from "@/lib/services/normalization/rules";
export {
  normalizeTitle,
  tokenizeTitle,
  buildMatchKey,
  buildSlug,
} from "@/lib/services/normalization/tokenizer";
