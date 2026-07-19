import type { ProductCategory } from "@prisma/client";

import { extractCategoryHint } from "@/lib/services/normalization/rules";
import {
  extractCpuIdentity,
  extractGpuIdentity,
} from "@/lib/services/normalization/identity";
import { normalizeTitle } from "@/lib/services/normalization/tokenizer";

export type ProductDraft = {
  category: ProductCategory;
  brand: string;
  model: string;
  variant?: string;
  specs: Record<string, unknown>;
  matchKeyParts: string[];
  slugParts: string[];
};

function formatModelCode(model: string): string {
  return model.replace(/^(\d{4})(.*)$/i, (_, digits: string, suffix: string) => {
    return digits + suffix.toUpperCase();
  });
}

function extractVramGb(title: string): number | undefined {
  const match = normalizeTitle(title).match(/\b(\d+)\s*gb\b/);
  if (!match) return undefined;

  const value = Number(match[1]);
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

function categoryFromHint(hint: string | undefined): ProductCategory | null {
  switch (hint) {
    case "cpu":
      return "CPU";
    case "gpu":
      return "GPU";
    case "ram":
      return "RAM";
    default:
      return null;
  }
}

function inferCpuDraft(title: string): ProductDraft | null {
  const cpu = extractCpuIdentity(title);
  if (!cpu) return null;

  if (cpu.brand === "amd") {
    const modelCode = formatModelCode(cpu.model);
    const model = `Ryzen ${cpu.series} ${modelCode}`;

    return {
      category: "CPU",
      brand: "AMD",
      model,
      specs: {},
      matchKeyParts: ["cpu", "amd", `ryzen-${cpu.series}-${modelCode.toLowerCase()}`],
      slugParts: ["AMD", model],
    };
  }

  const modelCode = formatModelCode(cpu.model);
  const model = `Core ${cpu.series}-${modelCode}`;

  return {
    category: "CPU",
    brand: "Intel",
    model,
    specs: {},
    matchKeyParts: ["cpu", "intel", `${cpu.series}-${modelCode.toLowerCase()}`],
    slugParts: ["Intel", model],
  };
}

function formatGpuChipset(series: string, model: string): string {
  const normalizedModel = model
    .replace(/\bsuper\b/i, "Super")
    .replace(/\bti\b/i, "Ti")
    .toUpperCase();

  return `${series.toUpperCase()} ${normalizedModel}`.trim();
}

function inferGpuDraft(title: string): ProductDraft | null {
  const gpu = extractGpuIdentity(title);
  if (!gpu) return null;

  const vramGb = extractVramGb(title);
  const variant = vramGb ? `${vramGb}GB` : undefined;
  const chipset = formatGpuChipset(gpu.series, gpu.model);

  if (gpu.vendor === "nvidia") {
    const model = `GeForce ${chipset}`;

    return {
      category: "GPU",
      brand: "NVIDIA",
      model,
      variant,
      specs: vramGb ? { vramGb } : {},
      matchKeyParts: [
        "gpu",
        "nvidia",
        chipset.toLowerCase().replace(/\s+/g, "-"),
        ...(variant ? [variant.toLowerCase()] : []),
      ],
      slugParts: ["NVIDIA", model, ...(variant ? [variant] : [])],
    };
  }

  const model = `Radeon ${chipset}`;

  return {
    category: "GPU",
    brand: "AMD",
    model,
    variant,
    specs: vramGb ? { vramGb } : {},
    matchKeyParts: [
      "gpu",
      "amd",
      chipset.toLowerCase().replace(/\s+/g, "-"),
      ...(variant ? [variant.toLowerCase()] : []),
    ],
    slugParts: ["AMD", model, ...(variant ? [variant] : [])],
  };
}

export function inferProductDraft(title: string): ProductDraft | null {
  const category = categoryFromHint(extractCategoryHint(title));
  if (!category) return null;

  if (category === "CPU") {
    return inferCpuDraft(title);
  }

  if (category === "GPU") {
    return inferGpuDraft(title);
  }

  return null;
}

export function formatProductDraftLabel(draft: ProductDraft): string {
  return [draft.brand, draft.model, draft.variant].filter(Boolean).join(" ");
}
