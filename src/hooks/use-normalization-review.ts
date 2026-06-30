import { useMutation, useQueryClient } from "@tanstack/react-query";

async function approveCandidate(input: {
  candidateId: string;
  productId: string;
}) {
  const response = await fetch(
    `/api/normalization/candidates/${input.candidateId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: input.productId }),
    },
  );

  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.error?.message ?? "Failed to approve candidate");
  }

  return json.data;
}

async function rejectCandidate(candidateId: string) {
  const response = await fetch(
    `/api/normalization/candidates/${candidateId}`,
    { method: "DELETE" },
  );

  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.error?.message ?? "Failed to reject candidate");
  }

  return json.data;
}

export function useApproveCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveCandidate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["normalization-candidates"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
    },
  });
}

export function useRejectCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rejectCandidate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["normalization-candidates"] });
    },
  });
}
