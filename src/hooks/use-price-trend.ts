import { useQuery } from "@tanstack/react-query";

import type { PriceTrendSummary } from "@/lib/services/analytics/price-trend";

async function fetchPriceTrend(productId: string): Promise<PriceTrendSummary> {
  const response = await fetch(`/api/products/${productId}/price-trend`);
  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.error?.message ?? "Failed to fetch price trend");
  }

  return json.data as PriceTrendSummary;
}

export function usePriceTrend(productId: string | null) {
  return useQuery({
    queryKey: ["price-trend", productId],
    queryFn: () => fetchPriceTrend(productId!),
    enabled: Boolean(productId),
  });
}
