import { z } from "zod";

export const productCategorySchema = z.enum([
  "CPU",
  "GPU",
  "RAM",
  "MOTHERBOARD",
  "STORAGE",
  "PSU",
  "CASE",
  "COOLING",
  "PERIPHERAL",
  "OTHER",
]);

export const marketplacePlatformSchema = z.enum([
  "SHOPEE",
  "LAZADA",
  "TIKTOK_SHOP",
  "AMAZON_MY",
  "CAROUSELL",
  "OTHER",
]);

export const listingConditionSchema = z.enum([
  "NEW",
  "USED",
  "REFURBISHED",
  "UNKNOWN",
]);

export const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type ProductCategory = z.infer<typeof productCategorySchema>;
export type MarketplacePlatform = z.infer<typeof marketplacePlatformSchema>;
export type ListingCondition = z.infer<typeof listingConditionSchema>;
