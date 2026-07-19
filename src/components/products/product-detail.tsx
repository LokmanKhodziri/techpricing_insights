import Link from "next/link";

import { ProductMsrpEditor } from "@/components/products/product-msrp-editor";
import { ProductListingsTable } from "@/components/products/product-listings-table";
import { CATEGORY_LABELS } from "@/lib/constants/platforms";
import { formatMyrFromSen } from "@/lib/format";
import type { ProductDetail } from "@/types/catalog";
import { cn } from "@/lib/utils";

type ProductHeaderProps = {
  product: ProductDetail;
  className?: string;
};

export function ProductHeader({ product, className }: ProductHeaderProps) {
  const displayName = [product.brand, product.model, product.variant]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          {CATEGORY_LABELS[product.category] ?? product.category}
        </span>
        {product.msrpSen !== null && (
          <span className="text-xs text-muted-foreground">
            MSRP {formatMyrFromSen(product.msrpSen)}
          </span>
        )}
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">{displayName}</h1>
      <p className="text-sm text-muted-foreground">
        {product.listingCount} listing{product.listingCount === 1 ? "" : "s"} ·{" "}
        Match key: <code className="rounded bg-muted px-1">{product.matchKey}</code>
      </p>
    </div>
  );
}

type ProductSpecsProps = {
  specs: Record<string, unknown>;
};

export function ProductSpecs({ specs }: ProductSpecsProps) {
  const entries = Object.entries(specs);

  if (entries.length === 0) {
    return null;
  }

  return (
    <section className="rounded-xl border border-border p-4">
      <h2 className="text-sm font-medium">Specifications</h2>
      <dl className="mt-3 grid gap-3 sm:grid-cols-2">
        {entries.map(([key, value]) => (
          <div key={key} className="rounded-lg bg-muted/30 px-3 py-2">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              {key.replace(/([A-Z])/g, " $1").trim()}
            </dt>
            <dd className="mt-1 text-sm font-medium">{String(value)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

type ProductAliasesProps = {
  aliases: ProductDetail["aliasesRef"];
};

export function ProductAliases({ aliases }: ProductAliasesProps) {
  if (aliases.length === 0) {
    return null;
  }

  return (
    <section className="rounded-xl border border-border p-4">
      <h2 className="text-sm font-medium">Normalization aliases</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {aliases.map((alias) => (
          <li
            key={alias.alias}
            className="flex flex-col gap-0.5 rounded-lg bg-muted/30 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="font-mono text-xs">{alias.alias}</span>
            {alias.aliasRaw && (
              <span className="text-muted-foreground">{alias.aliasRaw}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

type ProductDetailViewProps = {
  product: ProductDetail;
};

export function ProductDetailView({ product }: ProductDetailViewProps) {
  return (
    <div className="space-y-6">
      <ProductHeader product={product} />
      <ProductMsrpEditor
        productId={product.id}
        slug={product.slug}
        msrpSen={product.msrpSen}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <ProductSpecs specs={product.specs} />
        <ProductAliases aliases={product.aliasesRef} />
      </div>
      <ProductListingsTable listings={product.recentListings} />
    </div>
  );
}

export function ProductBackLink() {
  return (
    <Link
      href="/products"
      className="inline-flex text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      ← Back to products
    </Link>
  );
}
