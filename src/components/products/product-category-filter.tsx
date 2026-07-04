"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { buttonVariants } from "@/components/ui/button";
import {
  CATEGORY_LABELS,
  PRODUCT_CATEGORIES,
} from "@/lib/constants/platforms";
import type { ProductCategory } from "@/lib/schemas/common";
import { productCategorySchema } from "@/lib/schemas/common";
import { cn } from "@/lib/utils";

function parseCategoryParam(value: string | null): ProductCategory | null {
  if (!value) return null;
  const result = productCategorySchema.safeParse(value);
  return result.success ? result.data : null;
}

export function useProductCategoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = parseCategoryParam(searchParams.get("category"));

  const setCategory = useCallback(
    (next: ProductCategory | null) => {
      const params = new URLSearchParams(searchParams.toString());

      if (next) {
        params.set("category", next);
      } else {
        params.delete("category");
      }

      const query = params.toString();
      router.replace(query ? `/products?${query}` : "/products");
    },
    [router, searchParams],
  );

  return { category, setCategory };
}

export function ProductCategoryFilter() {
  const { category, setCategory } = useProductCategoryFilter();

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        className={cn(
          buttonVariants({
            variant: category === null ? "default" : "outline",
            size: "sm",
          }),
        )}
        onClick={() => setCategory(null)}
      >
        All
      </button>
      {PRODUCT_CATEGORIES.map((item) => (
        <button
          key={item}
          type="button"
          className={cn(
            buttonVariants({
              variant: category === item ? "default" : "outline",
              size: "sm",
            }),
          )}
          onClick={() => setCategory(item)}
        >
          {CATEGORY_LABELS[item]}
        </button>
      ))}
    </div>
  );
}
