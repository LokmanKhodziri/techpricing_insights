import { NextRequest } from "next/server";
import { z } from "zod";

import { apiSuccess, notFound } from "@/lib/errors/api-response";
import { withApiHandler } from "@/lib/errors/with-api-handler";
import { objectIdSchema } from "@/lib/schemas/common";
import { productSlugSchema } from "@/lib/schemas/product";
import { getProductBySlug } from "@/lib/services/catalog/product-queries";
import { parseParams } from "@/lib/validation/parse-request";

const routeParamsSchema = z.object({
  slug: productSlugSchema,
});

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  return withApiHandler(async () => {
    const { slug } = parseParams(await context.params, routeParamsSchema);
    const product = await getProductBySlug(slug);

    if (!product) {
      throw notFound("Product");
    }

    return apiSuccess(product);
  });
}
