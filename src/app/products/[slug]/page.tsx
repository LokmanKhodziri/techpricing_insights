"use client";

import { use } from "react";

import { PriceTrendChart } from "@/components/charts/price-trend-chart";
import {
  ProductBackLink,
  ProductDetailView,
} from "@/components/products/product-detail";
import { usePriceTrend } from "@/hooks/use-price-trend";
import { useProduct } from "@/hooks/use-product";

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

      {trend && <PriceTrendChart trend={trend} />}

      <ProductDetailView product={product} />
    </div>
  );
}
