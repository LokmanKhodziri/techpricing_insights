import type { MarketplacePlatform } from "@/lib/schemas/common";

export const PLATFORM_LABELS: Record<MarketplacePlatform, string> = {
  SHOPEE: "Shopee",
  LAZADA: "Lazada",
  TIKTOK_SHOP: "TikTok Shop",
  AMAZON_MY: "Amazon MY",
  CAROUSELL: "Carousell",
  OTHER: "Other",
};

import type { ProductCategory } from "@/lib/schemas/common";

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  "GPU",
  "CPU",
  "RAM",
  "MOTHERBOARD",
  "STORAGE",
  "PSU",
  "CASE",
  "COOLING",
  "PERIPHERAL",
  "OTHER",
];

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  CPU: "CPU",
  GPU: "GPU",
  RAM: "RAM",
  MOTHERBOARD: "Motherboard",
  STORAGE: "Storage",
  PSU: "PSU",
  CASE: "Case",
  COOLING: "Cooling",
  PERIPHERAL: "Peripheral",
  OTHER: "Other",
};
