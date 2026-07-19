import { NextRequest } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/require-role";
import { apiSuccess, notFound } from "@/lib/errors/api-response";
import { withApiHandler } from "@/lib/errors/with-api-handler";
import { myrToSen } from "@/lib/format";
import { objectIdSchema } from "@/lib/schemas/common";
import { updateProductMsrpSchema } from "@/lib/schemas/product";
import { updateProductMsrp } from "@/lib/services/catalog/update-product-msrp";
import { parseJsonBody, parseParams } from "@/lib/validation/parse-request";

const routeParamsSchema = z.object({
  id: objectIdSchema,
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  return withApiHandler(async () => {
    await requireAdmin();
    const { id } = parseParams(await context.params, routeParamsSchema);
    const { msrpMyr } = await parseJsonBody(request, updateProductMsrpSchema);

    const product = await updateProductMsrp(id, myrToSen(msrpMyr));

    if (!product) {
      throw notFound("Product");
    }

    return apiSuccess(product);
  });
}
