"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type AdminLink = {
  href: string;
  label: string;
  badgeCount?: number;
};

function isActiveLink(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar({
  links,
  userEmail,
}: {
  links: AdminLink[];
  userEmail?: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="h-fit rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-[#1f2731] p-4 text-white shadow-[0_16px_36px_rgba(0,0,0,0.2)]">
      <p className="px-2 text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-[#9cb0c3]">
        Admin Panel
      </p>

      <nav className="mt-3 space-y-1.5">
        {links.map((link) => {
          const active = isActiveLink(pathname, link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center justify-between rounded-[12px] px-3 py-2.5 text-[0.98rem] font-medium transition ${
                active
                  ? "bg-[#263443] text-white"
                  : "text-[#d9e5f0] hover:bg-[#273541] hover:text-white"
              }`}
            >
              <span>{link.label}</span>
              {typeof link.badgeCount === "number" && link.badgeCount > 0 ? (
                <span className="inline-flex min-w-[22px] items-center justify-center rounded-full bg-[#e14c4c] px-2 py-0.5 text-[0.78rem] font-semibold leading-none text-white">
                  {link.badgeCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-5 rounded-[12px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-3 py-2.5">
        <p className="text-[0.72rem] uppercase tracking-[0.16em] text-[#98adbf]">Signed in</p>
        <p className="mt-1 truncate text-[0.88rem] text-[#f2f6fb]">{userEmail ?? "Admin user"}</p>
      </div>
    </aside>
  );
}

