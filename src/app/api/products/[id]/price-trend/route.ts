import { NextRequest } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { apiSuccess, notFound } from "@/lib/errors/api-response";
import { withApiHandler } from "@/lib/errors/with-api-handler";
import { objectIdSchema } from "@/lib/schemas/common";
import { buildPriceTrend } from "@/lib/services/analytics/price-trend";
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

    const product = await db.product.findUnique({
      where: { id },
      select: {
        id: true,
        brand: true,
        model: true,
        variant: true,
        msrpSen: true,
        listings: {
          select: {
            platform: true,
            priceSen: true,
            capturedAt: true,
          },
          orderBy: { capturedAt: "asc" },
        },
      },
    });

    if (!product) {
      throw notFound("Product");
    }

    const productName = [product.brand, product.model, product.variant]
      .filter(Boolean)
      .join(" ");

    const trend = buildPriceTrend(
      product.id,
      productName,
      product.msrpSen,
      product.listings,
    );

    return apiSuccess(trend);
  });
}
