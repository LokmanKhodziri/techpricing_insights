import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { ProductMsrpEditor } from "@/components/products/product-msrp-editor";
import { CATEGORY_LABELS, PLATFORM_LABELS } from "@/lib/constants/platforms";
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

type ProductListingsTableProps = {
  listings: ProductDetail["recentListings"];
};

export function ProductListingsTable({ listings }: ProductListingsTableProps) {
  if (listings.length === 0) {
    return (
      <section className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
        No listings recorded for this product yet.
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-xl border border-border">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-medium">Recent listings</h2>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left">
          <tr>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Platform</th>
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Price</th>
            <th className="px-4 py-3 font-medium text-right">Link</th>
          </tr>
        </thead>
        <tbody>
          {listings.map((listing) => (
            <tr key={listing.id} className="border-t border-border">
              <td className="px-4 py-3 text-muted-foreground">
                {new Date(listing.capturedAt).toLocaleDateString("en-MY")}
              </td>
              <td className="px-4 py-3">
                {PLATFORM_LABELS[listing.platform] ?? listing.platform}
              </td>
              <td className="max-w-xs truncate px-4 py-3">{listing.titleRaw}</td>
              <td className="px-4 py-3 font-medium">
                {formatMyrFromSen(listing.priceSen)}
              </td>
              <td className="px-4 py-3 text-right">
                {listing.sourceUrl ? (
                  <a
                    href={listing.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "inline-flex items-center gap-1.5",
                    )}
                  >
                    View listing
                    <ExternalLink className="size-3.5" aria-hidden="true" />
                  </a>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
