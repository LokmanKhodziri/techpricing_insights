import { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/lib/errors/api-response";
import { listPendingCandidates } from "@/lib/services/normalization/candidates";

export async function GET() {
  try {
    const candidates = await listPendingCandidates();
    return apiSuccess({ items: candidates, total: candidates.length });
  } catch (error) {
    return apiError(error);
  }
}
