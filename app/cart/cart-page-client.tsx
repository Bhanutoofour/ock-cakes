"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

import { useCart } from "@/components/store/cart-context";

export function CartPageClient() {
  const { items, updateQuantity, removeItem } = useCart();
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = items.length > 0 ? 99 : 0;
  const total = subtotal + delivery;

  return (
    <main className="flex-1">
      <section className="page-pad mx-auto grid w-full max-w-7xl gap-8 py-14 lg:grid-cols-[1.1fr_0.75fr]">
        <div>
          <p className="section-kicker">Cart</p>
          <h1 className="section-title">Review your celebration order</h1>
          {items.length === 0 ? (
            <div className="mt-8 rounded-[24px] border border-[var(--line)] bg-white p-6 text-stone-600">
              Your cart is empty. Browse cakes to add items.
            </div>
          ) : (
            <div className="mt-8 space-y-5">
              {items.map((item) => (
                <article
                  key={item.key}
                  className="grid gap-5 rounded-[32px] border border-[var(--line)] bg-white p-5 shadow-[0_18px_45px_rgba(77,37,28,0.06)] sm:grid-cols-[180px_1fr]"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="aspect-[4/3] w-full rounded-[24px] object-cover object-center"
                  />
                  <div className="flex flex-col justify-between gap-4">
                    <div>
                      <h2 className="mt-2 text-2xl font-semibold text-[var(--brand-brown)]">
                        {item.name}
                      </h2>
                      <p className="mt-2 text-[0.96rem] text-[#6c7396]">
                        {item.weightLabel ?? "Standard weight"}
                        {item.flavorLabel ? ` • ${item.flavorLabel}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <button
                          className="h-9 w-9 rounded-full border border-[var(--line)]"
                          type="button"
                          onClick={() => updateQuantity(item.key, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span className="text-lg font-semibold text-stone-700">
                          {item.quantity}
                        </span>
                        <button
                          className="h-9 w-9 rounded-full border border-[var(--line)]"
                          type="button"
                          onClick={() => updateQuantity(item.key, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <div className="flex items-center gap-4">
                        <button
                          className="text-sm text-[#ef7f41]"
                          type="button"
                          onClick={() => removeItem(item.key)}
                        >
                          Remove
                        </button>
                        <p className="text-2xl font-bold text-[var(--brand-brown)]">
                          Rs. {item.price * item.quantity}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="rounded-[36px] border border-[var(--line)] bg-[linear-gradient(180deg,#fff,#fff6ef)] p-8 shadow-[0_22px_55px_rgba(77,37,28,0.08)]">
          <p className="section-kicker">Summary</p>
          <div className="mt-8 space-y-4 text-sm text-stone-600">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>Rs. {subtotal}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Delivery</span>
              <span>Rs. {delivery}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Discount</span>
              <span className="text-[var(--brand-red)]">Applied at checkout</span>
            </div>
          </div>
          <div className="mt-6 border-t border-[var(--line)] pt-6">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-stone-800">Total</span>
              <span className="text-3xl font-bold text-[var(--brand-brown)]">
                Rs. {total}
              </span>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <Link
              href="/checkout"
              className="block w-full rounded-full bg-[var(--brand-red)] px-5 py-3 text-center text-sm font-semibold text-white shadow-[0_18px_35px_rgba(189,39,26,0.24)]"
            >
              Proceed to checkout
            </Link>
            <Link
              href="/cakes"
              className="block w-full rounded-full border border-[var(--line)] px-5 py-3 text-center text-sm font-semibold text-stone-700"
            >
              Continue shopping
            </Link>
          </div>
        </aside>
      </section>
    </main>
  );
}
