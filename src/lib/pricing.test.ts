import { describe, expect, it } from "vitest";

import {
  formatVoucherSavings,
  voucherSavingsSen,
} from "@/lib/pricing";

describe("voucherSavingsSen", () => {
  it("returns savings when list price is higher than paid price", () => {
    expect(voucherSavingsSen(195900, 206900)).toBe(11000);
    expect(formatVoucherSavings(195900, 206900)).toBe("RM\u00a0110.00");
  });

  it("returns null when original price is missing or not higher", () => {
    expect(voucherSavingsSen(195900, null)).toBeNull();
    expect(voucherSavingsSen(195900, 195900)).toBeNull();
  });
});
