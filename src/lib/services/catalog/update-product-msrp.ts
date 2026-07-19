import { db } from "@/lib/db";
import { AppError } from "@/lib/errors/app-error";

export async function updateProductMsrp(productId: string, msrpSen: number) {
  const product = await db.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });

  if (!product) {
    throw new AppError("NOT_FOUND", "Product not found", 404);
  }

  return db.product.update({
    where: { id: productId },
    data: { msrpSen },
    select: {
      id: true,
      slug: true,
      msrpSen: true,
    },
  });
}
