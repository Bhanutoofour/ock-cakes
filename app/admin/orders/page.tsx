import { createMetadata } from "@/lib/seo";
import { listOrders } from "@/lib/server/orders";

import { AdminOrdersClient } from "./admin-orders-client";

export const metadata = createMetadata({
  title: "Admin Orders | OccasionKart",
  description: "Manage customer orders, statuses, and payment state from the admin area.",
});

export default async function AdminOrdersPage() {
  const orders = await listOrders({ limit: 200 });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[2rem] font-semibold text-black">Orders</h2>
        <p className="mt-2 text-[1rem] leading-8 text-[#6c7396]">
          Review incoming orders, open details, and move them through fulfillment.
        </p>
      </div>

      <AdminOrdersClient initialOrders={orders} />
    </div>
  );
}
