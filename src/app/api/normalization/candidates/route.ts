import { requireContributor } from "@/lib/auth/require-role";
import { apiSuccess } from "@/lib/errors/api-response";
import { withApiHandler } from "@/lib/errors/with-api-handler";
import { listPendingCandidates } from "@/lib/services/normalization/candidates";

export async function GET() {
  return withApiHandler(async () => {
    await requireContributor();
    const candidates = await listPendingCandidates();
    return apiSuccess({ items: candidates, total: candidates.length });
  });
}
