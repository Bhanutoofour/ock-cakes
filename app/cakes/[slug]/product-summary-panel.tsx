"use client";

import { useMemo, useState } from "react";

import type { Product } from "@/lib/store-schema";

const priceFormatter = new Intl.NumberFormat("en-IN");

function cleanDescription(description: string) {
  return description
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getCollapsedDescription(description: string, maxLength = 180) {
  if (description.length <= maxLength) {
    return description;
  }

  return `${description.slice(0, maxLength).trimEnd()}...`;
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
  const [expanded, setExpanded] = useState(false);
  const cleanedDescription = useMemo(
    () => cleanDescription(product.description),
    [product.description],
  );
  const collapsedDescription = useMemo(
    () => getCollapsedDescription(cleanedDescription),
    [cleanedDescription],
  );
  const shouldCollapse = collapsedDescription !== cleanedDescription;
  const numericRating = Number(rating);
  const ratingLabel = Number.isFinite(numericRating)
    ? numericRating.toFixed(1)
    : String(rating);

  return (
    <div className="rounded-[32px] border border-[var(--line)] bg-white p-6 shadow-[0_18px_45px_rgba(77,37,28,0.06)] sm:p-7">
      <p className="text-[0.8rem] font-semibold tracking-[0.08em] text-[var(--brand-red)]">
        {product.category}
      </p>
      <h1 className="mt-2 text-[1.95rem] font-semibold leading-[1.15] text-[var(--brand-brown)] sm:text-[2.35rem]">
        {product.name}
      </h1>

      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-2 text-[0.98rem] font-medium text-[#586786]">
        <span className="text-stone-900">{ratingLabel}</span>
        <span className="text-[var(--brand-gold)]">★</span>
        <span>({reviewsLabel})</span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="text-[2.05rem] font-bold leading-none text-[var(--brand-brown)] sm:text-[2.2rem]">
          Rs. {priceFormatter.format(product.price)}
        </div>
        <div className="rounded-full bg-[var(--cream-strong)] px-3 py-1.5 text-[0.78rem] font-semibold text-stone-700">
          {product.leadTime} delivery
        </div>
      </div>

      <div className="mt-5 text-[1rem] leading-7 text-stone-600">
        <span>{expanded || !shouldCollapse ? cleanedDescription : collapsedDescription}</span>
        {shouldCollapse ? (
          <button
            type="button"
            className="ml-2 text-[1rem] font-semibold text-[var(--brand-brown)] transition hover:text-[var(--brand-red)]"
            onClick={() => setExpanded((current) => !current)}
          >
            {expanded ? "Read less" : "Read more"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
