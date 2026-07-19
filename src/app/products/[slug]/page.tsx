"use client";

import { use, useMemo } from "react";

import { PriceTrendChart } from "@/components/charts/price-trend-chart";
import {
  ProductBackLink,
  ProductDetailView,
} from "@/components/products/product-detail";
import { usePriceTrend } from "@/hooks/use-price-trend";
import { useProduct } from "@/hooks/use-product";
import { senToMyr } from "@/lib/format";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = use(params);
  const {
    data: product,
    isLoading,
    isError,
    error,
  } = useProduct(slug);

  const {
    data: trend,
    isLoading: trendLoading,
    isError: trendError,
    error: trendErrorObj,
  } = usePriceTrend(product?.id ?? null);

  const chartTrend = useMemo(() => {
    if (!trend || !product) {
      return trend;
    }

    return {
      ...trend,
      msrpMyr:
        product.msrpSen !== null ? senToMyr(product.msrpSen) : trend.msrpMyr,
    };
  }, [product, trend]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-muted-foreground">
        Loading product...
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-10">
        <ProductBackLink />
        <p className="text-sm text-destructive">
          {(error as Error)?.message ?? "Product not found"}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <ProductBackLink />

      {trendLoading && (
        <p className="text-sm text-muted-foreground">Loading price trend...</p>
      )}

      {trendError && (
        <p className="text-sm text-destructive">
          {(trendErrorObj as Error).message}
        </p>
      )}

      {chartTrend && <PriceTrendChart trend={chartTrend} />}

      <ProductDetailView product={product} />
    </div>
  );
}
