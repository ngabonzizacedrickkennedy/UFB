"use client";

import AuthGuard from "@/components/AuthGuard";
import DashboardHeader from "@/components/DashboardHeader";
import Sidebar, { type SidebarLink } from "@/components/Sidebar";

const ADMIN_LINKS: SidebarLink[] = [
  { href: "/admin", label: "Overview", icon: "overview" },
  { href: "/admin/users", label: "Users", icon: "users" },
  { href: "/admin/consultation", label: "Consultation", icon: "consult" },
  { href: "/admin/home", label: "Home content", icon: "home" },
];

function AdminChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ivory flex flex-col md:pl-56">
      <Sidebar links={ADMIN_LINKS} title="UFB" subtitle="Admin Console" />

      <DashboardHeader brand="UFB · Admin" />

      <main className="flex-1 min-w-0 max-w-6xl w-full mx-auto">{children}</main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireAdmin>
      <AdminChrome>{children}</AdminChrome>
    </AuthGuard>
  );
}
