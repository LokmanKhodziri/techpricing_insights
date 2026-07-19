/** Paid / after-voucher price vs list price before vouchers. */
export function voucherSavingsSen(
  priceSen: number,
  originalPriceSen: number | null | undefined,
): number | null {
  if (originalPriceSen == null || originalPriceSen <= priceSen) {
    return null;
  }

  return originalPriceSen - priceSen;
}

export function formatVoucherSavings(
  priceSen: number,
  originalPriceSen: number | null | undefined,
): string | null {
  const savings = voucherSavingsSen(priceSen, originalPriceSen);
  if (savings === null) {
    return null;
  }

  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
  }).format(savings / 100);
}
