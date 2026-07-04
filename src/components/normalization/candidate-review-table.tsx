"use client";

import { useMemo, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import {
  useApproveCandidate,
  useRejectCandidate,
} from "@/hooks/use-normalization-review";
import { useNormalizationCandidates } from "@/hooks/use-normalization-candidates";
import { useProducts } from "@/hooks/use-products";
import type { NormalizationCandidateSummary } from "@/lib/services/normalization/candidates";
import { cn } from "@/lib/utils";

function CandidateRow({
  candidate,
  products,
}: {
  candidate: NormalizationCandidateSummary;
  products: Array<{ id: string; label: string }>;
}) {
  const [productId, setProductId] = useState(
    candidate.suggestedProductId ?? products[0]?.id ?? "",
  );
  const approveMutation = useApproveCandidate();
  const rejectMutation = useRejectCandidate();

  const isBusy = approveMutation.isPending || rejectMutation.isPending;

  return (
    <tr className="border-t border-border align-top">
      <td className="px-4 py-3">
        <p className="font-medium">{candidate.titleRaw}</p>
        <p className="mt-1 font-mono text-xs text-muted-foreground">
          {candidate.titleNormalized}
        </p>
      </td>
      <td className="px-4 py-3 text-muted-foreground">
        {candidate.suggestedProductName ? (
          <div>
            <p>{candidate.suggestedProductName}</p>
            <p className="text-xs">
              {(candidate.confidence * 100).toFixed(0)}% ·{" "}
              {candidate.matchSource ?? "none"}
            </p>
          </div>
        ) : (
          "—"
        )}
      </td>
      <td className="px-4 py-3">{candidate.occurrenceCount}</td>
      <td className="px-4 py-3">
        <select
          className="w-full min-w-[180px] rounded-md border border-border bg-background px-2 py-1 text-sm"
          value={productId}
          onChange={(event) => setProductId(event.target.value)}
          disabled={isBusy || products.length === 0}
        >
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.label}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={cn(buttonVariants({ size: "sm" }))}
            disabled={isBusy || !productId}
            onClick={() =>
              approveMutation.mutate({
                candidateId: candidate.id,
                productId,
              })
            }
          >
            Approve
          </button>
          <button
            type="button"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            disabled={isBusy}
            onClick={() => rejectMutation.mutate(candidate.id)}
          >
            Reject
          </button>
        </div>
      </td>
    </tr>
  );
}

export function CandidateReviewTable() {
  const { data: candidatesData, isLoading, isError, error } =
    useNormalizationCandidates();
  const { data: productsData } = useProducts();
  const products = productsData?.items ?? [];

  const productOptions = useMemo(
    () =>
      products.map((product) => ({
        id: product.id,
        label: `${product.brand} ${product.model}${
          product.variant ? ` ${product.variant}` : ""
        }`,
      })),
    [products],
  );

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">Loading review queue...</p>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">{(error as Error).message}</p>
    );
  }

  const candidates = candidatesData?.items ?? [];

  if (candidates.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-sm text-muted-foreground">
        No titles waiting for review. Upload a CSV with unknown product names to
        populate this queue.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left">
          <tr>
            <th className="px-4 py-3 font-medium">Imported title</th>
            <th className="px-4 py-3 font-medium">Suggestion</th>
            <th className="px-4 py-3 font-medium">Seen</th>
            <th className="px-4 py-3 font-medium">Map to product</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((candidate) => (
            <CandidateRow
              key={candidate.id}
              candidate={candidate}
              products={productOptions}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
