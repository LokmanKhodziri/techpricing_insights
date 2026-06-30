import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ImportFileInput } from "@/lib/schemas/listing";
import type { ImportListingsResult } from "@/lib/services/ingestion";

async function postImport(payload: ImportFileInput): Promise<ImportListingsResult> {
  const response = await fetch("/api/imports", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.error?.message ?? "Import failed");
  }

  return json.data as ImportListingsResult;
}

export function useImportUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postImport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
      queryClient.invalidateQueries({ queryKey: ["price-trend"] });
      queryClient.invalidateQueries({ queryKey: ["normalization-candidates"] });
    },
  });
}

export type { ImportListingsResult as ImportBatchResult };
