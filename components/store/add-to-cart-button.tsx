"use client";

import type { ReactNode } from "react";

import { useCart } from "@/components/store/cart-context";

type AddToCartProps = {
  slug: string;
  name: string;
  price: number;
  image: string;
  weightId?: string;
  weightLabel?: string;
  weightKilograms?: number;
  flavorId?: string;
  flavorLabel?: string;
  flavorPricePerKg?: number;
  customPhotoName?: string;
  className?: string;
  children?: ReactNode;
};

const defaultButtonClassName =
  "rounded-full bg-[var(--brand-red)] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_35px_rgba(189,39,26,0.24)]";

export function AddToCartButton({
  slug,
  name,
  price,
  image,
  weightId,
  weightLabel,
  weightKilograms,
  flavorId,
  flavorLabel,
  flavorPricePerKg,
  customPhotoName,
  className,
  children,
}: AddToCartProps) {
  const { addItem } = useCart();

  return (
    <button
      type="button"
      className={className ?? defaultButtonClassName}
      onClick={() =>
        addItem({
          slug,
          name,
          price,
          image,
          weightId,
          weightLabel,
          weightKilograms,
          flavorId,
          flavorLabel,
          flavorPricePerKg,
          customPhotoName,
        })
      }
    >
      {children ?? "Add to cart"}
    </button>
  );
}
