import { NextRequest } from "next/server";

import { db } from "@/lib/db";
import { apiError, apiSuccess, notFound } from "@/lib/errors/api-response";
import { objectIdSchema } from "@/lib/schemas/common";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    objectIdSchema.parse(id);

    const product = await db.product.findUnique({
      where: { id },
      include: {
        listings: {
          orderBy: { capturedAt: "desc" },
          take: 50,
        },
        aliasesRef: true,
      },
    });

    if (!product) {
      return apiError(notFound("Product"));
    }

    return apiSuccess(product);
  } catch (error) {
    return apiError(error);
  }
}
