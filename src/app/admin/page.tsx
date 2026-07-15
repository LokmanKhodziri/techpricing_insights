import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { setRole } from "@/app/admin/_actions";
import { SearchUsers } from "@/app/admin/search-users";
import { buttonVariants } from "@/components/ui/button";
import { getRoleLabel } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { sessionClaims } = await auth();

  if (sessionClaims?.metadata?.role !== "admin") {
    redirect("/forbidden");
  }

  const query = (await searchParams).search?.trim();
  const client = await clerkClient();
  const users = query
    ? (await client.users.getUserList({ query, limit: 20 })).data
    : [];

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
        <p className="text-sm text-muted-foreground">
          Promote trusted users to contributor (imports + review) or admin.
          Roles are stored in Clerk{" "}
          <code className="rounded bg-muted px-1">publicMetadata</code>.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Role guide</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong>Viewer</strong> — public prices only (default)
          </li>
          <li>
            <strong>Contributor</strong> — Imports + Review queue
          </li>
          <li>
            <strong>Admin</strong> — contributor access + manage roles here
          </li>
        </ul>
      </div>

      <SearchUsers />

      {!query && (
        <p className="text-sm text-muted-foreground">
          Search for a user by email or name to change their role.
        </p>
      )}

      {query && users.length === 0 && (
        <p className="text-sm text-muted-foreground">No users matched “{query}”.</p>
      )}

      <div className="space-y-3">
        {users.map((user) => {
          const email = user.emailAddresses.find(
            (item) => item.id === user.primaryEmailAddressId,
          )?.emailAddress;
          const role = user.publicMetadata.role as string | undefined;

          return (
            <div
              key={user.id}
              className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-muted-foreground">{email}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Role: {getRoleLabel(role)}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <form action={setRole}>
                  <input type="hidden" name="id" value={user.id} />
                  <input type="hidden" name="role" value="contributor" />
                  <button
                    type="submit"
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  >
                    Make contributor
                  </button>
                </form>
                <form action={setRole}>
                  <input type="hidden" name="id" value={user.id} />
                  <input type="hidden" name="role" value="admin" />
                  <button
                    type="submit"
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  >
                    Make admin
                  </button>
                </form>
                <form action={setRole}>
                  <input type="hidden" name="id" value={user.id} />
                  <input type="hidden" name="role" value="remove" />
                  <button
                    type="submit"
                    className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                  >
                    Remove role
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
