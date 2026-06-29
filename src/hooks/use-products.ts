import { useQuery } from "@tanstack/react-query";

import type { ProductSummary } from "@/types/catalog";

export type ProductsResponse = {
  items: ProductSummary[];
  total: number;
  page: number;
  pageSize: number;
};

async function fetchProducts(): Promise<ProductSummary[]> {
  const response = await fetch("/api/products");
  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.error?.message ?? "Failed to fetch products");
  }

  const data = json.data as ProductsResponse;
  return data.items;
}

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });
}
