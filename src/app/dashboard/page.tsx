"use client";

import { useMemo, useState } from "react";

import { PriceTrendChart } from "@/components/charts/price-trend-chart";
import { ProductsTable } from "@/components/products/products-table";
import { usePriceTrend } from "@/hooks/use-price-trend";
import { useProducts } from "@/hooks/use-products";

const DEFAULT_SLUG = "nvidia-geforce-rtx-2060-super-8gb";

export default function DashboardPage() {
  const { data: products, isLoading, isError, error } = useProducts();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const activeProductId = useMemo(() => {
    if (selectedId) return selectedId;
    if (!products?.length) return null;

    const rtx2060 = products.find((product) => product.slug === DEFAULT_SLUG);
    return rtx2060?.id ?? products[0].id;
  }, [products, selectedId]);

  const {
    data: trend,
    isLoading: trendLoading,
    isError: trendError,
    error: trendErrorObj,
  } = usePriceTrend(activeProductId);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Pricing trends and product coverage across Malaysian marketplaces.
        </p>
      </div>

      {trendLoading && (
        <p className="text-sm text-muted-foreground">Loading price trend...</p>
      )}

      {trendError && (
        <p className="text-sm text-destructive">
          {(trendErrorObj as Error).message}
        </p>
      )}

      {trend && <PriceTrendChart trend={trend} />}

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-medium">Products</h2>
          {products && products.length > 0 && (
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              Chart product
              <select
                className="rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground"
                value={activeProductId ?? ""}
                onChange={(event) => setSelectedId(event.target.value)}
              >
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.brand} {product.model}
                    {product.variant ? ` ${product.variant}` : ""}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        {isLoading && (
          <p className="text-sm text-muted-foreground">Loading products...</p>
        )}

        {isError && (
          <p className="text-sm text-destructive">
            {(error as Error).message}
          </p>
        )}

        {products && products.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-8 text-sm text-muted-foreground">
            No products yet. Run{" "}
            <code className="rounded bg-muted px-1 py-0.5">npm run db:seed</code>{" "}
            to load sample data.
          </div>
        )}

        {products && products.length > 0 && (
          <ProductsTable
            products={products}
            activeProductId={activeProductId}
            onSelect={setSelectedId}
            linkToDetail
          />
        )}
      </div>
    </div>
  );
}
