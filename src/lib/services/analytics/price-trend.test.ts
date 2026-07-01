import { describe, expect, it } from "vitest";

import { buildPriceTrend } from "@/lib/services/analytics/price-trend";

describe("buildPriceTrend", () => {
  it("groups listings by date and platform using lowest price", () => {
    const trend = buildPriceTrend(
      "product-1",
      "NVIDIA RTX 2060 Super",
      139900,
      [
        {
          platform: "SHOPEE",
          priceSen: 74900,
          capturedAt: new Date("2026-06-01T12:00:00.000Z"),
        },
        {
          platform: "LAZADA",
          priceSen: 76900,
          capturedAt: new Date("2026-06-01T12:00:00.000Z"),
        },
        {
          platform: "SHOPEE",
          priceSen: 72900,
          capturedAt: new Date("2026-06-15T12:00:00.000Z"),
        },
      ],
    );

    expect(trend.points).toHaveLength(2);
    expect(trend.points[0]).toMatchObject({
      date: "2026-06-01",
      SHOPEE: 749,
      LAZADA: 769,
    });
    expect(trend.points[1]).toMatchObject({
      date: "2026-06-15",
      SHOPEE: 729,
    });
    expect(trend.latestMyr).toBe(729);
    expect(trend.lowestMyr).toBe(729);
    expect(trend.changePercent).toBeCloseTo(-2.67, 1);
  });
});
