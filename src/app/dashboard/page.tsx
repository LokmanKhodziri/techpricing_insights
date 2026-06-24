"use client";

import { useProducts } from "@/hooks/use-products";

export default function DashboardPage() {
  const { data, isLoading, isError, error } = useProducts();

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Canonical products and listing coverage.
        </p>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Loading products...</p>
      )}

      {isError && (
        <p className="text-sm text-destructive">
          {(error as Error).message}
        </p>
      )}

      {data && data.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-8 text-sm text-muted-foreground">
          No products yet. Seed the database or import listings once products
          and aliases exist.
        </div>
      )}

      {data && data.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Listings</th>
              </tr>
            </thead>
            <tbody>
              {data.map((product) => (
                <tr key={product.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    {product.brand} {product.model}
                    {product.variant ? ` ${product.variant}` : ""}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {product.category}
                  </td>
                  <td className="px-4 py-3">{product.listingCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
