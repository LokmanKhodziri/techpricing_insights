"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import type { Roles } from "@/types/globals";

export async function setRole(formData: FormData) {
  const { sessionClaims } = await auth();

  if (sessionClaims?.metadata?.role !== "admin") {
    return;
  }

  const id = formData.get("id");
  const role = formData.get("role");

  if (typeof id !== "string" || !id) {
    return;
  }

  if (role !== "admin" && role !== "contributor" && role !== "remove") {
    return;
  }

  const client = await clerkClient();
  const nextRole: Roles | null = role === "remove" ? null : role;

  await client.users.updateUserMetadata(id, {
    publicMetadata: { role: nextRole },
  });

  revalidatePath("/admin");
}
