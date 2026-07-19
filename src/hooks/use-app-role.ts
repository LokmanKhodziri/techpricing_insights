"use client";

import { useAuth, useUser } from "@clerk/nextjs";

import { isAdminRole, isContributorRole } from "@/lib/auth/roles";
import type { Roles } from "@/types/globals";

function readRole(input: {
  sessionRole?: string;
  publicRole?: unknown;
}): Roles | undefined {
  if (input.sessionRole === "admin" || input.sessionRole === "contributor") {
    return input.sessionRole;
  }

  if (input.publicRole === "admin" || input.publicRole === "contributor") {
    return input.publicRole;
  }

  return undefined;
}

/** Client-side role from Clerk session claims, with publicMetadata fallback. */
export function useAppRole() {
  const { isLoaded: authLoaded, isSignedIn, sessionClaims } = useAuth();
  const { isLoaded: userLoaded, user } = useUser();

  const role = readRole({
    sessionRole: sessionClaims?.metadata?.role,
    publicRole: user?.publicMetadata?.role,
  });

  return {
    isLoaded: authLoaded && userLoaded,
    isSignedIn: Boolean(isSignedIn),
    role,
    isAdmin: isAdminRole(role),
    isContributor: isContributorRole(role),
  };
}
