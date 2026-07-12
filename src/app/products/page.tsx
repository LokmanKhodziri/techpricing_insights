"use client";

import { Suspense } from "react";

import {
  ProductCategoryFilter,
  useProductCategoryFilter,
} from "@/components/products/product-category-filter";
import { ProductsTable } from "@/components/products/products-table";
import { CATEGORY_LABELS } from "@/lib/constants/platforms";
import { useProducts } from "@/hooks/use-products";

function ProductsPageContent() {
  const { category } = useProductCategoryFilter();
  const { data, isLoading, isError, error } = useProducts(category);

  const products = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">
            Browse PC parts sold in Malaysia — filter by CPU, GPU, RAM, and
            more.
          </p>
        </div>

        <ProductCategoryFilter />
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Loading products...</p>
      )}

      {isError && (
        <p className="text-sm text-destructive">{(error as Error).message}</p>
      )}

      {!isLoading && !isError && products.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-8 text-sm text-muted-foreground">
          {category ? (
            <>
              No {CATEGORY_LABELS[category]} products found. Try another
              category or run{" "}
              <code className="rounded bg-muted px-1 py-0.5">npm run db:seed</code>.
            </>
          ) : (
            <>
              No products yet. Run{" "}
              <code className="rounded bg-muted px-1 py-0.5">npm run db:seed</code>{" "}
              to load sample data.
            </>
          )}
        </div>
      )}

      {products.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {total} product{total === 1 ? "" : "s"}
            {category ? ` in ${CATEGORY_LABELS[category]}` : ""}
          </p>
          <ProductsTable products={products} linkToDetail />
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-muted-foreground">
          Loading products...
        </div>
      }
    >
      <ProductsPageContent />
    </Suspense>
  );
}
