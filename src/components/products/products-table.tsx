import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { CATEGORY_LABELS } from "@/lib/constants/platforms";
import type { ProductSummary } from "@/types/catalog";
import { cn } from "@/lib/utils";

type ProductsTableProps = {
  products: ProductSummary[];
  activeProductId?: string | null;
  onSelect?: (productId: string) => void;
  linkToDetail?: boolean;
};

export function ProductsTable({
  products,
  activeProductId,
  onSelect,
  linkToDetail = false,
}: ProductsTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left">
          <tr>
            <th className="px-4 py-3 font-medium">Product</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Listings</th>
            {linkToDetail && (
              <th className="px-4 py-3 font-medium text-right">Action</th>
            )}
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const isSelected = product.id === activeProductId;
            const displayName = `${product.brand} ${product.model}${
              product.variant ? ` ${product.variant}` : ""
            }`;
            const productHref = `/products/${product.slug}`;

            const rowClassName = cn(
              "border-t border-border transition-colors",
              (onSelect || linkToDetail) && "hover:bg-muted/30",
              isSelected && "bg-muted/50",
              onSelect && "cursor-pointer",
            );

            return (
              <tr
                key={product.id}
                className={rowClassName}
                onClick={onSelect ? () => onSelect(product.id) : undefined}
              >
                <td className="px-4 py-3">
                  {linkToDetail ? (
                    <Link
                      href={productHref}
                      className="font-medium hover:underline"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {displayName}
                    </Link>
                  ) : (
                    displayName
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {CATEGORY_LABELS[product.category] ?? product.category}
                </td>
                <td className="px-4 py-3">{product.listingCount}</td>
                {linkToDetail && (
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={productHref}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "inline-flex items-center gap-1.5",
                      )}
                      onClick={(event) => event.stopPropagation()}
                    >
                      View
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </Link>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
