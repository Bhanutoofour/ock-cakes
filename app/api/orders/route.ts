import type { NextRequest } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";
import { listOrders } from "@/lib/server/orders";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { isAdmin } = await getAdminSession();
  if (!isAdmin) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const limit = Number(searchParams.get("limit"));
  const orders = await listOrders({
    status: searchParams.get("status"),
    paymentStatus: searchParams.get("paymentStatus") ?? "paid",
    limit: Number.isFinite(limit) ? limit : undefined,
  });

  return Response.json({
    data: orders,
    meta: {
      total: orders.length,
    },
  });
}
