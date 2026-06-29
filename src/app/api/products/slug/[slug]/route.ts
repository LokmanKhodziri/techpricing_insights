import { NextRequest } from "next/server";

import { apiError, apiSuccess, notFound } from "@/lib/errors/api-response";
import { productSlugSchema } from "@/lib/schemas/product";
import { getProductBySlug } from "@/lib/services/catalog/product-queries";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    productSlugSchema.parse(slug);

    const product = await getProductBySlug(slug);

    if (!product) {
      return apiError(notFound("Product"));
    }

    return apiSuccess(product);
  } catch (error) {
    return apiError(error);
  }
}
