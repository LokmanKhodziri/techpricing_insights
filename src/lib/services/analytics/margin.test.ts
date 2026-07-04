import { describe, expect, it } from "vitest";

import { calculateMarginVsMsrp } from "@/lib/services/analytics/margin";

describe("calculateMarginVsMsrp", () => {
  it("calculates discount below msrp", () => {
    const margin = calculateMarginVsMsrp(699, 1399);

    expect(margin.savingsMyr).toBe(700);
    expect(margin.discountPercent).toBeCloseTo(50.04, 1);
    expect(margin.isBelowMsrp).toBe(true);
  });

  it("handles prices above msrp", () => {
    const margin = calculateMarginVsMsrp(1500, 1399);

    expect(margin.savingsMyr).toBe(-101);
    expect(margin.isBelowMsrp).toBe(false);
  });
});
