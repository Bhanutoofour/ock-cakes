import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/store/product-card";
import { SiteFooter } from "@/components/store/site-footer";
import { SiteHeader } from "@/components/store/site-header";
import { toJsonLd } from "@/lib/json-ld";
import {
  buildCollectionKeywords,
  buildCollectionSeoDescription,
  buildGeoCoverageLine,
} from "@/lib/seo-content";
import { createMetadata, siteSeo } from "@/lib/seo";
import { listProducts } from "@/lib/server/catalog";
const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categoryName = slug.replace(/-/g, " ");

  return createMetadata({
    title: `${categoryName} Cakes Hyderabad | OccasionKart`,
    description: buildCollectionSeoDescription(categoryName),
    keywords: buildCollectionKeywords(categoryName),
    path: `/category/${slug}`,
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug: categorySlug } = await params;
  const products = await listProducts();
  const filtered = products.filter((product) =>
    (product.categories ?? []).some((cat) => slugify(cat) === categorySlug),
  );

  if (filtered.length === 0) {
    notFound();
  }

  const categoryName =
    filtered[0]?.categories?.find((cat) => slugify(cat) === categorySlug) ??
    categorySlug.replace(/-/g, " ");
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${categoryName} Cakes Hyderabad`,
    url: `${siteSeo.siteUrl}/category/${categorySlug}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: filtered.slice(0, 25).map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${siteSeo.siteUrl}/cakes/${product.slug}`,
        name: product.name,
      })),
    },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteSeo.siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Cakes",
        item: `${siteSeo.siteUrl}/cakes`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: categoryName,
        item: `${siteSeo.siteUrl}/category/${categorySlug}`,
      },
    ],
  };

  return (
    <>
      <SiteHeader />
      <main className="bg-white page-pad py-12">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLd(collectionSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLd(breadcrumbSchema) }}
        />
        <div className="mx-auto max-w-[1200px]">
          <div className="flex items-start justify-between">
            <h1 className="text-left text-[2rem] font-semibold text-black">
              {categoryName}
            </h1>
            <Link href="/cakes" className="text-[1rem] text-[#ef7f41]">
              View all cakes →
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 xl:grid-cols-5">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <section className="mt-10 rounded-[24px] border border-[rgba(0,0,0,0.08)] bg-[#fffaf6] p-6 sm:p-8">
            <h2 className="text-[1.45rem] font-semibold text-[var(--brand-brown)]">
              {categoryName} Cake Delivery in Hyderabad
            </h2>
            <p className="mt-4 text-[1rem] leading-8 text-[#6c7396]">
              {buildCollectionSeoDescription(categoryName, filtered.length)}
            </p>
            <p className="mt-3 text-[1rem] leading-8 text-[#6c7396]">{buildGeoCoverageLine()}</p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
