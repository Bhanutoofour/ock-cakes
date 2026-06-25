"use client";

import type { Product } from "@/lib/store-schema";

const priceFormatter = new Intl.NumberFormat("en-IN");

function tidyLabel(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function getOccasionPhrase(category: string) {
  const normalized = category.toLowerCase();

  if (normalized.includes("wedding") || normalized.includes("engagement")) {
    return "weddings, engagements, and family celebrations";
  }

  if (normalized.includes("birthday")) {
    return "birthdays, surprise parties, and milestone celebrations";
  }

  if (normalized.includes("anniversary")) {
    return "anniversaries, date nights, and thoughtful surprises";
  }

  if (normalized.includes("corporate")) {
    return "office parties, team milestones, and client celebrations";
  }

  if (normalized.includes("kids")) {
    return "kids' birthdays, school parties, and playful celebrations";
  }

  return "birthdays, anniversaries, and special celebrations";
}

function getHeroIntro(product: Product) {
  const category = tidyLabel(product.category || "cakes");
  const categoryLower = category.toLowerCase();
  const occasionPhrase = getOccasionPhrase(category);
  const leadTime = tidyLabel(product.leadTime || "same day").toLowerCase();

  return `${product.name} is a freshly prepared ${categoryLower} cake for ${occasionPhrase} in Hyderabad. Choose your flavour, weight, and cake message, then book ${leadTime} cake delivery from OccasionKart.`;
}

export function ProductSummaryPanel({
  product,
  rating,
  reviewsLabel,
}: {
  product: Product;
  rating: number | string;
  reviewsLabel: string;
}) {
  const numericRating = Number(rating);
  const ratingLabel = Number.isFinite(numericRating)
    ? numericRating.toFixed(1)
    : String(rating);
  const heroIntro = getHeroIntro(product);

  return (
    <div className="rounded-[28px] border border-[var(--line)] bg-white p-5 shadow-[0_18px_45px_rgba(77,37,28,0.06)] sm:p-7 lg:rounded-[32px]">
      <p className="text-[0.8rem] font-semibold tracking-[0.08em] text-[var(--brand-red)]">
        {product.category}
      </p>
      <h1 className="mt-2 text-[1.9rem] font-semibold leading-[1.12] text-[var(--brand-brown)] sm:text-[2.35rem] xl:text-[2.55rem]">
        {product.name}
      </h1>

      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-2 text-[0.98rem] font-medium text-[#586786]">
        <span className="text-stone-900">{ratingLabel}</span>
        <span className="text-[var(--brand-gold)]">&#9733;</span>
        <span>({reviewsLabel})</span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="text-[2rem] font-bold leading-none text-[var(--brand-brown)] sm:text-[2.2rem]">
          Rs. {priceFormatter.format(product.price)}
        </div>
        <div className="rounded-full bg-[var(--cream-strong)] px-3 py-1.5 text-[0.78rem] font-semibold text-stone-700">
          {product.leadTime} delivery
        </div>
      </div>

      <p className="mt-5 max-w-[62ch] text-[1rem] leading-8 text-stone-700 sm:text-[1.05rem]">
        {heroIntro}
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-[18px] bg-[#fffaf6] px-4 py-3">
          <p className="text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-[#9c7a67]">
            Fresh
          </p>
          <p className="mt-1 text-[0.92rem] font-semibold text-[var(--brand-brown)]">
            Made for your slot
          </p>
        </div>
        <div className="rounded-[18px] bg-[#fffaf6] px-4 py-3">
          <p className="text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-[#9c7a67]">
            Delivery
          </p>
          <p className="mt-1 text-[0.92rem] font-semibold text-[var(--brand-brown)]">
            Across Hyderabad
          </p>
        </div>
        <div className="rounded-[18px] bg-[#fffaf6] px-4 py-3">
          <p className="text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-[#9c7a67]">
            Custom
          </p>
          <p className="mt-1 text-[0.92rem] font-semibold text-[var(--brand-brown)]">
            Message and flavour
          </p>
        </div>
      </div>
    </div>
  );
}
