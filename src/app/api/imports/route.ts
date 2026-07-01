import { NextRequest } from "next/server";

import { apiSuccess } from "@/lib/errors/api-response";
import { withApiHandler } from "@/lib/errors/with-api-handler";
import { parseJsonBody } from "@/lib/validation/parse-request";
import { importFileSchema } from "@/lib/schemas/listing";
import { importListings } from "@/lib/services/ingestion";

export async function POST(request: NextRequest) {
  return withApiHandler(async () => {
    const input = await parseJsonBody(request, importFileSchema);
    const result = await importListings(input);
    return apiSuccess(result, 201);
  });
}
