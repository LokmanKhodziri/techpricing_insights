"use client";

import Link from "next/link";
import {
  Show,
  SignInButton,
  UserButton,
  useAuth,
} from "@clerk/nextjs";

import { buttonVariants } from "@/components/ui/button";
import { isAdminRole, isContributorRole } from "@/lib/auth/roles";
import { APP_NAME } from "@/lib/constants/brand";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { sessionClaims } = useAuth();
  const role = sessionClaims?.metadata?.role;
  const canContribute = isContributorRole(role);
  const isAdmin = isAdminRole(role);

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
        <Link href="/" className="font-semibold tracking-tight">
          {APP_NAME}
        </Link>

        <nav className="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
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

          {canContribute && (
            <>
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
            </>
          )}

          {isAdmin && (
            <Link
              href="/admin"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              Admin
            </Link>
          )}

          <Show when="signed-out">
            <SignInButton mode="modal">
              <button
                type="button"
                className={cn(buttonVariants({ size: "sm" }))}
              >
                Sign in
              </button>
            </SignInButton>
          </Show>

          <Show when="signed-in">
            <UserButton />
          </Show>
        </nav>
      </div>
    </header>
  );
}
