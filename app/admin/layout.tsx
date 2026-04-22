import Link from "next/link";
import { redirect } from "next/navigation";

import { SiteFooter } from "@/components/store/site-footer";
import { SiteHeader } from "@/components/store/site-header";
import { getAdminSession } from "@/lib/admin-auth";

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
                  Manage live orders, products, customers, and categories from the
                  same Neon-backed admin workspace.
                </p>
              </div>
              <div className="rounded-full bg-[#fff7f2] px-5 py-3 text-[0.95rem] font-semibold text-stone-900">
                Signed in as {session.user.email}
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
              <aside className="rounded-[22px] border border-[rgba(0,0,0,0.12)] bg-[#fffdfb] p-5 shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
                <nav className="space-y-2">
                  {adminLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block rounded-[16px] border border-[rgba(0,0,0,0.08)] px-4 py-3 text-[0.98rem] font-semibold text-stone-900 transition hover:border-[#ef7f41] hover:text-[#ef7f41]"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </aside>

              <section>{children}</section>
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
