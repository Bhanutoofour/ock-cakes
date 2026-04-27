"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useSyncExternalStore, type ReactNode } from "react";

import { useCart } from "@/components/store/cart-context";

type NavLink = { label: string; href: string };
type MegaColumn = { title: string; links: NavLink[] };

const cakesMegaColumns: MegaColumn[] = [
  {
    title: "Cakes by Flavor",
    links: [
      { label: "Pineapple", href: "/category/pineapple-cakes" },
      { label: "Butterscotch", href: "/category/butterscotch-cakes" },
      { label: "Black Forest", href: "/category/black-forest-cakes" },
      { label: "Red Velvet", href: "/category/red-velvet-cakes" },
      { label: "Chocolate", href: "/category/chocolate-truffle" },
      { label: "Fresh Fruit", href: "/category/fresh-fruit-cakes" },
      { label: "Premium Cakes", href: "/cakes?sort=popular" },
      { label: "Trending Cakes", href: "/cakes?sort=popular" },
    ],
  },
  {
    title: "Anniversary & Birthday",
    links: [
      { label: "Wedding Anniversary", href: "/category/wedding-cakes" },
      { label: "Heart Shape Cakes", href: "/category/heart-shape-cakes" },
      { label: "25th Anniversary", href: "/cakes?category=Anniversary" },
      { label: "50th Anniversary", href: "/cakes?category=Anniversary" },
      { label: "Regular Birthday Cakes", href: "/cakes?category=Birthday" },
      { label: "First Birthday Cakes", href: "/cakes?category=Birthday" },
      { label: "Birthday Photo Cakes", href: "/category/photo-cakes" },
      { label: "Birthday Step Cakes", href: "/category/step-cakes" },
    ],
  },
  {
    title: "Cakes by Type",
    links: [
      { label: "Photo Cakes", href: "/category/photo-cakes" },
      { label: "Concept Cakes", href: "/category/concept-cakes" },
      { label: "Pinata Cakes", href: "/category/pinata-cakes" },
      { label: "Pull Up Cakes", href: "/category/pull-up-cakes" },
      { label: "Bomb Cakes", href: "/category/bomb-cakes" },
      { label: "Step Cakes", href: "/category/step-cakes" },
      { label: "Letter Cakes", href: "/category/letter-cakes" },
      { label: "Premium Cakes", href: "/cakes?sort=popular" },
    ],
  },
  {
    title: "Cakes by Relation",
    links: [
      { label: "Cake for Mom", href: "/category/cake-for-mom" },
      { label: "Cake for Father", href: "/category/cake-for-father" },
      { label: "Cake for Brother", href: "/category/cake-for-brother" },
      { label: "Cake for Sister", href: "/category/cake-for-sister" },
      { label: "Cake for Wife", href: "/category/cake-for-wife" },
      { label: "Cake for Husband", href: "/category/cake-for-husband" },
      { label: "Cake for Love", href: "/category/cake-for-love" },
      { label: "Cake for Kids", href: "/category/kids-cakes" },
    ],
  },
  {
    title: "Theme & Occasion Cakes",
    links: [
      { label: "Kids Cakes", href: "/category/kids-cakes" },
      { label: "Barbie Cakes", href: "/category/barbie-cakes" },
      { label: "Super Heroes Cakes", href: "/category/super-heroes-cakes" },
      { label: "Cartoon Cakes", href: "/category/cartoon-cakes" },
      { label: "Birthday", href: "/cakes?category=Birthday" },
      { label: "Anniversary", href: "/cakes?category=Anniversary" },
      { label: "Baby Shower", href: "/category/baby-shower-cakes" },
      { label: "Retirement Cakes", href: "/category/retirement-cakes" },
      { label: "Bon Voyage", href: "/category/bon-voyage-cakes" },
    ],
  },
];

export function SiteHeader() {
  const { items } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const hasMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDesktopMenu, setOpenDesktopMenu] = useState<"cakes" | null>(null);
  const [openMobileMenu, setOpenMobileMenu] = useState<"cakes" | null>(null);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-[0_1px_0_rgba(0,0,0,0.08)]">
      <div className="border-b border-[rgba(0,0,0,0.08)]">
        <div className="page-pad mx-auto flex max-w-[1720px] items-center gap-3 py-3 md:gap-4">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[rgba(0,0,0,0.12)] text-stone-800 md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Open menu"
          >
            <span className="sr-only">Menu</span>
            <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current" fill="none" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          </button>

          <Link href="/" className="shrink-0">
            <Image
              src="/brand/occasionkart-logo.png"
              alt="Occasionkart"
              width={260}
              height={60}
              priority
              className="h-10 w-auto md:h-14"
            />
          </Link>

          <div className="hidden flex-1 lg:block">
            <form
              action="/cakes"
              className="mx-auto flex max-w-[880px] items-center gap-3 rounded-[18px] border border-[rgba(0,0,0,0.12)] bg-[#fbfbfd] px-5 py-4 text-stone-400"
            >
              <span className="text-[1rem] font-medium text-stone-400">Search</span>
              <input
                type="text"
                name="q"
                placeholder="Search for cakes, flavors, occasions..."
                className="w-full bg-transparent text-[1rem] outline-none"
              />
            </form>
          </div>

          <div className="ml-auto flex items-center gap-2 md:gap-4">
            <Link
              href="/track-order"
              className="hidden items-center justify-center p-2 text-[var(--brand-maroon)] transition duration-200 hover:scale-110 md:flex"
              aria-label="Track Order"
            >
              <svg aria-hidden="true" viewBox="0 0 32 32" className="h-8 w-8">
                <path
                  fill="currentColor"
                  d="M16 2.5c-5.66 0-10.25 4.59-10.25 10.25 0 7.57 8.53 15.5 9.32 16.23a1.4 1.4 0 0 0 1.86 0c.79-.73 9.32-8.66 9.32-16.23C26.25 7.09 21.66 2.5 16 2.5Z"
                />
                <path
                  fill="#fff"
                  d="m16 8.15-5.25 2.72v5.95L16 19.55l5.25-2.73v-5.95L16 8.15Zm0 1.57 3.46 1.79L16 13.3l-3.46-1.79L16 9.72Zm-3.85 3 3.15 1.63v3.42l-3.15-1.63v-3.42Zm4.55 5.05v-3.42l3.15-1.63v3.42l-3.15 1.63Z"
                />
              </svg>
            </Link>

            <Link
              href="/account"
              className="hidden items-center justify-center p-2 text-[var(--brand-red)] transition duration-200 hover:scale-110 md:flex"
              aria-label="Login"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-7 w-7 fill-none stroke-current"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20a8 8 0 0 1 16 0" />
              </svg>
            </Link>

            <Link
              href="/cart"
              className="relative flex items-center justify-center p-2 text-[var(--brand-red)] transition duration-200 hover:scale-110"
              aria-label="Cart"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-7 w-7 fill-none stroke-current"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="20" r="1.5" fill="currentColor" stroke="none" />
                <circle cx="18" cy="20" r="1.5" fill="currentColor" stroke="none" />
                <path d="M3 4h2l2.2 10.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 7H7" />
              </svg>
              <span className="absolute -right-1 -top-1 flex h-7 min-w-7 items-center justify-center rounded-full bg-[#ef7f41] px-1.5 text-sm font-semibold text-white">
                {hasMounted ? cartCount : 0}
              </span>
            </Link>
          </div>
        </div>
      </div>

      <div className="hidden border-b border-[rgba(0,0,0,0.08)] md:block">
        <nav className="page-pad mx-auto flex max-w-[1720px] items-center gap-7 py-4 text-[1rem] font-semibold text-stone-900">
          <div className="relative">
            <button
              type="button"
              className="inline-flex items-center gap-2"
              onClick={() => setOpenDesktopMenu((prev) => (prev === "cakes" ? null : "cakes"))}
            >
              Cakes Mega Menu
              <span className="text-sm">v</span>
            </button>
            {openDesktopMenu === "cakes" ? (
              <div className="absolute left-0 top-full z-50 mt-3 w-[1260px] rounded-[18px] border border-[rgba(0,0,0,0.12)] bg-white p-6 shadow-[0_22px_40px_rgba(0,0,0,0.14)]">
                <div className="grid gap-6 md:grid-cols-5">
                  {cakesMegaColumns.map((column) => (
                    <MegaColumnBlock key={column.title} column={column} />
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <Link href="/category/gift-hampers">Gifts</Link>
          <Link href="/category/flowers">Flowers</Link>
          <Link href="/category/chocolate-combinations">Combos</Link>
          <Link href="/category/surprises">Surprises</Link>

          <Link href="/custom-orders">Custom Orders</Link>
          <Link href="/corporate-orders">Corporate</Link>
          <Link href="/offers" className="inline-flex items-center gap-2">
            Offers
            <span className="rounded-full bg-[#ef7f41] px-2 py-0.5 text-[0.72rem] font-bold text-white">
              SAVE 15%
            </span>
          </Link>
        </nav>
      </div>

      {mobileOpen ? (
        <div className="border-b border-[rgba(0,0,0,0.08)] bg-white md:hidden">
          <div className="sticky top-0 z-10 border-b border-[rgba(0,0,0,0.08)] bg-white px-4 py-3">
            <form
              action="/cakes"
              className="rounded-[14px] border border-[rgba(0,0,0,0.12)] bg-[#fbfbfd] px-4 py-3 text-[0.95rem] text-stone-400"
            >
              <input
                type="text"
                name="q"
                placeholder="Search cakes, flavors, gifts..."
                className="w-full bg-transparent outline-none"
              />
            </form>
          </div>

          <div className="page-pad mx-auto max-w-[1720px] py-4">
            <div className="space-y-2">
              <MobileAccordion
                label="Cakes Mega Menu"
                isOpen={openMobileMenu === "cakes"}
                onToggle={() => setOpenMobileMenu((prev) => (prev === "cakes" ? null : "cakes"))}
              >
                <div className="space-y-3">
                  {cakesMegaColumns.map((column) => (
                    <div key={column.title}>
                      <p className="px-2 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[#ef7f41]">
                        {column.title}
                      </p>
                      <div className="mt-1 space-y-1">
                        {column.links.slice(0, 6).map((item) => (
                          <Link
                            key={item.label}
                            href={item.href}
                            className="block rounded-[10px] px-2 py-2 text-[0.95rem] text-stone-700"
                            onClick={() => setMobileOpen(false)}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </MobileAccordion>

              <MobileLink href="/category/gift-hampers" label="Gifts" onClick={() => setMobileOpen(false)} />
              <MobileLink href="/category/flowers" label="Flowers" onClick={() => setMobileOpen(false)} />
              <MobileLink href="/category/chocolate-combinations" label="Combos" onClick={() => setMobileOpen(false)} />
              <MobileLink href="/category/surprises" label="Surprises" onClick={() => setMobileOpen(false)} />

              <MobileLink href="/custom-orders" label="Custom Orders" onClick={() => setMobileOpen(false)} />
              <MobileLink href="/corporate-orders" label="Corporate Orders" onClick={() => setMobileOpen(false)} />
              <MobileLink href="/track-order" label="Track Order" onClick={() => setMobileOpen(false)} />
              <MobileLink href="/testimonials" label="Reviews (4.9)" onClick={() => setMobileOpen(false)} />
              <MobileLink href="/contact" label="Contact Us" onClick={() => setMobileOpen(false)} />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function MegaColumnBlock({ column }: { column: MegaColumn }) {
  return (
    <div>
      <p className="text-[0.95rem] font-semibold text-[#ef7f41]">{column.title}</p>
      <ul className="mt-2 space-y-1.5 text-[0.92rem] text-stone-700">
        {column.links.map((item) => (
          <li key={item.label} className="border-b border-[rgba(0,0,0,0.06)] pb-1.5">
            <Link href={item.href}>{item.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MobileAccordion({
  label,
  isOpen,
  onToggle,
  children,
}: {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-[rgba(0,0,0,0.1)]">
      <button
        type="button"
        className="flex w-full items-center justify-between px-3 py-2.5 text-left font-semibold text-stone-900"
        onClick={onToggle}
      >
        {label}
        <span>{isOpen ? "-" : "+"}</span>
      </button>
      {isOpen ? <div className="border-t border-[rgba(0,0,0,0.08)] bg-[#fff9fb] p-2">{children}</div> : null}
    </div>
  );
}

function MobileLink({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block rounded-lg border border-[rgba(0,0,0,0.1)] px-3 py-2.5 font-semibold text-stone-900"
    >
      {label}
    </Link>
  );
}
