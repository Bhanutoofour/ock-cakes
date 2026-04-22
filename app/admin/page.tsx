import Link from "next/link";

import { createMetadata } from "@/lib/seo";
import { getCatalogStats } from "@/lib/server/catalog";
import { getOrderDashboardStats, listCustomerSummaries, listOrders } from "@/lib/server/orders";

export const metadata = createMetadata({
  title: "Admin Dashboard | OccasionKart",
  description:
    "View the live admin overview for OccasionKart orders, catalog, customers, and operating totals.",
});

export default async function AdminDashboardPage() {
  const [catalogStats, orderStats, customers, recentOrders] = await Promise.all([
    getCatalogStats(),
    getOrderDashboardStats(),
    listCustomerSummaries(5),
    listOrders({ limit: 5 }),
  ]);

  const cards = [
    { label: "Products", value: catalogStats.totalProducts, href: "/admin/products" },
    { label: "Categories", value: catalogStats.totalCategories, href: "/admin/categories" },
    { label: "Orders", value: orderStats.totalOrders, href: "/admin/orders" },
    { label: "Customers", value: customers.length, href: "/admin/customers" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-[22px] border border-[rgba(0,0,0,0.12)] bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,0.06)]"
          >
            <p className="text-[0.82rem] font-bold uppercase tracking-[0.18em] text-[#ef7f41]">
              {card.label}
            </p>
            <p className="mt-3 text-[2.2rem] font-semibold text-stone-900">{card.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[22px] border border-[rgba(0,0,0,0.12)] bg-white p-8 shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-[1.5rem] font-semibold text-black">Order Pulse</h2>
              <p className="mt-2 text-[0.98rem] text-[#6c7396]">
                Live business snapshot from the Neon-backed order system.
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="rounded-full border border-[rgba(0,0,0,0.12)] px-5 py-3 text-[0.95rem] font-semibold text-stone-900"
            >
              Open Orders
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[18px] bg-[#fffaf6] p-5">
              <p className="text-[0.82rem] font-semibold uppercase tracking-[0.16em] text-[#ef7f41]">
                Revenue
              </p>
              <p className="mt-3 text-[1.8rem] font-semibold text-stone-900">
                Rs. {orderStats.totalRevenue}
              </p>
            </div>
            <div className="rounded-[18px] bg-[#fffaf6] p-5">
              <p className="text-[0.82rem] font-semibold uppercase tracking-[0.16em] text-[#ef7f41]">
                Pending
              </p>
              <p className="mt-3 text-[1.8rem] font-semibold text-stone-900">
                {orderStats.pendingOrders}
              </p>
            </div>
            <div className="rounded-[18px] bg-[#fffaf6] p-5">
              <p className="text-[0.82rem] font-semibold uppercase tracking-[0.16em] text-[#ef7f41]">
                Active
              </p>
              <p className="mt-3 text-[1.8rem] font-semibold text-stone-900">
                {orderStats.activeOrders}
              </p>
            </div>
          </div>

          <div className="mt-7 space-y-4">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="block rounded-[18px] border border-[rgba(0,0,0,0.08)] bg-[#fffdfb] p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[0.82rem] font-bold uppercase tracking-[0.18em] text-[#ef7f41]">
                      {order.orderNumber}
                    </p>
                    <p className="mt-2 text-[1rem] font-semibold text-stone-900">
                      {order.customer.fullName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="capitalize text-stone-700">{order.status.replaceAll("_", " ")}</p>
                    <p className="mt-1 font-semibold text-stone-900">Rs. {order.pricing.total}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-[22px] border border-[rgba(0,0,0,0.12)] bg-white p-8 shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-[1.5rem] font-semibold text-black">Recent Customers</h2>
              <p className="mt-2 text-[0.98rem] text-[#6c7396]">
                Highest-signal customer records based on recent order activity.
              </p>
            </div>
            <Link
              href="/admin/customers"
              className="rounded-full border border-[rgba(0,0,0,0.12)] px-5 py-3 text-[0.95rem] font-semibold text-stone-900"
            >
              Open Customers
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {customers.map((customer) => (
              <Link
                key={customer.key}
                href={`/admin/customers/${encodeURIComponent(customer.key)}`}
                className="block rounded-[18px] border border-[rgba(0,0,0,0.08)] bg-[#fffdfb] p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[1rem] font-semibold text-stone-900">{customer.name}</p>
                    <p className="mt-1 text-[0.94rem] text-[#6c7396]">
                      {customer.email ?? customer.phone}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[0.94rem] text-stone-700">
                      {customer.ordersCount} orders
                    </p>
                    <p className="mt-1 font-semibold text-stone-900">
                      Rs. {customer.totalSpent}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
