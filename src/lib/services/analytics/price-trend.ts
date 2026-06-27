import type { MarketplacePlatform } from "@prisma/client";

export type PriceTrendPoint = Record<string, string | number> & {
  date: string;
};

export type PriceTrendSummary = {
  productId: string;
  productName: string;
  msrpMyr: number | null;
  latestMyr: number | null;
  lowestMyr: number | null;
  changePercent: number | null;
  platforms: MarketplacePlatform[];
  points: PriceTrendPoint[];
};

type ListingRow = {
  platform: MarketplacePlatform;
  priceSen: number;
  capturedAt: Date;
};

function formatDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function buildPriceTrend(
  productId: string,
  productName: string,
  msrpSen: number | null,
  listings: ListingRow[],
): PriceTrendSummary {
  const byDatePlatform = new Map<string, Map<MarketplacePlatform, number>>();

  for (const listing of listings) {
    const dateKey = formatDateKey(listing.capturedAt);
    const priceMyr = listing.priceSen / 100;

    if (!byDatePlatform.has(dateKey)) {
      byDatePlatform.set(dateKey, new Map());
    }

    const platformMap = byDatePlatform.get(dateKey)!;
    const existing = platformMap.get(listing.platform);

    if (existing === undefined || priceMyr < existing) {
      platformMap.set(listing.platform, priceMyr);
    }
  }

  const platforms = [
    ...new Set(listings.map((listing) => listing.platform)),
  ].sort();

  const points: PriceTrendPoint[] = [...byDatePlatform.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, platformMap]) => {
      const point: PriceTrendPoint = { date };

      for (const platform of platforms) {
        const value = platformMap.get(platform);
        if (value !== undefined) {
          point[platform] = value;
        }
      }

      return point;
    });

  const allPrices = listings.map((listing) => listing.priceSen / 100);
  const latestMyr =
    allPrices.length > 0
      ? listings
          .slice()
          .sort(
            (a, b) => b.capturedAt.getTime() - a.capturedAt.getTime(),
          )[0].priceSen / 100
      : null;

  const lowestMyr = allPrices.length > 0 ? Math.min(...allPrices) : null;

  const sortedByDate = [...listings].sort(
    (a, b) => a.capturedAt.getTime() - b.capturedAt.getTime(),
  );
  const firstPrice = sortedByDate[0]?.priceSen
    ? sortedByDate[0].priceSen / 100
    : null;
  const lastPrice = sortedByDate.at(-1)?.priceSen
    ? sortedByDate.at(-1)!.priceSen / 100
    : null;

  const changePercent =
    firstPrice && lastPrice
      ? ((lastPrice - firstPrice) / firstPrice) * 100
      : null;

  return {
    productId,
    productName,
    msrpMyr: msrpSen !== null ? msrpSen / 100 : null,
    latestMyr,
    lowestMyr,
    changePercent,
    platforms,
    points,
  };
}
