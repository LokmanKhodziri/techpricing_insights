"use client";

import { useCallback, useMemo, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import type { ImportBatchResult } from "@/hooks/use-import-upload";
import { useImportUpload } from "@/hooks/use-import-upload";
import { formatMyrFromSen } from "@/lib/format";
import {
  detectFileFormat,
  parseImportFileText,
  type RowParseIssue,
} from "@/lib/parsers/map-listing-rows";
import type { MarketplacePlatform } from "@/lib/schemas/common";
import type { RawListingRow } from "@/lib/schemas/listing";
import { cn } from "@/lib/utils";

const PLATFORMS: MarketplacePlatform[] = [
  "SHOPEE",
  "LAZADA",
  "TIKTOK_SHOP",
  "AMAZON_MY",
  "CAROUSELL",
  "OTHER",
];

type PreviewState = {
  fileName: string;
  fileFormat: "csv" | "json";
  rows: RawListingRow[];
  issues: RowParseIssue[];
};

function formatPrice(value: number | string): string {
  const amount =
    typeof value === "number"
      ? value
      : Number(String(value).replace(/[^\d.]/g, ""));

  if (Number.isNaN(amount)) return String(value);
  return formatMyrFromSen(Math.round(amount * 100));
}

export function ImportUploadForm() {
  const [platform, setPlatform] = useState<MarketplacePlatform>("SHOPEE");
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportBatchResult | null>(null);

  const importMutation = useImportUpload();

  const processFile = useCallback(
    async (file: File) => {
      setParseError(null);
      setResult(null);

      const fileFormat = detectFileFormat(file.name);
      if (!fileFormat) {
        setParseError("Only .csv and .json files are supported.");
        setPreview(null);
        return;
      }

      const text = await file.text();
      const parsed = parseImportFileText(
        file.name,
        fileFormat,
        text,
        platform,
      );

      if (!parsed.data) {
        setPreview(null);
        setParseError(
          parsed.issues[0]?.message ?? "Could not parse the uploaded file.",
        );
        return;
      }

      setPreview({
        fileName: file.name,
        fileFormat,
        rows: parsed.data.rows,
        issues: parsed.issues,
      });
    },
    [platform],
  );

  const onFileInput = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) await processFile(file);
      event.target.value = "";
    },
    [processFile],
  );

  const onDrop = useCallback(
    async (event: React.DragEvent<HTMLLabelElement>) => {
      event.preventDefault();
      setIsDragging(false);
      const file = event.dataTransfer.files?.[0];
      if (file) await processFile(file);
    },
    [processFile],
  );

  const previewRows = useMemo(
    () => preview?.rows.slice(0, 5) ?? [],
    [preview],
  );

  async function handleImport() {
    if (!preview) return;

    setParseError(null);

    importMutation.mutate(
      {
        fileName: preview.fileName,
        fileFormat: preview.fileFormat,
        platform,
        rows: preview.rows,
      },
      {
        onSuccess: (batch) => {
          setResult(batch);
          setPreview(null);
        },
        onError: (error) => {
          setParseError(
            error instanceof Error ? error.message : "Import failed",
          );
        },
      },
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <label className="space-y-2 text-sm">
          <span className="font-medium text-foreground">Marketplace</span>
          <select
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={platform}
            onChange={(event) =>
              setPlatform(event.target.value as MarketplacePlatform)
            }
          >
            {PLATFORMS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <a
          href="/samples/shopee-export-sample.csv"
          download
          className={cn(buttonVariants({ variant: "outline" }), "justify-center")}
        >
          Download sample CSV
        </a>
      </div>

      <label
        htmlFor="import-file"
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-6 py-12 text-center transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/30",
        )}
      >
        <input
          id="import-file"
          type="file"
          accept=".csv,.json,text/csv,application/json"
          className="sr-only"
          onChange={onFileInput}
        />
        <p className="text-sm font-medium text-foreground">
          Drop a CSV or JSON export here
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          or click to browse — titles are matched to seeded product aliases
        </p>
      </label>

      <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Expected columns</p>
        <p className="mt-1">
          Required: <code className="rounded bg-muted px-1">title</code>,{" "}
          <code className="rounded bg-muted px-1">price</code>. Optional:{" "}
          <code className="rounded bg-muted px-1">original_price</code>,{" "}
          <code className="rounded bg-muted px-1">platform_listing_id</code>,{" "}
          <code className="rounded bg-muted px-1">captured_at</code>,{" "}
          <code className="rounded bg-muted px-1">seller_name</code>.
        </p>
      </div>

      {parseError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {parseError}
        </div>
      )}

      {preview && (
        <div className="space-y-4 rounded-xl border border-border p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-foreground">{preview.fileName}</p>
              <p className="text-sm text-muted-foreground">
                {preview.rows.length} valid row
                {preview.rows.length === 1 ? "" : "s"}
                {preview.issues.length > 0 &&
                  ` · ${preview.issues.length} row issue(s) skipped`}
              </p>
            </div>
            <button
              type="button"
              className={cn(buttonVariants())}
              disabled={importMutation.isPending}
              onClick={handleImport}
            >
              {importMutation.isPending ? "Importing..." : "Import listings"}
            </button>
          </div>

          {preview.issues.length > 0 && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
              {preview.issues.slice(0, 5).map((issue) => (
                <p key={`${issue.row}-${issue.message}`}>
                  Row {issue.row}: {issue.message}
                </p>
              ))}
            </div>
          )}

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-3 py-2 font-medium">Title</th>
                  <th className="px-3 py-2 font-medium">Price</th>
                  <th className="px-3 py-2 font-medium">Captured</th>
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, index) => (
                  <tr key={`${row.title}-${index}`} className="border-t border-border">
                    <td className="max-w-md truncate px-3 py-2">{row.title}</td>
                    <td className="px-3 py-2">{formatPrice(row.price)}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {row.capturedAt ? String(row.capturedAt) : "Today"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-3 rounded-xl border border-border p-4">
          <div>
            <p className="font-medium text-foreground">Import complete</p>
            <p className="text-sm text-muted-foreground">
              {result.successCount} imported · {result.errorCount} failed ·{" "}
              {result.rowCount} total rows
            </p>
          </div>

          {Array.isArray(result.errors) && result.errors.length > 0 && (
            <div className="rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm">
              {result.errors.slice(0, 8).map((issue) => (
                <p key={`${issue.row}-${issue.message}`} className="text-muted-foreground">
                  Row {issue.row}: {issue.message}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
