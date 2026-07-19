import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ForbiddenPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Access denied</h1>
      <p className="text-sm text-muted-foreground">
        This area is limited to CariPart contributors and admins. You can still
        browse prices and trends publicly. Ask an admin to promote your account
        if you need import access.
      </p>
      <Link href="/dashboard" className={cn(buttonVariants(), "w-fit")}>
        Back to dashboard
      </Link>
    </div>
  );
}
