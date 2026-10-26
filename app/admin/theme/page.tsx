import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/admin-auth";
import { listProducts } from "@/lib/server/catalog";
import { getStorefrontTheme } from "@/lib/server/storefront-theme";
import { createMetadata } from "@/lib/seo";
import { AdminThemeEditor } from "./theme-editor-client";

export const metadata = createMetadata({
  title: "Theme Editor | OccasionKart Admin",
  description: "Choose homepage cakes and edit the featured collection in the OccasionKart storefront.",
  noIndex: true,
});

export default async function AdminThemePage() {
  const { session, isAdmin } = await getAdminSession();
  if (!session?.user) redirect("/admin-login");
  if (!isAdmin) redirect("/account");
  const [products, theme] = await Promise.all([listProducts(), getStorefrontTheme()]);
  return <AdminThemeEditor initialProducts={products} initialTheme={theme} />;
}
