import { Prisma, PrismaClient } from "@prisma/client";

import {
  buildMatchKey,
  buildSlug,
  normalizeTitle,
} from "../src/lib/services/normalization/tokenizer";

const db = new PrismaClient();

type SeedProduct = {
  category: "GPU" | "CPU" | "RAM";
  brand: string;
  model: string;
  variant?: string;
  specs: Record<string, unknown>;
  matchKeyParts: string[];
  msrpSen: number;
  aliases: Array<{ raw: string; alias: string }>;
  listings: Array<{
    platform: "SHOPEE" | "LAZADA";
    titleRaw: string;
    priceMyr: number;
    originalPriceMyr?: number;
    daysAgo: number;
    platformListingId: string;
  }>;
};

const SEED_PRODUCTS: SeedProduct[] = [
  {
    category: "GPU",
    brand: "NVIDIA",
    model: "GeForce RTX 2060 Super",
    variant: "8GB",
    specs: {
      chipset: "RTX 2060 Super",
      vramGb: 8,
      memoryType: "GDDR6",
      pcieGen: 3,
    },
    matchKeyParts: ["gpu", "nvidia", "rtx-2060-super", "8gb"],
    msrpSen: 139900,
    aliases: [
      { raw: "RTX 2060S 8GB OC", alias: "rtx 2060s 8gb oc" },
      { raw: "RTX 2060 Super 8G", alias: "rtx 2060 super 8g" },
      { raw: "NVIDIA RTX2060 Super 8GB", alias: "nvidia rtx2060 super 8gb" },
    ],
    listings: [
      {
        platform: "SHOPEE",
        titleRaw: "RTX 2060S 8GB OC - Ready Stock Malaysia",
        priceMyr: 749,
        originalPriceMyr: 899,
        daysAgo: 28,
        platformListingId: "shopee-rtx2060s-001",
      },
      {
        platform: "LAZADA",
        titleRaw: "NVIDIA RTX 2060 Super 8GB Gaming GPU",
        priceMyr: 769,
        daysAgo: 21,
        platformListingId: "lazada-rtx2060s-001",
      },
      {
        platform: "SHOPEE",
        titleRaw: "RTX 2060 Super 8G - Free Shipping",
        priceMyr: 729,
        daysAgo: 14,
        platformListingId: "shopee-rtx2060s-002",
      },
      {
        platform: "LAZADA",
        titleRaw: "RTX 2060S 8GB OC Edition",
        priceMyr: 715,
        originalPriceMyr: 799,
        daysAgo: 7,
        platformListingId: "lazada-rtx2060s-002",
      },
      {
        platform: "SHOPEE",
        titleRaw: "RTX 2060 Super 8GB - Lowest Price",
        priceMyr: 699,
        daysAgo: 1,
        platformListingId: "shopee-rtx2060s-003",
      },
    ],
  },
  {
    category: "GPU",
    brand: "NVIDIA",
    model: "GeForce RTX 4070",
    variant: "12GB",
    specs: {
      chipset: "RTX 4070",
      vramGb: 12,
      memoryType: "GDDR6X",
      pcieGen: 4,
    },
    matchKeyParts: ["gpu", "nvidia", "rtx-4070", "12gb"],
    msrpSen: 289900,
    aliases: [
      { raw: "RTX4070 12G", alias: "rtx4070 12g" },
      { raw: "NVIDIA RTX 4070 12GB", alias: "nvidia rtx 4070 12gb" },
    ],
    listings: [
      {
        platform: "SHOPEE",
        titleRaw: "NVIDIA RTX 4070 12GB - Brand New",
        priceMyr: 2199,
        originalPriceMyr: 2499,
        daysAgo: 28,
        platformListingId: "shopee-rtx4070-001",
      },
      {
        platform: "LAZADA",
        titleRaw: "RTX4070 12G Gaming Graphics Card",
        priceMyr: 2149,
        daysAgo: 14,
        platformListingId: "lazada-rtx4070-001",
      },
      {
        platform: "SHOPEE",
        titleRaw: "RTX 4070 12GB - Free Shipping",
        priceMyr: 2099,
        daysAgo: 3,
        platformListingId: "shopee-rtx4070-002",
      },
    ],
  },
  {
    category: "GPU",
    brand: "AMD",
    model: "Radeon RX 6700 XT",
    variant: "12GB",
    specs: {
      chipset: "RX 6700 XT",
      vramGb: 12,
      memoryType: "GDDR6",
      pcieGen: 4,
    },
    matchKeyParts: ["gpu", "amd", "rx-6700-xt", "12gb"],
    msrpSen: 199900,
    aliases: [
      { raw: "RX6700XT 12G", alias: "rx6700xt 12g" },
      { raw: "AMD RX 6700 XT 12GB", alias: "amd rx 6700 xt 12gb" },
    ],
    listings: [
      {
        platform: "LAZADA",
        titleRaw: "AMD RX 6700 XT 12GB - Ready Stock",
        priceMyr: 1299,
        daysAgo: 21,
        platformListingId: "lazada-rx6700xt-001",
      },
      {
        platform: "SHOPEE",
        titleRaw: "RX6700XT 12G Gaming GPU",
        priceMyr: 1249,
        originalPriceMyr: 1399,
        daysAgo: 7,
        platformListingId: "shopee-rx6700xt-001",
      },
    ],
  },
  {
    category: "CPU",
    brand: "AMD",
    model: "Ryzen 5 5600X",
    specs: {
      socket: "AM4",
      cores: 6,
      threads: 12,
      baseClockMhz: 3700,
      tdpW: 65,
    },
    matchKeyParts: ["cpu", "amd", "ryzen-5-5600x"],
    msrpSen: 89900,
    aliases: [
      { raw: "R5 5600X", alias: "r5 5600x" },
      { raw: "AMD Ryzen5 5600X", alias: "amd ryzen5 5600x" },
    ],
    listings: [
      {
        platform: "SHOPEE",
        titleRaw: "AMD Ryzen 5 5600X - Boxed Processor",
        priceMyr: 549,
        daysAgo: 28,
        platformListingId: "shopee-r5600x-001",
      },
      {
        platform: "LAZADA",
        titleRaw: "R5 5600X AM4 CPU",
        priceMyr: 529,
        originalPriceMyr: 599,
        daysAgo: 14,
        platformListingId: "lazada-r5600x-001",
      },
      {
        platform: "SHOPEE",
        titleRaw: "Ryzen 5 5600X - Lowest Price",
        priceMyr: 499,
        daysAgo: 2,
        platformListingId: "shopee-r5600x-002",
      },
    ],
  },
  {
    category: "CPU",
    brand: "Intel",
    model: "Core i5-12400F",
    specs: {
      socket: "LGA1700",
      cores: 6,
      threads: 12,
      baseClockMhz: 2500,
      tdpW: 65,
    },
    matchKeyParts: ["cpu", "intel", "i5-12400f"],
    msrpSen: 74900,
    aliases: [
      { raw: "i5 12400F", alias: "i5 12400f" },
      { raw: "Intel i5-12400F LGA1700", alias: "intel i5 12400f lga1700" },
    ],
    listings: [
      {
        platform: "LAZADA",
        titleRaw: "Intel Core i5-12400F LGA1700",
        priceMyr: 479,
        daysAgo: 21,
        platformListingId: "lazada-i512400f-001",
      },
      {
        platform: "SHOPEE",
        titleRaw: "i5 12400F - Boxed CPU",
        priceMyr: 459,
        daysAgo: 5,
        platformListingId: "shopee-i512400f-001",
      },
    ],
  },
  {
    category: "RAM",
    brand: "Corsair",
    model: "Vengeance",
    variant: "32GB DDR5 6000",
    specs: {
      capacityGb: 32,
      modules: 2,
      speedMhz: 6000,
      ddrGeneration: "DDR5",
      casLatency: 30,
    },
    matchKeyParts: ["ram", "corsair", "vengeance", "32gb", "ddr5", "6000"],
    msrpSen: 64900,
    aliases: [
      {
        raw: "Corsair Vengeance 32GB DDR5 6000MHz",
        alias: "corsair vengeance 32gb ddr5 6000mhz",
      },
    ],
    listings: [
      {
        platform: "SHOPEE",
        titleRaw: "Corsair Vengeance 32GB DDR5 6000MHz CL30",
        priceMyr: 489,
        originalPriceMyr: 549,
        daysAgo: 18,
        platformListingId: "shopee-corsair32-001",
      },
      {
        platform: "LAZADA",
        titleRaw: "Corsair Vengeance 32GB DDR5 6000",
        priceMyr: 469,
        daysAgo: 4,
        platformListingId: "lazada-corsair32-001",
      },
    ],
  },
];

function daysAgoDate(daysAgo: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(12, 0, 0, 0);
  return date;
}

function myrToSen(myr: number): number {
  return Math.round(myr * 100);
}

async function main() {
  console.log("Seeding CariPart database...\n");

  let productCount = 0;
  let aliasCount = 0;
  let listingCount = 0;

  for (const item of SEED_PRODUCTS) {
    const matchKey = buildMatchKey(item.matchKeyParts);
    const slugParts = [item.brand, item.model, item.variant].filter(Boolean);
    const slug = buildSlug(slugParts as string[]);

    const product = await db.product.upsert({
      where: { slug },
      create: {
        slug,
        category: item.category,
        brand: item.brand,
        model: item.model,
        variant: item.variant,
        specs: item.specs as Prisma.InputJsonValue,
        matchKey,
        aliases: item.aliases.map((entry) => entry.alias),
        msrpSen: item.msrpSen,
      },
      update: {
        category: item.category,
        brand: item.brand,
        model: item.model,
        variant: item.variant,
        specs: item.specs as Prisma.InputJsonValue,
        matchKey,
        aliases: item.aliases.map((entry) => entry.alias),
        msrpSen: item.msrpSen,
      },
    });

    productCount += 1;
    console.log(`  Product: ${product.brand} ${product.model}`);

    for (const aliasEntry of item.aliases) {
      await db.productAlias.upsert({
        where: { alias: aliasEntry.alias },
        create: {
          productId: product.id,
          alias: aliasEntry.alias,
          aliasRaw: aliasEntry.raw,
          confidence: 1,
          source: "MANUAL",
        },
        update: {
          productId: product.id,
          aliasRaw: aliasEntry.raw,
          confidence: 1,
          source: "MANUAL",
        },
      });
      aliasCount += 1;
    }

    for (const listing of item.listings) {
      const capturedAt = daysAgoDate(listing.daysAgo);
      const titleNormalized = normalizeTitle(listing.titleRaw);

      await db.listing.upsert({
        where: {
          platform_platformListingId_capturedAt: {
            platform: listing.platform,
            platformListingId: listing.platformListingId,
            capturedAt,
          },
        },
        create: {
          productId: product.id,
          platform: listing.platform,
          platformListingId: listing.platformListingId,
          titleRaw: listing.titleRaw,
          titleNormalized,
          priceSen: myrToSen(listing.priceMyr),
          originalPriceSen: listing.originalPriceMyr
            ? myrToSen(listing.originalPriceMyr)
            : undefined,
          condition: "NEW",
          capturedAt,
          rawPayload: { seeded: true, priceMyr: listing.priceMyr },
        },
        update: {
          titleRaw: listing.titleRaw,
          titleNormalized,
          priceSen: myrToSen(listing.priceMyr),
          originalPriceSen: listing.originalPriceMyr
            ? myrToSen(listing.originalPriceMyr)
            : undefined,
        },
      });
      listingCount += 1;
    }
  }

  console.log("\nSeed complete:");
  console.log(`  ${productCount} products`);
  console.log(`  ${aliasCount} aliases`);
  console.log(`  ${listingCount} listings`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
