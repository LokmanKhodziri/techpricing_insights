import { z } from "zod";

import { productCategorySchema } from "@/lib/schemas/common";

const gpuSpecsSchema = z.object({
  chipset: z.string().min(1),
  vramGb: z.number().int().positive(),
  memoryType: z.enum(["GDDR5", "GDDR6", "GDDR6X", "HBM2", "HBM3"]),
  pcieGen: z.number().int().min(3).max(5).optional(),
});

const cpuSpecsSchema = z.object({
  socket: z.string().min(1),
  cores: z.number().int().positive(),
  threads: z.number().int().positive(),
  baseClockMhz: z.number().int().positive().optional(),
  tdpW: z.number().int().positive().optional(),
});

const ramSpecsSchema = z.object({
  capacityGb: z.number().int().positive(),
  modules: z.number().int().positive(),
  speedMhz: z.number().int().positive(),
  ddrGeneration: z.enum(["DDR4", "DDR5"]),
  casLatency: z.number().int().positive().optional(),
});

export const productSpecsSchema = z.discriminatedUnion("category", [
  z.object({ category: z.literal("GPU"), specs: gpuSpecsSchema }),
  z.object({ category: z.literal("CPU"), specs: cpuSpecsSchema }),
  z.object({ category: z.literal("RAM"), specs: ramSpecsSchema }),
  z.object({
    category: productCategorySchema.exclude(["GPU", "CPU", "RAM"]),
    specs: z.record(z.string(), z.unknown()),
  }),
]);

export const createProductSchema = z.object({
  slug: z.string().min(1),
  category: productCategorySchema,
  brand: z.string().min(1),
  model: z.string().min(1),
  variant: z.string().optional(),
  specs: z.record(z.string(), z.unknown()),
  matchKey: z.string().min(1),
  aliases: z.array(z.string()).default([]),
  msrpSen: z.number().int().nonnegative().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type ProductSpecs = z.infer<typeof productSpecsSchema>;
