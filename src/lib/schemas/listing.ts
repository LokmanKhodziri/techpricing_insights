import { z } from "zod";

import {
  listingConditionSchema,
  marketplacePlatformSchema,
} from "@/lib/schemas/common";

export const rawListingRowSchema = z
  .object({
    title: z.string().min(1),
    price: z.union([z.number(), z.string()]),
    originalPrice: z.union([z.number(), z.string()]).optional(),
    shipping: z.union([z.number(), z.string()]).optional(),
    platform: marketplacePlatformSchema.optional(),
    platformListingId: z.string().optional(),
    sourceUrl: z.string().url().optional(),
    condition: listingConditionSchema.optional(),
    sellerName: z.string().optional(),
    sellerId: z.string().optional(),
    capturedAt: z.union([z.string(), z.date()]).optional(),
  })
  .passthrough();

export const importFileSchema = z.object({
  fileName: z.string().min(1),
  fileFormat: z.enum(["csv", "json"]),
  platform: marketplacePlatformSchema.optional(),
  rows: z.array(rawListingRowSchema).min(1),
});

export const createListingSchema = z.object({
  productId: z.string().min(1),
  platform: marketplacePlatformSchema,
  platformListingId: z.string().optional(),
  sourceUrl: z.string().url().optional(),
  titleRaw: z.string().min(1),
  titleNormalized: z.string().optional(),
  priceSen: z.number().int().nonnegative(),
  originalPriceSen: z.number().int().nonnegative().optional(),
  shippingSen: z.number().int().nonnegative().optional(),
  currency: z.string().default("MYR"),
  condition: listingConditionSchema.default("UNKNOWN"),
  sellerName: z.string().optional(),
  sellerId: z.string().optional(),
  capturedAt: z.coerce.date(),
  importBatchId: z.string().optional(),
  rawPayload: z.record(z.string(), z.unknown()).optional(),
});

export type RawListingRow = z.infer<typeof rawListingRowSchema>;
export type ImportFileInput = z.infer<typeof importFileSchema>;
export type CreateListingInput = z.infer<typeof createListingSchema>;

export const updateListingPriceSchema = z.object({
  priceMyr: z.coerce.number().positive().max(999_999),
  originalPriceMyr: z.coerce.number().positive().max(999_999).optional(),
});

export type UpdateListingPriceInput = z.infer<typeof updateListingPriceSchema>;
