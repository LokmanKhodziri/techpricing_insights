import { apiSuccess } from "@/lib/errors/api-response";
import { withApiHandler } from "@/lib/errors/with-api-handler";
import { listPendingCandidates } from "@/lib/services/normalization/candidates";

export async function GET() {
  return withApiHandler(async () => {
    const candidates = await listPendingCandidates();
    return apiSuccess({ items: candidates, total: candidates.length });
  });
}
