import { NextRequest } from "next/server";

import { db } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/errors/api-response";
import { paginationSchema, productCategorySchema } from "@/lib/schemas/common";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const { page, pageSize } = paginationSchema.parse({
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
    });

    const categoryParam = searchParams.get("category");
    const category = categoryParam
      ? productCategorySchema.parse(categoryParam)
      : undefined;

    const where = category ? { category } : undefined;

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { updatedAt: "desc" },
        include: {
          _count: { select: { listings: true } },
        },
      }),
      db.product.count({ where }),
    ]);

    const data = products.map((product) => ({
      id: product.id,
      slug: product.slug,
      category: product.category,
      brand: product.brand,
      model: product.model,
      variant: product.variant,
      listingCount: product._count.listings,
    }));

    return apiSuccess({ items: data, total, page, pageSize });
  } catch (error) {
    return apiError(error);
  }
}
