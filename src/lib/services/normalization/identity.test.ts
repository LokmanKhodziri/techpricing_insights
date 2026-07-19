import { describe, expect, it } from "vitest";

import {
  extractCatalogProductIdentity,
  extractCpuIdentity,
  extractProductIdentity,
  identitiesCompatible,
} from "@/lib/services/normalization/identity";

describe("extractCpuIdentity", () => {
  it("parses amd ryzen titles", () => {
    expect(extractCpuIdentity("AMD Ryzen 7 5700X3D")).toEqual({
      brand: "amd",
      series: "7",
      model: "5700x3d",
    });
  });

  it("parses ryzen 5 shorthand aliases", () => {
    expect(extractCpuIdentity("R5 5600X")).toEqual({
      brand: "amd",
      series: "5",
      model: "5600x",
    });
  });
});

describe("identitiesCompatible", () => {
  it("rejects cross-series ryzen matches", () => {
    const imported = extractProductIdentity("AMD Ryzen 7 5700X3D");
    const catalog = extractCatalogProductIdentity("AMD", "Ryzen 5 5600X");

    expect(identitiesCompatible(imported, catalog)).toBe(false);
  });

  it("allows same-series ryzen suggestions", () => {
    const imported = extractProductIdentity("AMD Ryzen 5 5500");
    const catalog = extractCatalogProductIdentity("AMD", "Ryzen 5 5600X");

    expect(identitiesCompatible(imported, catalog)).toBe(true);
  });

  it("allows same ryzen sku with different suffixes", () => {
    const imported = extractProductIdentity("AMD Ryzen 7 5700X");
    const catalog = extractProductIdentity("AMD Ryzen 7 5700X3D");

    expect(identitiesCompatible(imported, catalog)).toBe(true);
  });

  it("rejects different gpu chipsets", () => {
    const imported = extractProductIdentity("NVIDIA RTX 4070 12GB");
    const catalog = extractCatalogProductIdentity(
      "NVIDIA",
      "GeForce RTX 2060 Super",
      "8GB",
    );

    expect(identitiesCompatible(imported, catalog)).toBe(false);
  });
});
