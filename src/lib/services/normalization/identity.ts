import { normalizeTitle } from "@/lib/services/normalization/tokenizer";

export type CpuIdentity = {
  brand: "amd" | "intel";
  series: string;
  model: string;
};

export type GpuIdentity = {
  vendor: "nvidia" | "amd";
  series: string;
  model: string;
};

export type ProductIdentity =
  | { kind: "cpu"; value: CpuIdentity }
  | { kind: "gpu"; value: GpuIdentity };

export function extractCpuIdentity(title: string): CpuIdentity | null {
  const normalized = normalizeTitle(title);

  const amdRyzen = normalized.match(
    /\b(?:amd\s+)?ryzen\s*(\d)\s+(\d{4})([a-z0-9]*)\b/,
  );
  if (amdRyzen) {
    return {
      brand: "amd",
      series: amdRyzen[1],
      model: `${amdRyzen[2]}${amdRyzen[3]}`,
    };
  }

  const amdShort = normalized.match(/\br\s*(\d)\s+(\d{4})([a-z0-9]*)\b/);
  if (amdShort) {
    return {
      brand: "amd",
      series: amdShort[1],
      model: `${amdShort[2]}${amdShort[3]}`,
    };
  }

  const intel = normalized.match(
    /\b(?:intel\s+)?(?:core\s+)?i\s*(\d)\s*[- ]?\s*(\d{4,5})([a-z]*)\b/,
  );
  if (intel) {
    return {
      brand: "intel",
      series: `i${intel[1]}`,
      model: `${intel[2]}${intel[3]}`,
    };
  }

  return null;
}

export function extractGpuIdentity(title: string): GpuIdentity | null {
  const normalized = normalizeTitle(title);

  const nvidia = normalized.match(
    /\b(?:nvidia\s+)?(?:geforce\s+)?(rtx|gtx)\s*(\d{4})(?:\s*(super|ti))?\b/,
  );
  if (nvidia) {
    const suffix = nvidia[3] ? ` ${nvidia[3]}` : "";
    return {
      vendor: "nvidia",
      series: nvidia[1],
      model: `${nvidia[2]}${suffix}`.trim(),
    };
  }

  const amd = normalized.match(
    /\b(?:amd\s+)?(?:radeon\s+)?(rx)\s*(\d{4})(?:\s*(xt|xtx))?\b/,
  );
  if (amd) {
    const suffix = amd[3] ?? "";
    return {
      vendor: "amd",
      series: amd[1],
      model: `${amd[2]}${suffix}`,
    };
  }

  return null;
}

export function extractProductIdentity(title: string): ProductIdentity | null {
  const cpu = extractCpuIdentity(title);
  if (cpu) {
    return { kind: "cpu", value: cpu };
  }

  const gpu = extractGpuIdentity(title);
  if (gpu) {
    return { kind: "gpu", value: gpu };
  }

  return null;
}

export function extractCatalogProductIdentity(
  brand: string,
  model: string,
  variant?: string | null,
): ProductIdentity | null {
  const combined = [brand, model, variant].filter(Boolean).join(" ");
  return extractProductIdentity(combined);
}

export function identitiesCompatible(
  left: ProductIdentity | null,
  right: ProductIdentity | null,
): boolean {
  if (!left || !right) {
    return true;
  }

  if (left.kind !== right.kind) {
    return false;
  }

  if (left.kind === "cpu" && right.kind === "cpu") {
    const a = left.value;
    const b = right.value;

    if (a.brand !== b.brand) {
      return false;
    }

    return a.series === b.series;
  }

  if (left.kind === "gpu" && right.kind === "gpu") {
    const a = left.value;
    const b = right.value;

    if (a.vendor !== b.vendor || a.series !== b.series) {
      return false;
    }

    const aBase = a.model.replace(/\s*(super|ti|xt|xtx)$/i, "");
    const bBase = b.model.replace(/\s*(super|ti|xt|xtx)$/i, "");

    return aBase === bBase;
  }

  return true;
}
