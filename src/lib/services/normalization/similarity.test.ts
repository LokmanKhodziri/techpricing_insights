import { describe, expect, it } from "vitest";

import { similarityRatio } from "@/lib/services/normalization/similarity";

describe("similarityRatio", () => {
  it("returns 1 for identical strings", () => {
    expect(similarityRatio("rtx 2060 super", "rtx 2060 super")).toBe(1);
  });

  it("returns a high score for minor typos", () => {
    const score = similarityRatio("rtx 2060 super 8gb", "rtx 2060 super 8g");
    expect(score).toBeGreaterThan(0.9);
  });

  it("returns 0 for empty input", () => {
    expect(similarityRatio("", "rtx 4070")).toBe(0);
  });
});
