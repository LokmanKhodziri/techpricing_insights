export type MarginSummary = {
  msrpMyr: number;
  latestMyr: number;
  savingsMyr: number;
  discountPercent: number;
  isBelowMsrp: boolean;
};

export function calculateMarginVsMsrp(
  latestMyr: number,
  msrpMyr: number,
): MarginSummary {
  const savingsMyr = msrpMyr - latestMyr;
  const discountPercent = (savingsMyr / msrpMyr) * 100;

  return {
    msrpMyr,
    latestMyr,
    savingsMyr,
    discountPercent,
    isBelowMsrp: latestMyr < msrpMyr,
  };
}

export function calculateMarginFromSen(
  latestSen: number,
  msrpSen: number,
): MarginSummary {
  return calculateMarginVsMsrp(latestSen / 100, msrpSen / 100);
}
