import { NextRequest } from "next/server";
import { z } from "zod";

import { AppError } from "@/lib/errors/app-error";
import { apiError, apiSuccess } from "@/lib/errors/api-response";
import { approveCandidateSchema } from "@/lib/schemas/normalization";
import { objectIdSchema } from "@/lib/schemas/common";
import { approveCandidate } from "@/lib/services/normalization/approve-alias";
import { rejectCandidate } from "@/lib/services/normalization/candidates";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    objectIdSchema.parse(id);

    const body = await request.json();
    const input = approveCandidateSchema.parse(body);

    const candidate = await approveCandidate({
      candidateId: id,
      productId: input.productId,
    });

    return apiSuccess(candidate);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(
        new AppError("VALIDATION_ERROR", "Invalid approval payload", 400, error),
      );
    }

    return apiError(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    objectIdSchema.parse(id);

    const candidate = await rejectCandidate(id);
    return apiSuccess(candidate);
  } catch (error) {
    return apiError(error);
  }
}
