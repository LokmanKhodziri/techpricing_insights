"use client";

import { usePathname, useRouter } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SearchUsers() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <form
      className="flex flex-col gap-2 sm:flex-row"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const queryTerm = String(formData.get("search") ?? "").trim();
        router.push(
          queryTerm
            ? `${pathname}?search=${encodeURIComponent(queryTerm)}`
            : pathname,
        );
      }}
    >
      <input
        id="search"
        name="search"
        type="search"
        placeholder="Search by name or email"
        className="w-full flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
      />
      <button type="submit" className={cn(buttonVariants(), "shrink-0")}>
        Search
      </button>
    </form>
  );
}
