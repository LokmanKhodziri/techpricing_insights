import { requireContributorPage } from "@/lib/auth/require-role";

export default async function ImportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireContributorPage();
  return children;
}
