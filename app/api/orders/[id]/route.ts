import { headers } from "next/headers";
import type { NextRequest } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";
import { auth } from "@/lib/auth";
import { getOrderById, getTrackableOrder, updateOrder } from "@/lib/server/orders";

export const runtime = "nodejs";

type OrderRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, { params }: OrderRouteContext) {
  const { id } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const phone = request.nextUrl.searchParams.get("phone");
  const order = phone ? await getTrackableOrder(id, phone) : await getOrderById(id);

  if (!order) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }

  if (!phone && (!session?.user?.id || session.user.id !== order.userId)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json({ data: order });
}

export async function PATCH(request: Request, { params }: OrderRouteContext) {
  const { isAdmin } = await getAdminSession();
  if (!isAdmin) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const payload = await request.json();
  const result = await updateOrder(id, payload);

  if (!result.ok) {
    const status = result.message === "order not found" ? 404 : 400;
    return Response.json({ error: result.message }, { status });
  }

  return Response.json({ data: result.value });
}
