"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";
import { currentUser, logout } from "@/lib/api";

const ADMIN_LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/consultation", label: "Consultation" },
];

function AdminChrome({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const me = currentUser();

  const signOut = () => {
    logout();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <header className="bg-navy text-white">
        <div className="max-w-6xl mx-auto px-8 py-5 flex items-center justify-between">
          <Link href="/" className="font-display text-2xl text-gold tracking-wide">UFB · Admin</Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm text-[#c7d0de] hover:text-gold">Home</Link>
            <span className="text-sm text-[#c7d0de] hidden sm:inline">{me?.fullName}</span>
            <button
              onClick={signOut}
              className="text-sm border border-gold/50 text-gold px-4 py-2 rounded-sm transition hover:bg-gold hover:text-navy"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-6xl w-full mx-auto">
        <Sidebar links={ADMIN_LINKS} />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
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
