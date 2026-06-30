import { useQuery } from "@tanstack/react-query";

import type { NormalizationCandidateSummary } from "@/lib/services/normalization/candidates";

type CandidatesResponse = {
  items: NormalizationCandidateSummary[];
  total: number;
};

async function fetchCandidates(): Promise<CandidatesResponse> {
  const response = await fetch("/api/normalization/candidates");
  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.error?.message ?? "Failed to fetch candidates");
  }

  return json.data as CandidatesResponse;
}

export function useNormalizationCandidates() {
  return useQuery({
    queryKey: ["normalization-candidates"],
    queryFn: fetchCandidates,
  });
}
