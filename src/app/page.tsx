import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16">
      <section className="space-y-4">
        <p className="text-sm font-medium text-muted-foreground">
          Malaysia PC Hardware Market
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight">
          TechPrising Insights
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Upload marketplace exports, normalize product titles, and track
          pricing trends with ROI-ready analytics.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard" className={cn(buttonVariants())}>
            Open dashboard
          </Link>
          <Link
            href="/imports"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Import data
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Ingest & normalize",
            body: "Map titles like RTX 2060S and RTX 2060 Super to one canonical product.",
          },
          {
            title: "Track listings",
            body: "Store append-only price observations with platform attribution.",
          },
          {
            title: "Analyze margins",
            body: "Compare current prices against MSRP and your cost basis.",
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
