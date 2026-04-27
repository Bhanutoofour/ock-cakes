import Link from "next/link";
import { headers } from "next/headers";

import { SiteFooter } from "@/components/store/site-footer";
import { SiteHeader } from "@/components/store/site-header";
import { auth } from "@/lib/auth";
import { createMetadata } from "@/lib/seo";

import { SignOutButton } from "./sign-out-button";

export const metadata = createMetadata({
  title: "My Account | OccasionKart",
  description:
    "View your OccasionKart account details and stay ready for upcoming cake orders.",
  keywords: ["OccasionKart account", "customer profile", "cake order account"],
  noIndex: true,
});

export default async function AccountPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <>
      <SiteHeader />
      <main className="bg-white page-pad py-12">
        <div className="mx-auto max-w-[760px] rounded-[22px] border border-[rgba(0,0,0,0.12)] bg-white p-8 shadow-[0_10px_24px_rgba(0,0,0,0.08)]">
          <h1 className="text-[2rem] font-semibold text-black">My Account</h1>

          {session?.user ? (
            <>
              <p className="mt-2 text-[1rem] text-[#6c7396]">
                Your customer account is ready for future order history, saved addresses,
                and checkout autofill.
              </p>

              <div className="mt-6 grid gap-4 rounded-[18px] bg-[#fffaf6] p-5 sm:grid-cols-2">
                <div>
                  <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-[#ef7f41]">
                    Name
                  </p>
                  <p className="mt-2 text-[1rem] font-semibold text-stone-900">
                    {session.user.name}
                  </p>
                </div>
                <div>
                  <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-[#ef7f41]">
                    Email
                  </p>
                  <p className="mt-2 text-[1rem] font-semibold text-stone-900">
                    {session.user.email}
                  </p>
                </div>
                <div>
                  <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-[#ef7f41]">
                    Phone
                  </p>
                  <p className="mt-2 text-[1rem] font-semibold text-stone-900">
                    {"phone" in session.user && session.user.phone
                      ? String(session.user.phone)
                      : "Add during next profile update"}
                  </p>
                </div>
                <div>
                  <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-[#ef7f41]">
                    Session
                  </p>
                  <p className="mt-2 text-[1rem] font-semibold text-stone-900">
                    Active
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/admin/products"
                  className="rounded-full border border-[rgba(0,0,0,0.12)] px-6 py-3 text-[1rem] font-semibold text-stone-900"
                >
                  Manage Products
                </Link>
                <Link
                  href="/account/orders"
                  className="rounded-full border border-[rgba(0,0,0,0.12)] px-6 py-3 text-[1rem] font-semibold text-stone-900"
                >
                  View My Orders
                </Link>
                <Link
                  href="/cakes"
                  className="rounded-full bg-[#ef7f41] px-6 py-3 text-[1rem] font-semibold text-white"
                >
                  Continue Shopping
                </Link>
                <SignOutButton />
              </div>
            </>
          ) : (
            <>
              <p className="mt-2 text-[1rem] text-[#6c7396]">
                Sign in to connect future orders, saved delivery details, and customer
                history to your account.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/login"
                  className="rounded-full bg-[#ef7f41] px-6 py-3 text-[1rem] font-semibold text-white"
                >
                  Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
