import { useQuery } from "@tanstack/react-query";

import type { ProductDetail } from "@/types/catalog";

async function fetchProductBySlug(slug: string): Promise<ProductDetail> {
  const response = await fetch(`/api/products/slug/${slug}`);
  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.error?.message ?? "Failed to fetch product");
  }

  return json.data as ProductDetail;
}

export function useProduct(slug: string | null) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProductBySlug(slug!),
    enabled: Boolean(slug),
  });
}
