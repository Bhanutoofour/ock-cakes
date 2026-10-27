import Link from "next/link";

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
import { listProducts, listTopCategories } from "@/lib/server/catalog";

export const metadata = createMetadata({
  title: "Cake Collection Hyderabad | OccasionKart",
  description: buildCollectionSeoDescription("cake", 0),
  keywords: buildCollectionKeywords("cake"),
  path: "/cakes",
});

type CakesPageProps = {
  searchParams?: Promise<{ category?: string; sort?: string; q?: string }>;
};

export default async function CakesPage({ searchParams }: CakesPageProps) {
  const params = (await searchParams) ?? {};
  const selectedCategory = params.category?.trim();
  const searchQuery = params.q?.trim() ?? "";
  const sort = params.sort ?? "price-asc";
  const hasSearchQuery = searchQuery.length > 0;

  const filteredProducts = await listProducts({
    category: selectedCategory,
    query: searchQuery,
    sort,
  });
  const topCategories = hasSearchQuery
    ? []
    : (await listTopCategories(13)).filter((item) => item.toLowerCase() !== "uncategorized").slice(0, 12);
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Cake Collection Hyderabad",
    url: `${siteSeo.siteUrl}/cakes`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: filteredProducts.slice(0, 20).map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${siteSeo.siteUrl}/cakes/${product.slug}`,
        name: product.name,
      })),
    },
  };

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLd(collectionSchema) }}
        />
        <section className={`home-shell ${hasSearchQuery ? "py-8 sm:py-10" : "py-14"}`}>
          {hasSearchQuery ? (
            <div>
              <h1 className="text-[clamp(1.55rem,1.15rem+1.2vw,2.1rem)] font-semibold leading-tight text-black">
                Search results for &quot;{searchQuery}&quot;
              </h1>
              <p className="mt-2 text-[0.98rem] text-[var(--text-secondary)]">
                {filteredProducts.length} products found
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="section-kicker">Collections</p>
                  <h1 className="section-title">
                    {selectedCategory ? selectedCategory : "All cakes"}
                  </h1>
                  <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--text-secondary)]">
                    {filteredProducts.length} cakes to choose from. Search by name, sort by
                    price, or tap a category below.
                  </p>
                </div>
              </div>

              <form method="get" role="search" className="mt-7 grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <label className="relative block min-w-0">
                  <span className="sr-only">Search cakes</span>
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-secondary)]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <circle cx="10.8" cy="10.8" r="6.8" />
                    <path d="m16 16 4.3 4.3" />
                  </svg>
                  <input
                    type="search"
                    name="q"
                    defaultValue={searchQuery}
                    placeholder="Search cakes by name or flavour"
                    aria-label="Search cakes"
                    className="h-14 w-full rounded-2xl border border-[var(--line)] bg-white pl-12 pr-4 text-base text-[var(--foreground)] shadow-[0_3px_14px_rgba(63,36,27,0.04)] outline-none transition placeholder:text-[var(--text-secondary)]/75 focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary)]/10"
                  />
                </label>
                <div className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-white px-4 py-3 shadow-[0_3px_14px_rgba(63,36,27,0.04)] sm:justify-start">
                  <label htmlFor="cake-sort" className="shrink-0 text-sm font-semibold text-[var(--text-secondary)]">Sort by</label>
                  <select
                    id="cake-sort"
                    name="sort"
                    aria-label="Sort cakes by price"
                    defaultValue={sort}
                    onChange={(event) => event.currentTarget.form?.requestSubmit()}
                    className="min-w-0 cursor-pointer border-0 bg-transparent py-1 pr-5 text-sm font-semibold text-[var(--foreground)] outline-none focus:ring-0"
                  >
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                </div>
                {selectedCategory ? (
                  <input type="hidden" name="category" value={selectedCategory} />
                ) : null}
              </form>

              <nav aria-label="Cake categories" className="mt-7 flex gap-2.5 overflow-x-auto pb-2 sm:flex-wrap sm:overflow-visible">
                <Link
                  href={sort === "price-asc" ? "/cakes" : `/cakes?sort=${encodeURIComponent(sort)}`}
                  aria-current={!selectedCategory ? "page" : undefined}
                  className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                    !selectedCategory
                      ? "bg-[var(--brand-brown)] text-white shadow-sm"
                      : "border border-[var(--line)] bg-white text-[var(--foreground)]"
                  }`}
                >
                  All
                </Link>
                {topCategories.map((item) => {
                  const href = `/cakes?${new URLSearchParams({ category: item, sort }).toString()}`;
                  const active = item.toLowerCase() === selectedCategory?.toLowerCase();
                  return (
                    <Link
                      key={item}
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                        active
                          ? "bg-[var(--brand-brown)] text-white shadow-sm"
                          : "border border-[var(--line)] bg-white text-[var(--foreground)] hover:border-[var(--brand-red)] hover:text-[var(--brand-red)]"
                      }`}
                    >
                      {item}
                    </Link>
                  );
                })}
              </nav>
            </>
          )}

          <div className={`${hasSearchQuery ? "mt-6" : "mt-10"} grid grid-cols-1 gap-4 min-[460px]:grid-cols-2 md:grid-cols-3 md:gap-6 xl:grid-cols-5`}>
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {!hasSearchQuery ? (
            <section className="mt-12 rounded-[26px] border border-[rgba(0,0,0,0.08)] bg-[var(--background)] p-6 sm:p-8">
              <h2 className="text-[1.55rem] font-semibold text-[var(--brand-brown)]">
                Order Cakes Online in Hyderabad with Same Day Delivery
              </h2>
              <p className="mt-4 text-[1rem] leading-8 text-[var(--text-secondary)]">
                {buildCollectionSeoDescription(selectedCategory ?? "cake", filteredProducts.length)}
              </p>
              <p className="mt-3 text-[1rem] leading-8 text-[var(--text-secondary)]">{buildGeoCoverageLine()}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {buildCollectionKeywords(selectedCategory ?? "cake")
                  .slice(0, 10)
                  .map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full border border-[rgba(0,0,0,0.1)] bg-white px-3 py-1.5 text-[0.8rem] font-semibold text-[var(--foreground)]"
                    >
                      {keyword}
                    </span>
                  ))}
              </div>
            </section>
          ) : null}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
