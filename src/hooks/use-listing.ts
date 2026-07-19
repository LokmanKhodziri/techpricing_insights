import { useQuery } from "@tanstack/react-query";

import type { ListingDetail } from "@/types/catalog";

async function fetchListing(id: string): Promise<ListingDetail> {
  const response = await fetch(`/api/listings/${id}`);
  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.error?.message ?? "Failed to fetch listing");
  }

  return json.data as ListingDetail;
}

export function useListing(id: string | null) {
  return useQuery({
    queryKey: ["listing", id],
    queryFn: () => fetchListing(id!),
    enabled: Boolean(id),
  });
}
