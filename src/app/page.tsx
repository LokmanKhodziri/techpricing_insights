import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE } from "@/lib/constants/brand";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16">
      <section className="space-y-4">
        <p className="text-sm font-medium text-muted-foreground">
          {APP_TAGLINE}
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight">
          {APP_NAME}
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          {APP_DESCRIPTION}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard" className={cn(buttonVariants())}>
            Open dashboard
          </Link>
          <Link
            href="/products"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Browse PC parts
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Import Shopee & Lazada",
            body: "Upload CSV/JSON exports from Malaysian marketplaces and clean messy product titles.",
          },
          {
            title: "Normalize PC parts",
            body: "Map names like RTX 2060S and RTX 2060 Super into one canonical part for fair comparison.",
          },
          {
            title: "Track MYR price trends",
            body: "See where GPU, CPU, and RAM prices are heading across local sellers — and vs MSRP.",
          },
        ].map((card) => (
          <article
            key={card.title}
            className="rounded-xl border border-border bg-card p-5 text-card-foreground"
          >
            <h2 className="font-medium">{card.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{card.body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
