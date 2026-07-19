import { NextRequest } from "next/server";
import { z } from "zod";

import { requireContributor } from "@/lib/auth/require-role";
import { apiSuccess } from "@/lib/errors/api-response";
import { withApiHandler } from "@/lib/errors/with-api-handler";
import { objectIdSchema } from "@/lib/schemas/common";
import { createProductFromCandidate } from "@/lib/services/normalization/create-product-from-candidate";
import { parseParams } from "@/lib/validation/parse-request";

const routeParamsSchema = z.object({
  id: objectIdSchema,
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: NextRequest, context: RouteContext) {
  return withApiHandler(async () => {
    await requireContributor();
    const { id } = parseParams(await context.params, routeParamsSchema);
    const result = await createProductFromCandidate(id);
    return apiSuccess(result);
  });
}
