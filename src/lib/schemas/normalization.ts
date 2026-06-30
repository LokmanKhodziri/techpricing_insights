import { z } from "zod";

import { objectIdSchema } from "@/lib/schemas/common";

export const approveCandidateSchema = z.object({
  productId: objectIdSchema,
});

export type ApproveCandidateInput = z.infer<typeof approveCandidateSchema>;
