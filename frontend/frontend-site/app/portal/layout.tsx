"use client";

import AuthGuard from "@/components/AuthGuard";
import DashboardHeader from "@/components/DashboardHeader";
import Sidebar, { type SidebarLink } from "@/components/Sidebar";

const PORTAL_LINKS: SidebarLink[] = [
  { href: "/portal", label: "Dashboard", icon: "dashboard" },
  { href: "/portal/businesses", label: "My Businesses", icon: "business" },
  { href: "/portal/consultations", label: "Consultations", icon: "consult" },
];

function PortalChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ivory flex flex-col md:pl-56">
      <Sidebar links={PORTAL_LINKS} title="UFB" subtitle="Client Portal" />

      <DashboardHeader brand="UFB" />

      <main className="flex-1 min-w-0 max-w-6xl w-full mx-auto">{children}</main>
    </div>
  );
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <PortalChrome>{children}</PortalChrome>
    </AuthGuard>
  );
}
