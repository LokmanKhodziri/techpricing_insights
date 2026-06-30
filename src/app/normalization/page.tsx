import { CandidateReviewTable } from "@/components/normalization/candidate-review-table";

export default function NormalizationPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Normalization review
        </h1>
        <p className="text-sm text-muted-foreground">
          Approve unmatched import titles by mapping them to canonical products.
          Approved mappings become aliases for future imports.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">How matching works</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>Exact alias lookup (e.g. RTX 2060S → RTX 2060 Super)</li>
          <li>Rule transforms (2060s → 2060 super, rtx4070 → rtx 4070)</li>
          <li>Match key lookup on product specs</li>
          <li>Fuzzy similarity against known aliases (auto-match ≥ 92%)</li>
          <li>Queue for manual review when still unmatched</li>
        </ol>
      </div>

      <CandidateReviewTable />
    </div>
  );
}
