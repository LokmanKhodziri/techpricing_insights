import { describe, expect, it } from "vitest";
import { z } from "zod";

import { toValidationError } from "@/lib/validation/parse-request";

describe("toValidationError", () => {
  it("formats zod issues into a readable message", () => {
    const schema = z.object({ price: z.number() });
    const result = schema.safeParse({ price: "invalid" });

    if (result.success) {
      throw new Error("Expected validation to fail");
    }

    const error = toValidationError(result.error);
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.status).toBe(400);
    expect(error.message).toContain("price:");
  });
});
