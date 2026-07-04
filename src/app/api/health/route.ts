import { apiSuccess } from "@/lib/errors/api-response";
import { withApiHandler } from "@/lib/errors/with-api-handler";
import { db } from "@/lib/db";

export async function GET() {
  return withApiHandler(async () => {
    await db.product.count();

    return apiSuccess({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  });
}
