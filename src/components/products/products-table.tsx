import Link from "next/link";

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
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const isSelected = product.id === activeProductId;
            const displayName = `${product.brand} ${product.model}${
              product.variant ? ` ${product.variant}` : ""
            }`;

            const rowClassName = cn(
              "border-t border-border transition-colors",
              (onSelect || linkToDetail) && "hover:bg-muted/30",
              isSelected && "bg-muted/50",
            );

            if (linkToDetail) {
              return (
                <tr key={product.id} className={rowClassName}>
                  <td className="px-4 py-3">
                    <Link
                      href={`/products/${product.slug}`}
                      className="font-medium hover:underline"
                    >
                      {displayName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {CATEGORY_LABELS[product.category] ?? product.category}
                  </td>
                  <td className="px-4 py-3">{product.listingCount}</td>
                </tr>
              );
            }

            return (
              <tr
                key={product.id}
                className={cn(rowClassName, onSelect && "cursor-pointer")}
                onClick={onSelect ? () => onSelect(product.id) : undefined}
              >
                <td className="px-4 py-3">{displayName}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {CATEGORY_LABELS[product.category] ?? product.category}
                </td>
                <td className="px-4 py-3">{product.listingCount}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
