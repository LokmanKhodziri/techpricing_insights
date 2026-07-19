import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ListingDetail } from "@/types/catalog";

async function updateListingPrice(input: {
  listingId: string;
  priceMyr: number;
  originalPriceMyr?: number;
}) {
  const response = await fetch(`/api/listings/${input.listingId}/price`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      priceMyr: input.priceMyr,
      originalPriceMyr: input.originalPriceMyr,
    }),
  });

  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.error?.message ?? "Failed to update listing price");
  }

  return json.data as ListingDetail;
}

export function useUpdateListingPrice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateListingPrice,
    onSuccess: async (data) => {
      queryClient.setQueryData<ListingDetail>(["listing", data.id], data);

      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["listing", data.id] }),
        queryClient.refetchQueries({
          queryKey: ["product", data.productSlug],
        }),
        queryClient.refetchQueries({
          queryKey: ["price-trend", data.productId],
        }),
        queryClient.invalidateQueries({ queryKey: ["products"] }),
      ]);
    },
  });
}
