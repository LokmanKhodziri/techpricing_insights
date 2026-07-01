import { NextRequest } from "next/server";
import { z } from "zod";

import { apiSuccess, notFound } from "@/lib/errors/api-response";
import { withApiHandler } from "@/lib/errors/with-api-handler";
import { objectIdSchema } from "@/lib/schemas/common";
import { getProductById } from "@/lib/services/catalog/product-queries";
import { parseParams } from "@/lib/validation/parse-request";

const routeParamsSchema = z.object({
  id: objectIdSchema,
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  return withApiHandler(async () => {
    const { id } = parseParams(await context.params, routeParamsSchema);
    const product = await getProductById(id);

    if (!product) {
      throw notFound("Product");
    }

    return apiSuccess(product);
  });
}
