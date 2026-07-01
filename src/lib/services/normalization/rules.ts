import { normalizeTitle } from "@/lib/services/normalization/tokenizer";

const TITLE_TRANSFORMATIONS: Array<(value: string) => string> = [
  (value) => value.replace(/\b(rtx|gtx|rx)(\d{4})s\b/g, "$1 $2 super"),
  (value) => value.replace(/\b(rtx|gtx|rx)(\d{4})\b/g, "$1 $2"),
  (value) => value.replace(/\b(\d{4})s\b/g, "$1 super"),
  (value) => value.replace(/\b(\d+)g\b/g, "$1gb"),
  (value) => value.replace(/\bsuper\s+super\b/g, "super"),
  (value) => value.replace(/\s+/g, " ").trim(),
];

export function applyTitleRules(title: string): string[] {
  const normalized = normalizeTitle(title);
  const variants = new Set<string>([normalized]);

  let current = normalized;
  for (const transform of TITLE_TRANSFORMATIONS) {
    const next = transform(current);
    if (next && next !== current) {
      variants.add(next);
      current = next;
    }
  }

  return [...variants];
}

export function extractCategoryHint(title: string): string | undefined {
  const normalized = normalizeTitle(title);

  if (/\b(rtx|gtx|rx|geforce|radeon)\b/.test(normalized)) return "gpu";
  if (/\b(ryzen|core i\d|threadripper|xeon)\b/.test(normalized)) return "cpu";
  if (/\b(ddr[45]|ram|vengeance|trident)\b/.test(normalized)) return "ram";

  return undefined;
}
