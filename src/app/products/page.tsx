"use client";

import { useProducts } from "@/hooks/use-products";
import { ProductsTable } from "@/components/products/products-table";

export default function ProductsPage() {
  const { data: products, isLoading, isError, error } = useProducts();

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
        <p className="text-sm text-muted-foreground">
          Canonical hardware catalog with normalized specs and listing coverage.
        </p>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Loading products...</p>
      )}

      {isError && (
        <p className="text-sm text-destructive">{(error as Error).message}</p>
      )}

      {products && products.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-8 text-sm text-muted-foreground">
          No products yet. Run{" "}
          <code className="rounded bg-muted px-1 py-0.5">npm run db:seed</code>{" "}
          to load sample data.
        </div>
      )}

      {products && products.length > 0 && (
        <ProductsTable products={products} linkToDetail />
      )}
    </div>
  );
}
