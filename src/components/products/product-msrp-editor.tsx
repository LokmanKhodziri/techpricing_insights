"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { useUpdateProductMsrp } from "@/hooks/use-update-product-msrp";
import { isAdminRole } from "@/lib/auth/roles";
import { formatMyrFromSen, senToMyr } from "@/lib/format";
import { cn } from "@/lib/utils";

type ProductMsrpEditorProps = {
  productId: string;
  slug: string;
  msrpSen: number | null;
};

export function ProductMsrpEditor({
  productId,
  slug,
  msrpSen,
}: ProductMsrpEditorProps) {
  const { sessionClaims } = useAuth();
  const isAdmin = isAdminRole(sessionClaims?.metadata?.role);
  const mutation = useUpdateProductMsrp(slug);
  const [msrpMyr, setMsrpMyr] = useState(
    msrpSen !== null ? String(senToMyr(msrpSen)) : "",
  );

  useEffect(() => {
    setMsrpMyr(msrpSen !== null ? String(senToMyr(msrpSen)) : "");
  }, [msrpSen]);

  if (!isAdmin) {
    return null;
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const value = Number(msrpMyr);
    if (!Number.isFinite(value) || value <= 0) {
      return;
    }

    mutation.mutate({ productId, msrpMyr: value });
  };

  return (
    <section className="rounded-xl border border-dashed border-border bg-muted/20 p-4">
      <div className="space-y-1">
        <h2 className="text-sm font-medium">Admin · Update MSRP</h2>
        <p className="text-xs text-muted-foreground">
          Set the reference price used for discount vs MSRP calculations. Only
          admins can change this.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <label className="flex flex-1 flex-col gap-1.5 text-sm">
          <span className="text-muted-foreground">MSRP (MYR)</span>
          <input
            type="number"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            value={msrpMyr}
            onChange={(event) => setMsrpMyr(event.target.value)}
            placeholder="e.g. 899"
            className="rounded-md border border-border bg-background px-3 py-2"
            disabled={mutation.isPending}
          />
        </label>

        <button
          type="submit"
          className={cn(buttonVariants({ size: "sm" }), "sm:mb-0.5")}
          disabled={mutation.isPending || !msrpMyr}
        >
          {mutation.isPending ? "Updating..." : "Update price"}
        </button>
      </form>

      {msrpSen !== null && (
        <p className="mt-3 text-xs text-muted-foreground">
          Current MSRP: {formatMyrFromSen(msrpSen)}
        </p>
      )}

      {mutation.isError && (
        <p className="mt-2 text-xs text-destructive">
          {(mutation.error as Error).message}
        </p>
      )}

      {mutation.isSuccess && (
        <p className="mt-2 text-xs text-green-700 dark:text-green-400">
          MSRP updated to {formatMyrFromSen(mutation.data.msrpSen)}.
        </p>
      )}
    </section>
  );
}
