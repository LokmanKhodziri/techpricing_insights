import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { AppError } from "@/lib/errors/app-error";
import { isAdminRole, isContributorRole } from "@/lib/auth/roles";
import type { Roles } from "@/types/globals";

export async function getSessionRole(): Promise<Roles | undefined> {
  const { sessionClaims } = await auth();
  return sessionClaims?.metadata?.role;
}

/** Enforce signed-in contributor/admin for API routes. */
export async function requireContributor() {
  const session = await auth();

  if (!session.userId) {
    throw new AppError("UNAUTHORIZED", "Sign in required", 401);
  }

  const role = session.sessionClaims?.metadata?.role;
  if (!isContributorRole(role)) {
    throw new AppError(
      "FORBIDDEN",
      "Contributor or admin role required to mutate data",
      403,
    );
  }

  return { userId: session.userId, role: role as Roles };
}

/** Enforce admin for API / server actions. */
export async function requireAdmin() {
  const session = await auth();

  if (!session.userId) {
    throw new AppError("UNAUTHORIZED", "Sign in required", 401);
  }

  const role = session.sessionClaims?.metadata?.role;
  if (!isAdminRole(role)) {
    throw new AppError("FORBIDDEN", "Admin role required", 403);
  }

  return { userId: session.userId, role: "admin" as const };
}

/** Redirect unsigned or non-contributor users away from protected pages. */
export async function requireContributorPage() {
  const session = await auth();

  if (!session.userId) {
    redirect("/sign-in");
  }

  const role = session.sessionClaims?.metadata?.role;
  if (!isContributorRole(role)) {
    redirect("/forbidden");
  }

  return { userId: session.userId, role: role as Roles };
}

export async function requireAdminPage() {
  const session = await auth();

  if (!session.userId) {
    redirect("/sign-in");
  }

  const role = session.sessionClaims?.metadata?.role;
  if (!isAdminRole(role)) {
    redirect("/forbidden");
  }

  return { userId: session.userId, role: "admin" as const };
}
