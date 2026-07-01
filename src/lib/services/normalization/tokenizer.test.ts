import { describe, expect, it } from "vitest";

import {
  buildMatchKey,
  normalizeTitle,
  tokenizeTitle,
} from "@/lib/services/normalization/tokenizer";

describe("normalizeTitle", () => {
  it("lowercases and strips punctuation", () => {
    expect(normalizeTitle("RTX 2060S 8GB - Ready Stock!")).toBe(
      "rtx 2060s 8gb ready stock",
    );
  });
});

describe("tokenizeTitle", () => {
  it("removes marketplace noise tokens", () => {
    expect(tokenizeTitle("RTX 4070 New Malaysia Free Shipping")).toEqual([
      "rtx",
      "4070",
    ]);
  });
});

describe("buildMatchKey", () => {
  it("joins normalized parts with pipes", () => {
    expect(buildMatchKey(["gpu", "nvidia", "rtx-4070", "12gb"])).toBe(
      "gpu|nvidia|rtx-4070|12gb",
    );
  });
});
