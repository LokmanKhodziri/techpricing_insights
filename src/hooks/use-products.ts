import { useQuery } from "@tanstack/react-query";

import type { ProductCategory } from "@/lib/schemas/common";
import type { ProductSummary } from "@/types/catalog";

export type ProductsResponse = {
  items: ProductSummary[];
  total: number;
  page: number;
  pageSize: number;
};

async function fetchProducts(
  category?: ProductCategory,
): Promise<ProductsResponse> {
  const params = new URLSearchParams();
  if (category) {
    params.set("category", category);
  }

  const query = params.toString();
  const response = await fetch(
    query ? `/api/products?${query}` : "/api/products",
  );
  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.error?.message ?? "Failed to fetch products");
  }

  return json.data as ProductsResponse;
}

export function useProducts(category?: ProductCategory | null) {
  return useQuery({
    queryKey: ["products", category ?? "all"],
    queryFn: () => fetchProducts(category ?? undefined),
  });
}
