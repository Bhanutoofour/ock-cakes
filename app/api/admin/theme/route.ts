import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";
import { listProducts } from "@/lib/server/catalog";
import { getStorefrontTheme, saveStorefrontTheme } from "@/lib/server/storefront-theme";

export const runtime = "nodejs";

export async function GET() {
  const { isAdmin } = await getAdminSession();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ data: await getStorefrontTheme() });
}

export async function PUT(request: Request) {
  const { isAdmin } = await getAdminSession();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = await request.json();
  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "Invalid theme settings." }, { status: 400 });
  }
  const products = await listProducts();
  const data = await saveStorefrontTheme(payload, products);
  return NextResponse.json({ data });
}
