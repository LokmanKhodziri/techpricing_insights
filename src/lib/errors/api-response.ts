import { NextResponse } from "next/server";

import { AppError } from "@/lib/errors/app-error";
import { toAppError } from "@/lib/errors/normalize-error";

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(error: unknown) {
  const appError =
    error instanceof AppError ? error : toAppError(error);

  if (!(error instanceof AppError)) {
    console.error(error);
  }

  return NextResponse.json(
    {
      success: false,
      error: {
        code: appError.code,
        message: appError.message,
        details: appError.details,
      },
    },
    { status: appError.status },
  );
}

export function notFound(resource: string) {
  return new AppError("NOT_FOUND", `${resource} not found`, 404);
}
