import { useMutation, useQueryClient } from "@tanstack/react-query";

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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["product", slug] });
      queryClient.invalidateQueries({ queryKey: ["product", data.slug] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["price-trend", data.id] });
    },
  });
}
