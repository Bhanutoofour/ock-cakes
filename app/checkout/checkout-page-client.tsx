"use client";

import Link from "next/link";
import { useState } from "react";

import { InquiryForm } from "@/components/store/inquiry-form";
import { useCart } from "@/components/store/cart-context";

export function CheckoutPageClient() {
  const { items, clear } = useCart();
  const [createdOrder, setCreatedOrder] = useState<null | {
    orderNumber: string;
    subtotal: number;
    delivery: number;
    total: number;
    itemsCount: number;
    customerName: string;
  }>(null);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = items.length > 0 ? 99 : 0;
  const total = subtotal + delivery;
  const summaryValues = createdOrder ?? {
    subtotal,
    delivery,
    total,
    itemsCount: items.length,
    customerName: "",
    orderNumber: "",
  };
  const orderSummary =
    items.length > 0
      ? items.map((item) => `${item.name} x ${item.quantity}`).join(", ")
      : "Cart is currently empty";

  const handleCreateOrder = async (values: Record<string, string>) => {
    if (items.length === 0) {
      throw new Error("Your cart is empty. Add a cake before placing the order.");
    }

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer: {
          fullName: values.fullName,
          phone: values.phone,
          email: values.email || undefined,
        },
        delivery: {
          date: values.deliveryDate,
          address: values.address,
          cakeMessage: values.cakeMessage || undefined,
          city: "Hyderabad",
        },
        items: items.map((item) => ({
          slug: item.slug,
          quantity: item.quantity,
          weightId: item.weightId,
          flavorId: item.flavorId,
        })),
      }),
    });

    const payload = (await response.json()) as {
      data?: { orderNumber: string };
      error?: string;
    };

    if (!response.ok || !payload.data) {
      throw new Error(payload.error ?? "Unable to create your order right now.");
    }

    setCreatedOrder({
      orderNumber: payload.data.orderNumber,
      subtotal,
      delivery,
      total,
      itemsCount: items.length,
      customerName: values.fullName,
    });
    clear();
  };

  return (
    <main className="bg-white page-pad py-10">
      <div className="mx-auto grid max-w-[1180px] gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[22px] border border-[rgba(0,0,0,0.12)] bg-white p-8 shadow-[0_10px_24px_rgba(0,0,0,0.08)]">
          <h1 className="text-[2rem] font-semibold text-black">Checkout</h1>
          <p className="mt-2 text-[1rem] leading-8 text-[#6c7396]">
            Confirm your delivery details and place your cake order directly from
            checkout. WhatsApp is still available if you want manual confirmation.
          </p>

          <div className="mt-6 rounded-[18px] border border-[rgba(0,0,0,0.08)] bg-[#fffaf6] p-4 text-[0.95rem] leading-7 text-[#6c7396]">
            <p className="font-semibold text-stone-900">Current cart summary</p>
            <p className="mt-2">
              {createdOrder
                ? `Order ${createdOrder.orderNumber} was created for ${createdOrder.customerName}.`
                : orderSummary}
            </p>
          </div>

          <div className="mt-6">
            {createdOrder ? (
              <div className="rounded-[18px] border border-[rgba(34,139,34,0.16)] bg-[#f3fff2] p-6">
                <p className="text-[0.82rem] font-bold uppercase tracking-[0.18em] text-[#2f8f2f]">
                  Order Confirmed
                </p>
                <h2 className="mt-3 text-[1.5rem] font-semibold text-stone-900">
                  Your order number is {createdOrder.orderNumber}
                </h2>
                <p className="mt-3 text-[1rem] leading-8 text-[#5b6b5d]">
                  We stored your order in OccasionKart&apos;s system. You can keep
                  shopping or sign in to connect future account-based order history.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href="/cakes"
                    className="rounded-full bg-[#ef7f41] px-6 py-3 text-[1rem] font-semibold text-white"
                  >
                    Shop More Cakes
                  </Link>
                  <Link
                    href="/account"
                    className="rounded-full border border-[rgba(0,0,0,0.12)] px-6 py-3 text-[1rem] font-semibold text-stone-900"
                  >
                    Go to Account
                  </Link>
                </div>
              </div>
            ) : (
              <InquiryForm
                emailTo="support@occasionkart.com"
                emailSubject="OccasionKart Checkout Order Request"
                whatsappNumber="+91 9059058058"
                whatsappIntro={`Hello OccasionKart, I would like to place this cake order.\nCart Summary: ${orderSummary}`}
                primaryLabel="Place Order"
                secondaryLabel="Place Order on WhatsApp"
                onSubmit={handleCreateOrder}
                fields={[
                  {
                    name: "fullName",
                    label: "Full Name",
                    placeholder: "Enter your full name",
                    required: true,
                  },
                  {
                    name: "phone",
                    label: "Phone Number",
                    placeholder: "Enter your phone number",
                    type: "tel",
                    required: true,
                  },
                  {
                    name: "email",
                    label: "Email Address",
                    placeholder: "Enter your email address",
                    type: "email",
                  },
                  {
                    name: "deliveryDate",
                    label: "Delivery Date",
                    placeholder: "Choose a date",
                    type: "date",
                    required: true,
                  },
                  {
                    name: "address",
                    label: "Delivery Address",
                    placeholder: "Enter the delivery address in Hyderabad",
                    rows: 3,
                    required: true,
                  },
                  {
                    name: "cakeMessage",
                    label: "Message on Cake",
                    placeholder: "Enter the message to be written on the cake",
                  },
                ]}
              />
            )}
          </div>
        </div>

        <aside className="rounded-[22px] border border-[rgba(0,0,0,0.12)] bg-[#fff7f2] p-8 shadow-[0_10px_24px_rgba(0,0,0,0.08)]">
          <h2 className="text-[1.4rem] font-semibold text-black">Order Summary</h2>
          <div className="mt-5 space-y-3 text-[1rem] text-[#6c7396]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>Rs. {summaryValues.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>Rs. {summaryValues.delivery}</span>
            </div>
            <div className="flex justify-between">
              <span>Items</span>
              <span>{summaryValues.itemsCount}</span>
            </div>
          </div>
          <div className="mt-5 border-t border-[rgba(0,0,0,0.12)] pt-4">
            <div className="flex justify-between text-[1.1rem] font-semibold text-black">
              <span>Total</span>
              <span>Rs. {summaryValues.total}</span>
            </div>
          </div>
          <p className="mt-5 text-[0.95rem] leading-7 text-[#6c7396]">
            After you place the order, our team can confirm availability,
            customization details, and the delivery slot.
          </p>
          <Link
            href="/cart"
            className="mt-5 inline-flex rounded-full border border-[rgba(0,0,0,0.12)] px-5 py-3 text-[0.95rem] font-semibold text-stone-900"
          >
            Back to cart
          </Link>
        </aside>
      </div>
    </main>
  );
}
