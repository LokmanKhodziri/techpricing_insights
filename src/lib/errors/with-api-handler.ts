import type { NextResponse } from "next/server";

import { apiError } from "@/lib/errors/api-response";

type ApiHandler = () => Promise<NextResponse>;

export async function withApiHandler(handler: ApiHandler) {
  try {
    return await handler();
  } catch (error) {
    return apiError(error);
  }
}
