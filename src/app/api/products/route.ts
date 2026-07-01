import { NextRequest } from "next/server";

import { apiSuccess } from "@/lib/errors/api-response";
import { withApiHandler } from "@/lib/errors/with-api-handler";
import { paginationSchema, productCategorySchema } from "@/lib/schemas/common";
import { listProducts } from "@/lib/services/catalog/product-queries";

export async function GET(request: NextRequest) {
  return withApiHandler(async () => {
    const { searchParams } = request.nextUrl;
    const { page, pageSize } = paginationSchema.parse({
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
    });

    const categoryParam = searchParams.get("category");
    const category = categoryParam
      ? productCategorySchema.parse(categoryParam)
      : undefined;

    const data = await listProducts({ category, page, pageSize });
    return apiSuccess(data);
  });
}
