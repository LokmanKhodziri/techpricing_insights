import { z } from "zod";

import type { MarketplacePlatform } from "@/lib/schemas/common";
import {
  importFileSchema,
  rawListingRowSchema,
  type ImportFileInput,
  type RawListingRow,
} from "@/lib/schemas/listing";
import { parseCsv } from "@/lib/parsers/csv";

const FIELD_ALIASES = {
  title: [
    "title",
    "product_title",
    "product_name",
    "name",
    "item_name",
    "item_title",
    "listing_title",
  ],
  price: [
    "price",
    "current_price",
    "sale_price",
    "price_myr",
    "amount",
    "price_after_voucher",
    "after_voucher_price",
    "final_price",
    "paid_price",
  ],
  originalPrice: [
    "original_price",
    "originalprice",
    "was_price",
    "list_price",
    "strikethrough_price",
    "price_before_voucher",
    "before_voucher_price",
    "regular_price",
    "pre_voucher_price",
  ],
  shipping: ["shipping", "shipping_fee", "shipping_cost", "delivery_fee"],
  platformListingId: [
    "platform_listing_id",
    "listing_id",
    "item_id",
    "product_id",
    "sku",
  ],
  sourceUrl: ["source_url", "url", "link", "product_url", "item_url"],
  capturedAt: ["captured_at", "date", "scraped_at", "observed_at", "timestamp"],
  sellerName: ["seller_name", "seller", "shop_name", "store_name"],
  sellerId: ["seller_id", "shop_id", "store_id"],
  condition: ["condition", "item_condition"],
} as const;

export type ParsedImportFile = ImportFileInput;

export type RowParseIssue = {
  row: number;
  message: string;
};

export type ParseImportResult = {
  data: ParsedImportFile | null;
  issues: RowParseIssue[];
};

function pickField(
  record: Record<string, string>,
  aliases: readonly string[],
): string | undefined {
  for (const alias of aliases) {
    const value = record[alias];
    if (value?.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

function mapRecordToRow(record: Record<string, string>): z.ZodSafeParseResult<RawListingRow> {
  const title = pickField(record, FIELD_ALIASES.title);
  const price = pickField(record, FIELD_ALIASES.price);
  const sourceUrl = pickField(record, FIELD_ALIASES.sourceUrl);

  const candidate: Record<string, unknown> = {
    ...record,
    title,
    price,
  };

  const originalPrice = pickField(record, FIELD_ALIASES.originalPrice);
  const shipping = pickField(record, FIELD_ALIASES.shipping);
  const platformListingId = pickField(record, FIELD_ALIASES.platformListingId);
  const capturedAt = pickField(record, FIELD_ALIASES.capturedAt);
  const sellerName = pickField(record, FIELD_ALIASES.sellerName);
  const sellerId = pickField(record, FIELD_ALIASES.sellerId);
  const condition = pickField(record, FIELD_ALIASES.condition);

  if (originalPrice) candidate.originalPrice = originalPrice;
  if (shipping) candidate.shipping = shipping;
  if (platformListingId) candidate.platformListingId = platformListingId;
  if (capturedAt) candidate.capturedAt = capturedAt;
  if (sellerName) candidate.sellerName = sellerName;
  if (sellerId) candidate.sellerId = sellerId;
  if (condition) candidate.condition = condition;

  if (sourceUrl && z.string().url().safeParse(sourceUrl).success) {
    candidate.sourceUrl = sourceUrl;
  }

  return rawListingRowSchema.safeParse(candidate);
}

function parseJsonRecords(text: string): Record<string, string>[] {
  const parsed: unknown = JSON.parse(text);

  let rows: unknown[];
  if (Array.isArray(parsed)) {
    rows = parsed;
  } else if (
    parsed &&
    typeof parsed === "object" &&
    Array.isArray((parsed as { rows?: unknown[] }).rows)
  ) {
    rows = (parsed as { rows: unknown[] }).rows;
  } else if (
    parsed &&
    typeof parsed === "object" &&
    Array.isArray((parsed as { items?: unknown[] }).items)
  ) {
    rows = (parsed as { items: unknown[] }).items;
  } else {
    throw new Error(
      "JSON must be an array of listings, or an object with a rows/items array.",
    );
  }

  return rows.map((row) => {
    if (!row || typeof row !== "object") {
      throw new Error("Each JSON row must be an object.");
    }

    const record: Record<string, string> = {};
    for (const [key, value] of Object.entries(row)) {
      if (value === null || value === undefined) continue;
      record[normalizeRecordKey(key)] =
        typeof value === "string" ? value : String(value);
    }
    return record;
  });
}

function normalizeRecordKey(key: string): string {
  return key
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, "_");
}

export function parseImportFileText(
  fileName: string,
  fileFormat: "csv" | "json",
  text: string,
  platform?: MarketplacePlatform,
): ParseImportResult {
  const issues: RowParseIssue[] = [];

  let records: Record<string, string>[];
  try {
    records =
      fileFormat === "csv" ? parseCsv(text) : parseJsonRecords(text);
  } catch (error) {
    return {
      data: null,
      issues: [
        {
          row: 0,
          message: error instanceof Error ? error.message : "Failed to parse file",
        },
      ],
    };
  }

  const rows: RawListingRow[] = [];

  records.forEach((record, index) => {
    const result = mapRecordToRow(record);
    if (result.success) {
      rows.push(result.data);
      return;
    }

    const message = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");

    issues.push({ row: index + 1, message: message || "Invalid row" });
  });

  if (rows.length === 0) {
    return {
      data: null,
      issues: issues.length
        ? issues
        : [{ row: 0, message: "No valid rows found in file." }],
    };
  }

  const payload = {
    fileName,
    fileFormat,
    platform,
    rows,
  };

  const validated = importFileSchema.safeParse(payload);
  if (!validated.success) {
    return {
      data: null,
      issues: validated.error.issues.map((issue, index) => ({
        row: index,
        message: issue.message,
      })),
    };
  }

  return { data: validated.data, issues };
}

export function detectFileFormat(fileName: string): "csv" | "json" | null {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".csv")) return "csv";
  if (lower.endsWith(".json")) return "json";
  return null;
}
