import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants/brand";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-semibold tracking-tight">
          {APP_NAME}
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Dashboard
          </Link>
          <Link
            href="/products"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Products
          </Link>
          <Link
            href="/imports"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Imports
          </Link>
          <Link
            href="/normalization"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Review
          </Link>
        </nav>
      </div>
    </header>
  );
}
