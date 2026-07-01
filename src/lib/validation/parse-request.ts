import { z } from "zod";

import { AppError } from "@/lib/errors/app-error";

export function formatZodError(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join(".") : "input";
      return `${path}: ${issue.message}`;
    })
    .join("; ");
}

export function toValidationError(error: z.ZodError) {
  return new AppError("VALIDATION_ERROR", formatZodError(error), 400, {
    issues: error.issues,
  });
}

export async function parseJsonBody<T extends z.ZodType>(
  request: Request,
  schema: T,
): Promise<z.infer<T>> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    throw new AppError("VALIDATION_ERROR", "Request body must be valid JSON", 400);
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    throw toValidationError(result.error);
  }

  return result.data;
}

export function parseParams<T extends z.ZodType>(
  params: unknown,
  schema: T,
): z.infer<T> {
  const result = schema.safeParse(params);
  if (!result.success) {
    throw toValidationError(result.error);
  }

  return result.data;
}
