"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/lib/api";
import { roleLabel, useUser } from "@/lib/useUser";
import Avatar from "./Avatar";

export type SidebarIcon = "dashboard" | "business" | "consult" | "users" | "overview" | "home";
export type SidebarLink = { href: string; label: string; icon?: SidebarIcon };

export default function Sidebar({
  links,
  title,
  subtitle,
}: {
  links: SidebarLink[];
  title: string;
  subtitle: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useUser();

  const signOut = () => {
    logout();
    router.replace("/login");
  };

  return (
    <nav className="fixed inset-y-0 left-0 z-20 hidden w-56 flex-col bg-navy md:flex">
      <Link
        href="/"
        className="flex h-[73px] shrink-0 flex-col justify-center border-b border-white/10 px-6 transition hover:bg-white/5"
      >
        <span className="font-display text-xl leading-none tracking-wide text-gold">{title}</span>
        <span className="mt-1 text-[10px] uppercase tracking-[3px] text-[#8b97a8]">{subtitle}</span>
      </Link>

      <ul className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
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
                    ? "flex items-center gap-3 px-4 py-2.5 rounded-sm text-sm bg-gold/10 text-gold font-semibold border-l-2 border-gold"
                    : "flex items-center gap-3 px-4 py-2.5 rounded-sm text-sm text-[#c7d0de] hover:bg-white/5 border-l-2 border-transparent"
                }
              >
                <NavIcon name={link.icon} />
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="border-t border-white/10 p-4">
        <div className="mb-3 flex items-center gap-3">
          <Avatar user={user} size={38} />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold text-white">{user?.fullName ?? "—"}</p>
            <p className="truncate text-xs text-[#8b97a8]">{roleLabel(user?.role)}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="w-full rounded-sm border border-gold/50 px-4 py-2 text-sm text-gold transition hover:bg-gold hover:text-navy"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}

function NavIcon({ name }: { name?: SidebarIcon }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "shrink-0",
  };
  if (name === "business") {
    return (
      <svg {...common}>
        <path d="M3 21h18" />
        <path d="M5 21V7l7-4 7 4v14" />
        <path d="M9 21v-6h6v6" />
      </svg>
    );
  }
  if (name === "consult") {
    return (
      <svg {...common}>
        <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5Z" />
      </svg>
    );
  }
  if (name === "users") {
    return (
      <svg {...common}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }
  if (name === "overview") {
    return (
      <svg {...common}>
        <path d="M3 3v18h18" />
        <rect x="7" y="12" width="3" height="6" rx="0.5" />
        <rect x="12" y="8" width="3" height="10" rx="0.5" />
        <rect x="17" y="5" width="3" height="13" rx="0.5" />
      </svg>
    );
  }
  if (name === "home") {
    return (
      <svg {...common}>
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V21h14V9.5" />
        <path d="M9 21v-6h6v6" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}
