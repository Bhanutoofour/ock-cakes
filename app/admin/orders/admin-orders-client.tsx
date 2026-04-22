"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { Order } from "@/lib/store-schema";

function formatStatus(value: string) {
  return value.replaceAll("_", " ");
}

export function AdminOrdersClient({ initialOrders }: { initialOrders: Order[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");

  const filteredOrders = useMemo(() => {
    const lowerQuery = query.trim().toLowerCase();

    return initialOrders.filter((order) => {
      const matchesStatus = status ? order.status === status : true;
      const matchesQuery = lowerQuery
        ? [
            order.orderNumber,
            order.customer.fullName,
            order.customer.phone,
            order.customer.email ?? "",
          ]
            .join(" ")
            .toLowerCase()
            .includes(lowerQuery)
        : true;

      return matchesStatus && matchesQuery;
    });
  }, [initialOrders, query, status]);

  return (
    <div className="space-y-6">
      <div className="rounded-[22px] border border-[rgba(0,0,0,0.12)] bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
        <div className="grid gap-4 md:grid-cols-[1fr_220px]">
          <input
            value={query}
            placeholder="Search by order number, customer, phone, or email"
            className="w-full rounded-[14px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
            onChange={(event) => setQuery(event.target.value)}
          />
          <select
            value={status}
            className="rounded-[14px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="out_for_delivery">Out for delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Link
            key={order.id}
            href={`/admin/orders/${order.id}`}
            className="block rounded-[22px] border border-[rgba(0,0,0,0.12)] bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,0.06)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[0.82rem] font-bold uppercase tracking-[0.18em] text-[#ef7f41]">
                  {order.orderNumber}
                </p>
                <h2 className="mt-2 text-[1.2rem] font-semibold text-stone-900">
                  {order.customer.fullName}
                </h2>
                <p className="mt-2 text-[0.96rem] text-[#6c7396]">
                  {order.items.map((item) => `${item.name} x ${item.quantity}`).join(", ")}
                </p>
              </div>
              <div className="text-right">
                <p className="rounded-full bg-[#fff3e8] px-4 py-2 text-[0.9rem] font-semibold capitalize text-[#a85b22]">
                  {formatStatus(order.status)}
                </p>
                <p className="mt-3 text-[1.2rem] font-semibold text-stone-900">
                  Rs. {order.pricing.total}
                </p>
                <p className="mt-1 text-[0.9rem] text-[#6c7396]">
                  {new Date(order.createdAt).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </Link>
        ))}

        {filteredOrders.length === 0 ? (
          <div className="rounded-[22px] border border-[rgba(0,0,0,0.12)] bg-white p-8 text-[#6c7396] shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
            No orders match the current filters.
          </div>
        ) : null}
      </div>
    </div>
  );
}
