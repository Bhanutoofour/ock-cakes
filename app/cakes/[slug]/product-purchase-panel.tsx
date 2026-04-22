"use client";

import { useState } from "react";

import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { resolveVariantPricing } from "@/lib/product-variants";
import type { Product } from "@/lib/store-schema";

const priceFormatter = new Intl.NumberFormat("en-IN");

export function ProductPurchasePanel({ product }: { product: Product }) {
  const [weightId, setWeightId] = useState(product.weightOptions[0]?.id ?? "");
  const [flavorId, setFlavorId] = useState(product.flavorOptions[0]?.id ?? "");

  if (product.weightOptions.length === 0 || product.flavorOptions.length === 0) {
    return (
      <>
        <div className="grid gap-4 py-5 sm:grid-cols-2">
          <div className="rounded-[24px] bg-[var(--cream-strong)] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Serving</p>
            <p className="mt-2 text-lg font-semibold text-[var(--brand-brown)]">
              {product.serves}
            </p>
          </div>
          <div className="rounded-[24px] bg-[var(--cream-strong)] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Included</p>
            <p className="mt-2 text-lg font-semibold text-[var(--brand-brown)]">
              Custom plaque
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {product.highlights.map((highlight) => (
            <div
              key={highlight}
              className="rounded-[20px] border border-[var(--line)] px-4 py-3 text-sm font-medium text-stone-700"
            >
              {highlight}
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <div className="inline-flex items-center rounded-full border border-[rgba(111,29,42,0.14)] bg-[#fff7f8] px-5 py-3 text-[var(--brand-maroon)]">
            <span className="text-[0.95rem] font-semibold">Rs</span>
            <span className="ml-1.5 text-[1.45rem] font-bold">
              {priceFormatter.format(product.price)}/-
            </span>
          </div>
          <AddToCartButton
            slug={product.slug}
            name={product.name}
            price={product.price}
            image={product.image}
          />
        </div>
      </>
    );
  }

  const { selectedWeight, selectedFlavor, unitPrice } = resolveVariantPricing(
    product,
    weightId,
    flavorId,
  );

  return (
    <>
      <div className="grid gap-4 py-5 lg:grid-cols-2">
        <div className="rounded-[24px] border border-[rgba(111,29,42,0.08)] bg-[linear-gradient(180deg,#fff8f3_0%,#fff2e8_100%)] p-5">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#9c7a67]">
            Weight
          </p>
          <select
            value={selectedWeight?.id ?? ""}
            className="mt-3 w-full rounded-[18px] border border-[rgba(111,29,42,0.18)] bg-white px-4 py-4 text-[1rem] font-semibold text-[var(--brand-brown)] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
            onChange={(event) => setWeightId(event.target.value)}
          >
            {product.weightOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label} - Rs. {option.price}
              </option>
            ))}
          </select>
        </div>
        <div className="rounded-[24px] border border-[rgba(111,29,42,0.08)] bg-[linear-gradient(180deg,#fff8f3_0%,#fff2e8_100%)] p-5">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#9c7a67]">
            Flavor
          </p>
          <select
            value={selectedFlavor?.id ?? ""}
            className="mt-3 w-full rounded-[18px] border border-[rgba(111,29,42,0.18)] bg-white px-4 py-4 text-[1rem] font-semibold text-[var(--brand-brown)] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
            onChange={(event) => setFlavorId(event.target.value)}
          >
            {product.flavorOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
                {option.pricePerKg > 0 ? ` (+Rs. ${option.pricePerKg}/Kg)` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {product.highlights.map((highlight) => (
          <div
            key={highlight}
            className="rounded-full border border-[var(--line)] bg-[#fffdfa] px-4 py-2.5 text-sm font-medium text-stone-700"
          >
            {highlight}
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-[28px] border border-[rgba(111,29,42,0.08)] bg-[linear-gradient(180deg,#fffdfb_0%,#fff6f0_100%)] p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-[0.78rem] font-semibold uppercase tracking-[0.24em] text-[#9c7a67]">
              Selected
            </p>
            <p className="text-[1rem] font-medium text-[#6c7396]">
              <span className="font-semibold text-[var(--brand-brown)]">
                {selectedWeight?.label ?? "Base"}
              </span>
              {" / "}
              <span className="font-semibold text-[var(--brand-brown)]">
                {selectedFlavor?.label ?? "Standard"}
              </span>
            </p>
            {selectedFlavor && selectedFlavor.pricePerKg > 0 ? (
              <p className="text-sm text-[#7d6890]">
                Flavor add-on: Rs. {selectedFlavor.pricePerKg} per Kg
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex min-w-[180px] items-center justify-center rounded-full border border-[rgba(111,29,42,0.14)] bg-[#fff7f8] px-5 py-3 text-[var(--brand-maroon)]">
              <span className="text-[0.95rem] font-semibold">Rs</span>
              <span className="ml-1.5 text-[1.7rem] font-bold leading-none">
                {priceFormatter.format(unitPrice)}/-
              </span>
            </div>
            <AddToCartButton
              slug={product.slug}
              name={`${product.name}${selectedWeight ? ` - ${selectedWeight.label}` : ""}${selectedFlavor ? ` - ${selectedFlavor.label}` : ""}`}
              price={unitPrice}
              image={product.image}
              weightId={selectedWeight?.id}
              weightLabel={selectedWeight?.label}
              weightKilograms={selectedWeight?.kilograms}
              flavorId={selectedFlavor?.id}
              flavorLabel={selectedFlavor?.label}
              flavorPricePerKg={selectedFlavor?.pricePerKg}
            />
          </div>
        </div>
      </div>
    </>
  );
}
