import { NextRequest } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/require-role";
import { apiSuccess, notFound } from "@/lib/errors/api-response";
import { withApiHandler } from "@/lib/errors/with-api-handler";
import { myrToSen } from "@/lib/format";
import { objectIdSchema } from "@/lib/schemas/common";
import { updateListingPriceSchema } from "@/lib/schemas/listing";
import { updateListingPrice } from "@/lib/services/catalog/listing-queries";
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
    const body = await parseJsonBody(request, updateListingPriceSchema);

    const listing = await updateListingPrice(id, {
      priceSen: myrToSen(body.priceMyr),
      originalPriceSen: body.originalPriceMyr
        ? myrToSen(body.originalPriceMyr)
        : undefined,
    });

    if (!listing) {
      throw notFound("Listing");
    }

    return apiSuccess(listing);
  });
}
