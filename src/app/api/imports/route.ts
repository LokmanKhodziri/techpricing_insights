import { Prisma } from "@prisma/client";
import { NextRequest } from "next/server";

import { db } from "@/lib/db";
import { z } from "zod";

import { AppError } from "@/lib/errors/app-error";
import { apiError, apiSuccess } from "@/lib/errors/api-response";
import { importFileSchema } from "@/lib/schemas/listing";
import { parseImportRow } from "@/lib/services/ingestion";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = importFileSchema.parse(body);

    const batch = await db.importBatch.create({
      data: {
        fileName: input.fileName,
        fileFormat: input.fileFormat,
        platform: input.platform,
        rowCount: input.rows.length,
      },
    });

    const errors: Array<{ row: number; message: string }> = [];
    let successCount = 0;

    for (const [index, row] of input.rows.entries()) {
      try {
        const parsed = await parseImportRow(row, input.platform);

        if (!parsed.productId) {
          errors.push({
            row: index + 1,
            message: `No product match for title: ${parsed.titleRaw}`,
          });
          continue;
        }

        await db.listing.create({
          data: {
            productId: parsed.productId,
            platform: input.platform ?? "OTHER",
            platformListingId: parsed.platformListingId,
            sourceUrl: parsed.sourceUrl,
            titleRaw: parsed.titleRaw,
            titleNormalized: parsed.titleNormalized,
            priceSen: parsed.priceSen,
            originalPriceSen: parsed.originalPriceSen,
            shippingSen: parsed.shippingSen,
            sellerName: parsed.sellerName,
            sellerId: parsed.sellerId,
            capturedAt: parsed.capturedAt,
            importBatchId: batch.id,
            rawPayload: parsed.rawPayload as Prisma.InputJsonValue,
          },
        });

        successCount += 1;
      } catch (error) {
        errors.push({
          row: index + 1,
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const updatedBatch = await db.importBatch.update({
      where: { id: batch.id },
      data: {
        successCount,
        errorCount: errors.length,
        errors,
      },
    });

    return apiSuccess(updatedBatch, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(
        new AppError("VALIDATION_ERROR", "Invalid import payload", 400, error),
      );
    }

    return apiError(error);
  }
}
