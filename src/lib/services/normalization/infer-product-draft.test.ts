import { describe, expect, it } from "vitest";

import {
  formatProductDraftLabel,
  inferProductDraft,
} from "@/lib/services/normalization/infer-product-draft";

describe("inferProductDraft", () => {
  it("infers amd ryzen cpus from marketplace titles", () => {
    const draft = inferProductDraft("AMD Ryzen 7 5700X3D");

    expect(draft).toEqual({
      category: "CPU",
      brand: "AMD",
      model: "Ryzen 7 5700X3D",
      specs: {},
      matchKeyParts: ["cpu", "amd", "ryzen-7-5700x3d"],
      slugParts: ["AMD", "Ryzen 7 5700X3D"],
    });
  });

  it("infers intel cpus", () => {
    const draft = inferProductDraft("Intel Core i5-12400F");

    expect(draft?.brand).toBe("Intel");
    expect(draft?.model).toBe("Core i5-12400F");
    expect(draft?.category).toBe("CPU");
  });

  it("infers nvidia gpus with vram variant", () => {
    const draft = inferProductDraft("NVIDIA RTX 4070 12GB");

    expect(draft).toMatchObject({
      category: "GPU",
      brand: "NVIDIA",
      model: "GeForce RTX 4070",
      variant: "12GB",
    });
    expect(formatProductDraftLabel(draft!)).toBe("NVIDIA GeForce RTX 4070 12GB");
  });

  it("returns null for unsupported titles", () => {
    expect(inferProductDraft("Random mystery part")).toBeNull();
  });
});
