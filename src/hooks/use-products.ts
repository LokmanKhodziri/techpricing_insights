import { useQuery } from "@tanstack/react-query";

import type { ProductCategory } from "@/lib/schemas/common";
import type { ProductSummary } from "@/types/catalog";

export type ProductsResponse = {
  items: ProductSummary[];
  total: number;
  page: number;
  pageSize: number;
};

type FetchProductsOptions = {
  category?: ProductCategory;
  pageSize?: number;
};

async function fetchProducts(
  options: FetchProductsOptions = {},
): Promise<ProductsResponse> {
  const params = new URLSearchParams();
  if (options.category) {
    params.set("category", options.category);
  }
  if (options.pageSize) {
    params.set("pageSize", String(options.pageSize));
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

export function useProducts(
  category?: ProductCategory | null,
  options?: { pageSize?: number },
) {
  const pageSize = options?.pageSize;
  return useQuery({
    queryKey: ["products", category ?? "all", pageSize ?? "default"],
    queryFn: () =>
      fetchProducts({
        category: category ?? undefined,
        pageSize,
      }),
  });
}
