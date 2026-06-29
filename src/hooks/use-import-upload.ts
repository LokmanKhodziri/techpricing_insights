import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ImportFileInput } from "@/lib/schemas/listing";

export type ImportBatchResult = {
  id: string;
  fileName: string;
  fileFormat: string;
  rowCount: number;
  successCount: number;
  errorCount: number;
  errors: Array<{ row: number; message: string }> | null;
  importedAt: string;
};

async function postImport(payload: ImportFileInput): Promise<ImportBatchResult> {
  const response = await fetch("/api/imports", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.error?.message ?? "Import failed");
  }

  return json.data as ImportBatchResult;
}

export function useImportUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postImport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
      queryClient.invalidateQueries({ queryKey: ["price-trend"] });
    },
  });
}
