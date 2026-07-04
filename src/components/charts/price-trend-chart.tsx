"use client";

import { Card, LineChart, Title } from "@tremor/react";

import { formatMyrFromSen } from "@/lib/format";
import { calculateMarginVsMsrp } from "@/lib/services/analytics/margin";
import type { PriceTrendSummary } from "@/lib/services/analytics/price-trend";

const PLATFORM_COLORS: Record<string, string> = {
  SHOPEE: "blue",
  LAZADA: "emerald",
  TIKTOK_SHOP: "violet",
  AMAZON_MY: "amber",
  CAROUSELL: "orange",
  OTHER: "gray",
};

type PriceTrendChartProps = {
  trend: PriceTrendSummary;
};

function formatMyr(value: number): string {
  return formatMyrFromSen(Math.round(value * 100));
}

export function PriceTrendChart({ trend }: PriceTrendChartProps) {
  const categories = trend.platforms.map(String);
  const colors = categories.map(
    (platform) => PLATFORM_COLORS[platform] ?? "gray",
  );

  const margin =
    trend.latestMyr !== null && trend.msrpMyr !== null
      ? calculateMarginVsMsrp(trend.latestMyr, trend.msrpMyr)
      : null;

  return (
    <Card className="rounded-xl border border-border bg-card p-6 shadow-none">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Title className="text-foreground">{trend.productName}</Title>
          <p className="mt-1 text-sm text-muted-foreground">
            Marketplace price trend (MYR)
          </p>
        </div>
        <div className="flex flex-wrap gap-6 text-sm">
          <div>
            <p className="text-muted-foreground">Latest</p>
            <p className="font-medium text-foreground">
              {trend.latestMyr !== null ? formatMyr(trend.latestMyr) : "—"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Lowest</p>
            <p className="font-medium text-foreground">
              {trend.lowestMyr !== null ? formatMyr(trend.lowestMyr) : "—"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Change</p>
            <p
              className={`font-medium ${
                trend.changePercent !== null && trend.changePercent < 0
                  ? "text-emerald-600"
                  : "text-foreground"
              }`}
            >
              {trend.changePercent !== null
                ? `${trend.changePercent.toFixed(1)}%`
                : "—"}
            </p>
          </div>
          {trend.msrpMyr !== null && (
            <div>
              <p className="text-muted-foreground">MSRP</p>
              <p className="font-medium text-foreground">
                {formatMyr(trend.msrpMyr)}
              </p>
            </div>
          )}
          {margin && (
            <div>
              <p className="text-muted-foreground">vs MSRP</p>
              <p
                className={`font-medium ${
                  margin.isBelowMsrp ? "text-emerald-600" : "text-amber-600"
                }`}
              >
                {margin.isBelowMsrp ? "−" : "+"}
                {Math.abs(margin.discountPercent).toFixed(1)}%
              </p>
            </div>
          )}
        </div>
      </div>

      {trend.points.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No listing history for this product yet.
        </p>
      ) : (
        <LineChart
          className="h-72"
          data={trend.points}
          index="date"
          categories={categories}
          colors={colors}
          valueFormatter={formatMyr}
          yAxisWidth={72}
          showAnimation
          curveType="monotone"
          connectNulls
        />
      )}
    </Card>
  );
}
