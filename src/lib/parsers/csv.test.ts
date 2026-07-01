import { describe, expect, it } from "vitest";

import { parseCsv } from "@/lib/parsers/csv";

describe("parseCsv", () => {
  it("parses headers and rows", () => {
    const rows = parseCsv(`title,price
RTX 4070,2199
Ryzen 5 5600X,499`);

    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({ title: "RTX 4070", price: "2199" });
    expect(rows[1]).toEqual({ title: "Ryzen 5 5600X", price: "499" });
  });

  it("handles quoted commas", () => {
    const rows = parseCsv(`title,price
"RTX 2060 Super, 8GB",749`);

    expect(rows[0].title).toBe("RTX 2060 Super, 8GB");
    expect(rows[0].price).toBe("749");
  });

  it("throws when file has no data rows", () => {
    expect(() => parseCsv("title,price")).toThrow(
      "CSV must include a header row and at least one data row",
    );
  });
});
