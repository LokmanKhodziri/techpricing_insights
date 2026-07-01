import { describe, expect, it } from "vitest";

import {
  applyTitleRules,
  extractCategoryHint,
} from "@/lib/services/normalization/rules";

describe("applyTitleRules", () => {
  it("expands shorthand gpu titles", () => {
    const variants = applyTitleRules("RTX2060S 8G");

    expect(variants.some((value) => value.includes("rtx 2060 super"))).toBe(
      true,
    );
    expect(variants.some((value) => value.includes("8gb"))).toBe(true);
  });
});

describe("extractCategoryHint", () => {
  it("detects gpu titles", () => {
    expect(extractCategoryHint("NVIDIA RTX 4070 12GB")).toBe("gpu");
  });

  it("detects cpu titles", () => {
    expect(extractCategoryHint("AMD Ryzen 5 5600X")).toBe("cpu");
  });
});
