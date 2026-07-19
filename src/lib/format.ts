export function formatMyrFromSen(sen: number): string {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
  }).format(sen / 100);
}

export function myrToSen(myr: number): number {
  return Math.round(myr * 100);
}

export function senToMyr(sen: number): number {
  return sen / 100;
}

export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}
