"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";

import { useCart } from "@/components/store/cart-context";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

type MenuEntry = {
  label: string;
  items?: Array<{
    label: string;
    category: string;
  }>;
  href?: string;
};

const mobileShortcutCards = [
  {
    label: "Classic",
    emoji: "Cake",
    href: "/cakes",
    image:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80",
  },
  {
    label: "Gourmet",
    emoji: "Dessert",
    href: "/category/jar-cakes",
    image:
      "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=900&q=80",
  },
  {
    label: "Designer",
    emoji: "Party",
    href: "/category/concept-cakes",
    image:
      "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=900&q=80",
  },
  {
    label: "Photo Cakes",
    emoji: "Photo",
    href: "/category/photo-cakes",
    image:
      "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&w=900&q=80",
  },
  {
    label: "Desserts",
    emoji: "Sweet",
    href: "/category/cup-cakes",
    image:
      "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=900&q=80",
  },
  {
    label: "Hampers",
    emoji: "Gift",
    href: "/category/photo-cakes",
    image:
      "https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=900&q=80",
  },
];

const toCategory = (category: string) => `/category/${slugify(category)}`;

const menuConfig: MenuEntry[] = [
  {
    label: "Flavors",
    items: [
      { label: "Pineapple", category: "Pineapple Cakes" },
      { label: "Butterscotch", category: "Butterscotch Cakes" },
      { label: "Chocolate", category: "Chocolate Truffle" },
      { label: "Blackforest", category: "Black Forest Cakes" },
      { label: "Chocolate Combinations", category: "Chocolate Combinations" },
      { label: "Fresh Fruit", category: "Fresh Fruit Cakes" },
      { label: "Red Velvet", category: "Red Velvet Cakes" },
      { label: "Tresleches", category: "Tres leches Cakes" },
      { label: "Tiramissu", category: "Tiramisu Cakes" },
      {
        label: "Imported/over seas",
        category: "Imported Flavor Cakes/Premium Flavors",
      },
      { label: "Desi Sweet flavor", category: "Desi Sweet Cakes" },
      { label: "Huzzlenut", category: "Exotic Chocolate" },
      { label: "Honey almond", category: "Dry Fruit cakes" },
    ],
  },
  {
    label: "By Occasion",
    items: [
      { label: "Birthday", category: "Birthday" },
      { label: "Anniversary", category: "Anniversary" },
      { label: "Wedding", category: "Wedding cakes" },
      { label: "Bride to be", category: "Engagement Cakes" },
      { label: "Retirement cake", category: "Corporate Anniversary Cakes" },
      { label: "Bon voyage", category: "Bon Voyage cakes" },
      { label: "Graduation", category: "Concept cakes" },
      { label: "Celebrations", category: "Photo cakes" },
      { label: "Corporate Success", category: "Corporate Cakes" },
    ],
  },
  {
    label: "By Relation",
    items: [
      { label: "Wife", category: "Cake for wife" },
      { label: "Husband", category: "Cake for husband" },
      { label: "Love", category: "Cake for love" },
      { label: "Sister", category: "Cake for sister" },
      { label: "Mom", category: "Cake for mom" },
      { label: "Dad", category: "Cake for father" },
      { label: "Brother", category: "Cake for brother" },
      { label: "Friend", category: "Photo cakes" },
      { label: "Grand parents", category: "Vanilla Cakes" },
    ],
  },
  {
    label: "Desserts",
    items: [
      { label: "Jar cakes", category: "Jar Cakes" },
      { label: "Cup cakes", category: "Cup Cakes" },
      { label: "Brownies", category: "Bento Cakes" },
      { label: "Cookies", category: "Pinata cakes" },
      { label: "Cheese cakes", category: "Pull UP Cakes" },
    ],
  },
  { label: "Gift hampers", href: toCategory("Photo cakes") },
  { label: "Customized cakes", href: toCategory("Custom Cakes") },
  { label: "Birthday cakes", href: "/cakes?category=Birthday" },
  { label: "Anniversary cakes", href: "/cakes?category=Anniversary" },
  {
    label: "Flowers",
    items: [
      { label: "Roses", category: "Heart Shape Cakes" },
      { label: "Orchids", category: "Butterfly theme cakes" },
      { label: "Basket arrangements", category: "Fresh Fruit Cakes" },
    ],
  },
  {
    label: "Combos",
    items: [
      { label: "Cakes and flowers", category: "Heart Shape Cakes" },
      { label: "Cake and chocolates", category: "Chocolate Combinations" },
      { label: "Cakes setup", category: "Concept cakes" },
    ],
  },
  {
    label: "Surprises",
    items: [
      { label: "Cake and mascot", category: "Cartoon cakes" },
      { label: "Cake and guitarist", category: "Photo cakes" },
      { label: "Cakes, mascot and guitarist", category: "Concept cakes" },
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
  const [openMobileMenu, setOpenMobileMenu] = useState<string | null>(null);
  const [openDesktopMenu, setOpenDesktopMenu] = useState<string | null>(null);

  const toggleMobileMenu = (label: string) => {
    setOpenMobileMenu((prev) => (prev === label ? null : label));
  };
  const toggleDesktopMenu = (label: string) => {
    setOpenDesktopMenu((prev) => (prev === label ? null : label));
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-[0_1px_0_rgba(0,0,0,0.08)]">
      <div className="border-b border-[rgba(0,0,0,0.08)]">
        <div className="page-pad mx-auto flex max-w-[1720px] items-center gap-4 py-3">
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
                placeholder="Search for cakes, flowers, gifts..."
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
              <svg
                aria-hidden="true"
                viewBox="0 0 32 32"
                className="h-8 w-8"
              >
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

            <button
              type="button"
              className="flex items-center justify-center rounded-lg border border-[rgba(0,0,0,0.12)] px-3 py-2 text-[0.95rem] font-semibold text-stone-900 md:hidden"
              onClick={() => setMobileOpen((prev) => !prev)}
            >
              Menu
            </button>
          </div>
        </div>
      </div>

      <div className="border-b border-[rgba(0,0,0,0.08)]">
        <nav className="page-pad mx-auto flex max-w-[1720px] items-center gap-7 overflow-x-auto py-4 text-[1rem] font-semibold text-stone-900 lg:overflow-visible">
          {menuConfig.map((menu) =>
            menu.items ? (
              <div key={menu.label} className="relative">
                <button
                  className="whitespace-nowrap text-stone-900"
                  type="button"
                  onClick={() => toggleDesktopMenu(menu.label)}
                >
                  {menu.label}
                </button>
                <div
                  className={`absolute left-0 top-full z-50 mt-3 w-auto min-w-[260px] max-w-[420px] rounded-[18px] border border-[rgba(0,0,0,0.12)] bg-white p-5 shadow-[0_22px_40px_rgba(0,0,0,0.14)] ${
                    openDesktopMenu === menu.label ? "block" : "hidden"
                  }`}
                >
                  <ul className="list-none space-y-2 pl-0 text-[0.98rem] leading-7 text-stone-700">
                    {menu.items.map((item) => (
                      <li key={item.label}>
                        <Link href={toCategory(item.category)}>{item.label}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <Link key={menu.label} href={menu.href ?? "/cakes"} className="whitespace-nowrap text-stone-900">
                {menu.label}
              </Link>
            ),
          )}
        </nav>
      </div>

      {mobileOpen ? (
        <div className="border-b border-[rgba(0,0,0,0.08)] bg-white md:hidden">
          <div className="page-pad mx-auto max-w-[1720px] py-4">
            <form
              action="/cakes"
              className="rounded-[18px] border border-[rgba(0,0,0,0.12)] bg-[#fbfbfd] px-4 py-3 text-[0.95rem] text-stone-400"
            >
              <input
                type="text"
                name="q"
                placeholder="Search for cakes, flowers, gifts..."
                className="w-full bg-transparent outline-none"
              />
            </form>

            <div className="mt-6 rounded-[22px] bg-[#fff3f6] px-4 py-6 text-center">
              <h2 className="text-[1.2rem] font-semibold text-[#ff3b3b]">Menu</h2>
              <p className="mt-1 text-[0.95rem] text-[#6c7396]">What will you wish for?</p>

              <div className="mt-5 grid grid-cols-2 gap-4">
                {mobileShortcutCards.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="group rounded-[18px] bg-white p-3 shadow-[0_10px_22px_rgba(0,0,0,0.12)]"
                  >
                    <div className="relative h-[110px] overflow-hidden rounded-[14px]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.label}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(77,37,28,0.08)_0%,rgba(77,37,28,0.4)_100%)]" />
                      <div className="absolute bottom-3 left-3 rounded-full bg-[rgba(255,255,255,0.88)] px-2.5 py-1 text-[0.82rem] font-semibold text-[var(--brand-brown)] backdrop-blur-sm">
                        {item.emoji}
                      </div>
                    </div>
                    <p className="mt-3 text-[0.85rem] font-semibold text-stone-900">
                      {item.label}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-5 space-y-2">
              {menuConfig.map((menu) => (
                <div key={menu.label} className="rounded-lg border border-[rgba(0,0,0,0.08)]">
                  {menu.items ? (
                    <>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between px-3 py-2 text-left font-semibold text-stone-900"
                        onClick={() => toggleMobileMenu(menu.label)}
                      >
                        {menu.label}
                        <span className="text-lg">{openMobileMenu === menu.label ? "-" : "+"}</span>
                      </button>
                      {openMobileMenu === menu.label ? (
                        <div className="border-t border-[rgba(0,0,0,0.08)] bg-[#fff9fb] px-3 py-3">
                          <ul className="list-none space-y-2 pl-0 text-[0.95rem] leading-7 text-stone-700">
                            {menu.items.map((item) => (
                              <li key={item.label}>
                                <Link href={toCategory(item.category)}>{item.label}</Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <Link href={menu.href ?? "/cakes"} className="block px-3 py-2 font-semibold text-stone-900">
                      {menu.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
