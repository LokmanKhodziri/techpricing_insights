const NOISE_TOKENS = new Set([
  "new",
  "used",
  "free",
  "shipping",
  "warranty",
  "original",
  "genuine",
  "malaysia",
  "ready",
  "stock",
]);

export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenizeTitle(title: string): string[] {
  return normalizeTitle(title)
    .split(" ")
    .filter((token) => token.length > 1 && !NOISE_TOKENS.has(token));
}

export function buildMatchKey(parts: string[]): string {
  return parts
    .map((part) =>
      part
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .trim(),
    )
    .filter(Boolean)
    .join("|");
}

export function buildSlug(parts: string[]): string {
  return parts
    .map((part) =>
      part
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .trim(),
    )
    .filter(Boolean)
    .join("-");
}
