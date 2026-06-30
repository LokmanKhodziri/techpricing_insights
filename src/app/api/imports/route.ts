import { NextRequest } from "next/server";
import { z } from "zod";

import { AppError } from "@/lib/errors/app-error";
import { apiError, apiSuccess } from "@/lib/errors/api-response";
import { importFileSchema } from "@/lib/schemas/listing";
import { importListings } from "@/lib/services/ingestion";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = importFileSchema.parse(body);
    const result = await importListings(input);

    return apiSuccess(result, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(
        new AppError("VALIDATION_ERROR", "Invalid import payload", 400, error),
      );
    }

    return apiError(error);
  }
}
