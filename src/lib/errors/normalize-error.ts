import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

import { AppError, isAppError } from "@/lib/errors/app-error";
import { toValidationError } from "@/lib/validation/parse-request";

export function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof ZodError) {
    return toValidationError(error);
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      return new AppError("NOT_FOUND", "Record not found", 404);
    }

    if (error.code === "P2002") {
      return new AppError("CONFLICT", "Record already exists", 409, {
        fields: error.meta?.target,
      });
    }
  }

  if (error instanceof Error) {
    return new AppError("INTERNAL_ERROR", error.message, 500);
  }

  return new AppError("INTERNAL_ERROR", "An unexpected error occurred", 500);
}
