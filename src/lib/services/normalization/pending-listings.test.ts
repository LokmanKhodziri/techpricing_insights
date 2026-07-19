import { describe, expect, it } from "vitest";

import { parsePendingListings } from "@/lib/services/normalization/pending-listings";

describe("parsePendingListings", () => {
  it("returns an empty array for invalid values", () => {
    expect(parsePendingListings(null)).toEqual([]);
    expect(parsePendingListings({})).toEqual([]);
  });

  it("parses stored pending listing payloads", () => {
    const listings = parsePendingListings([
      {
        platform: "SHOPEE",
        titleRaw: "AMD Ryzen 7 5700X3D",
        titleNormalized: "amd ryzen 7 5700x3d",
        priceSen: 89900,
        capturedAt: "2026-01-01T00:00:00.000Z",
        rawPayload: { title: "AMD Ryzen 7 5700X3D", price: 899 },
      },
    ]);

    expect(listings).toHaveLength(1);
    expect(listings[0]?.priceSen).toBe(89900);
  });
});
