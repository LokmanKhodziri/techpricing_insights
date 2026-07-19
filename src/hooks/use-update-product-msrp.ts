import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { PriceTrendSummary } from "@/lib/services/analytics/price-trend";
import type { ProductDetail } from "@/types/catalog";

async function updateProductMsrp(input: {
  productId: string;
  msrpMyr: number;
}) {
  const response = await fetch(`/api/products/${input.productId}/msrp`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ msrpMyr: input.msrpMyr }),
  });

  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.error?.message ?? "Failed to update product price");
  }

  return json.data as {
    id: string;
    slug: string;
    msrpSen: number;
  };
}

export function useUpdateProductMsrp(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProductMsrp,
    onSuccess: async (data) => {
      queryClient.setQueryData<ProductDetail>(["product", slug], (current) =>
        current ? { ...current, msrpSen: data.msrpSen } : current,
      );

      queryClient.setQueryData<PriceTrendSummary>(
        ["price-trend", data.id],
        (current) =>
          current
            ? { ...current, msrpMyr: data.msrpSen / 100 }
            : current,
      );

      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["product", slug] }),
        queryClient.refetchQueries({ queryKey: ["price-trend", data.id] }),
        queryClient.invalidateQueries({ queryKey: ["products"] }),
      ]);
    },
  });
}
