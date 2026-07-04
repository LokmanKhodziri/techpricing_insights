import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { parseImportFileText } from "@/lib/parsers/map-listing-rows";
import { applyTitleRules } from "@/lib/services/normalization/rules";

const samplesDir = join(process.cwd(), "public/samples");

describe("import pipeline integration", () => {
  it("parses the shopee sample csv into validated listing rows", () => {
    const csv = readFileSync(join(samplesDir, "shopee-export-sample.csv"), "utf8");
    const result = parseImportFileText(
      "shopee-export-sample.csv",
      "csv",
      csv,
      "SHOPEE",
    );

    expect(result.issues).toHaveLength(0);
    expect(result.data?.rows).toHaveLength(3);
    expect(result.data?.rows[0].title).toContain("RTX 2060S");
  });

  it("parses unmatched sample rows for review queue testing", () => {
    const csv = readFileSync(
      join(samplesDir, "unmatched-export-sample.csv"),
      "utf8",
    );
    const result = parseImportFileText(
      "unmatched-export-sample.csv",
      "csv",
      csv,
      "SHOPEE",
    );

    expect(result.data?.rows).toHaveLength(2);
    expect(result.data?.rows[0].title).toContain("RTX 3060 Ti");
  });
});

describe("normalization rule chain integration", () => {
  it("normalizes compact marketplace gpu titles", () => {
    const variants = applyTitleRules("RTX2060S 8G OC Shopee Malaysia");

    expect(variants.some((value) => value.includes("rtx 2060 super"))).toBe(
      true,
    );
    expect(variants.some((value) => value.includes("8gb"))).toBe(true);
  });
});
