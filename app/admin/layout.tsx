import Link from "next/link";
import { redirect } from "next/navigation";

import { SiteFooter } from "@/components/store/site-footer";
import { SiteHeader } from "@/components/store/site-header";
import { getAdminSession } from "@/lib/admin-auth";
import { getOrderDashboardStats } from "@/lib/server/orders";
import { AdminSidebar } from "./admin-sidebar";

const adminLinks = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/categories", label: "Categories" },
];

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { session, isAdmin } = await getAdminSession();

  if (!session?.user) {
    redirect("/login");
  }

  const orderStats = isAdmin ? await getOrderDashboardStats() : null;
  const sidebarLinks = adminLinks.map((link) =>
    link.href === "/admin/orders"
      ? { ...link, badgeCount: orderStats?.pendingOrders ?? 0 }
      : link,
  );

  return (
    <>
      <SiteHeader />
      <main className="bg-white page-pad py-12">
        {!isAdmin ? (
          <div className="mx-auto max-w-[760px] rounded-[22px] border border-[rgba(0,0,0,0.12)] bg-white p-8 shadow-[0_10px_24px_rgba(0,0,0,0.08)]">
            <h1 className="text-[2rem] font-semibold text-black">Admin Access Required</h1>
            <p className="mt-3 text-[1rem] leading-8 text-[#6c7396]">
              This admin area is restricted to approved accounts. Add your email to
              `ADMIN_EMAILS` in production to grant access.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/account"
                className="rounded-full bg-[#ef7f41] px-6 py-3 text-[1rem] font-semibold text-white"
              >
                Back to Account
              </Link>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-[1480px]">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="section-kicker">Admin</p>
                <h1 className="mt-3 text-[2.6rem] font-semibold text-black">
                  OccasionKart Control Panel
                </h1>
                <p className="mt-3 max-w-[72ch] text-[1rem] leading-8 text-[#6c7396]">
                  Manage live orders, products, customers, and categories from one
                  workspace.
                </p>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
              <AdminSidebar links={sidebarLinks} userEmail={session.user.email} />

              <section>{children}</section>
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
