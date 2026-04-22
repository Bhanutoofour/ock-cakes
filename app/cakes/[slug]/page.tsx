/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/store/site-footer";
import { SiteHeader } from "@/components/store/site-header";
import { getProductSocialProof } from "@/lib/product-social-proof";
import {
  buildGeoCoverageLine,
  buildProductFaqs,
  buildProductKeywords,
  buildProductSeoDescription,
} from "@/lib/seo-content";
import { createMetadata } from "@/lib/seo";
import { getProductBySlug } from "@/lib/server/catalog";
import { ProductPurchasePanel } from "./product-purchase-panel";
import { ProductSummaryPanel } from "./product-summary-panel";

type CakeDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: CakeDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return createMetadata({ title: "Cake not found | Occasionkart", path: `/cakes/${slug}` });
  }

  return createMetadata({
    title: `${product.name} | Occasionkart`,
    description: buildProductSeoDescription({
      name: product.name,
      category: product.category,
      description: product.description,
      leadTime: product.leadTime,
    }),
    keywords: buildProductKeywords(product.name, product.category),
    path: `/cakes/${slug}`,
    image: product.image,
  });
}

export default async function CakeDetailPage({ params }: CakeDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const socialProof = getProductSocialProof(product.slug);
  const productFaqs = buildProductFaqs(product.name);
  const reviewCount = Number.parseInt(String(socialProof.reviewsLabel).replace(/[^0-9]/g, ""), 10);
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: [product.image],
    description: buildProductSeoDescription({
      name: product.name,
      category: product.category,
      description: product.description,
      leadTime: product.leadTime,
    }),
    brand: {
      "@type": "Brand",
      name: "OccasionKart",
    },
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      priceCurrency: "INR",
      price: String(product.price),
      url: `https://occasionkart.com/cakes/${product.slug}`,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: String(socialProof.rating),
      reviewCount: Number.isFinite(reviewCount) && reviewCount > 0 ? reviewCount : 100,
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: productFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />

        <section className="page-pad mx-auto w-full max-w-7xl py-14">
          <Link href="/cakes" className="text-sm font-semibold text-[var(--brand-red)]">
            Back to cakes
          </Link>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
            <div
              className={`overflow-hidden rounded-[36px] bg-gradient-to-br ${product.accent} p-4 shadow-[0_28px_70px_rgba(77,37,28,0.12)]`}
            >
              <img
                src={product.image}
                alt={product.name}
                className="h-full min-h-[420px] w-full rounded-[30px] object-cover object-center lg:min-h-[540px]"
              />
            </div>

            <div className="space-y-6">
              <ProductSummaryPanel
                product={product}
                rating={socialProof.rating}
                reviewsLabel={socialProof.reviewsLabel}
              />

              <div className="rounded-[32px] border border-[var(--line)] bg-white p-6 shadow-[0_18px_45px_rgba(77,37,28,0.06)]">
                <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--line)] pb-5">
                  <div>
                    <p className="mt-1 text-sm text-stone-500">{product.flavor}</p>
                  </div>
                  <div className="rounded-full bg-[var(--cream-strong)] px-4 py-2 text-sm font-semibold text-stone-700">
                    {product.leadTime} delivery
                  </div>
                </div>

                <ProductPurchasePanel product={product} />
              </div>
            </div>
          </div>

          <section className="mt-10 rounded-[30px] border border-[var(--line)] bg-[#fffaf6] p-6 sm:p-8">
            <h2 className="text-[1.45rem] font-semibold text-[var(--brand-brown)]">
              Why Customers Choose {product.name} in Hyderabad
            </h2>
            <p className="mt-4 text-[1rem] leading-8 text-[#6c7396]">
              {buildProductSeoDescription({
                name: product.name,
                category: product.category,
                description: product.description,
                leadTime: product.leadTime,
              })}
            </p>
            <p className="mt-3 text-[1rem] leading-8 text-[#6c7396]">{buildGeoCoverageLine()}</p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {productFaqs.map((faq) => (
                <article
                  key={faq.question}
                  className="rounded-[18px] border border-[rgba(0,0,0,0.08)] bg-white p-4"
                >
                  <h3 className="text-[1rem] font-semibold text-stone-900">{faq.question}</h3>
                  <p className="mt-2 text-[0.95rem] leading-7 text-[#6c7396]">{faq.answer}</p>
                </article>
              ))}
            </div>
          </section>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
