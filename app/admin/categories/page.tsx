import { createMetadata } from "@/lib/seo";
import { listCategorySummaries, listProducts } from "@/lib/server/catalog";

import { AdminCategoriesClient } from "./admin-categories-client";

export const metadata = createMetadata({
  title: "Admin Categories | OccasionKart",
  description:
    "Manage OccasionKart categories, assign products to categories, remove products, and handle bulk category updates.",
  noIndex: true,
});

export default async function AdminCategoriesPage() {
  const [products, categories] = await Promise.all([
    listProducts({ includeCorporate: true }),
    listCategorySummaries(300, true),
  ]);

  return <AdminCategoriesClient initialProducts={products} initialCategories={categories} />;
}
