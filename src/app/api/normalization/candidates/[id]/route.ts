import { NextRequest } from "next/server";
import { z } from "zod";

import { apiSuccess } from "@/lib/errors/api-response";
import { withApiHandler } from "@/lib/errors/with-api-handler";
import { objectIdSchema } from "@/lib/schemas/common";
import { approveCandidateSchema } from "@/lib/schemas/normalization";
import { approveCandidate } from "@/lib/services/normalization/approve-alias";
import { rejectCandidate } from "@/lib/services/normalization/candidates";
import { parseJsonBody, parseParams } from "@/lib/validation/parse-request";

const routeParamsSchema = z.object({
  id: objectIdSchema,
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  return withApiHandler(async () => {
    const { id } = parseParams(await context.params, routeParamsSchema);
    const input = await parseJsonBody(request, approveCandidateSchema);

    const candidate = await approveCandidate({
      candidateId: id,
      productId: input.productId,
    });

    return apiSuccess(candidate);
  });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  return withApiHandler(async () => {
    const { id } = parseParams(await context.params, routeParamsSchema);
    const candidate = await rejectCandidate(id);
    return apiSuccess(candidate);
  });
}
