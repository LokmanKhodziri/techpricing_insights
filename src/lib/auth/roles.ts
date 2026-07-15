import type { Roles } from "@/types/globals";

export const CONTRIBUTOR_ROLES: Roles[] = ["admin", "contributor"];

export function isContributorRole(role: string | undefined | null): boolean {
  return role === "admin" || role === "contributor";
}

export function isAdminRole(role: string | undefined | null): boolean {
  return role === "admin";
}

export function getRoleLabel(role: string | undefined | null): string {
  if (role === "admin") return "Admin";
  if (role === "contributor") return "Contributor";
  return "Viewer";
}
