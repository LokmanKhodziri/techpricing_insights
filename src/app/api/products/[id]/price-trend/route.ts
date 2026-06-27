import { NextRequest } from "next/server";

import { db } from "@/lib/db";
import { apiError, apiSuccess, notFound } from "@/lib/errors/api-response";
import { objectIdSchema } from "@/lib/schemas/common";
import { buildPriceTrend } from "@/lib/services/analytics/price-trend";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    objectIdSchema.parse(id);

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
      return apiError(notFound("Product"));
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
  } catch (error) {
    return apiError(error);
  }
}
