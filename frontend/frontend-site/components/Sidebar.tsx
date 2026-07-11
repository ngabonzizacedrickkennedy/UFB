"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type SidebarLink = { href: string; label: string };

export default function Sidebar({ links }: { links: SidebarLink[] }) {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-r border-line w-56 shrink-0 py-8 px-4 hidden md:block">
      <ul className="space-y-1">
        {links.map((link) => {
          const active = link.href === "/admin" || link.href === "/portal"
            ? pathname === link.href
            : pathname.startsWith(link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={
                  active
                    ? "block px-4 py-2.5 rounded-sm text-sm bg-gold/10 text-gold-dark font-semibold border-l-2 border-gold"
                    : "block px-4 py-2.5 rounded-sm text-sm text-char hover:bg-navy/5 border-l-2 border-transparent"
                }
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
