"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { logout, uploadProfilePhoto, type ApiError } from "@/lib/api";
import { roleLabel, useUser } from "@/lib/useUser";
import { useToast } from "@/lib/toast";
import Avatar from "./Avatar";
import NotificationBell from "./NotificationBell";

export default function DashboardHeader({ brand }: { brand: string }) {
  const router = useRouter();
  const user = useUser();
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const signOut = () => {
    logout();
    toast.success("You've been logged out.");
    router.replace("/login");
  };

  const pickFile = () => fileInput.current?.click();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      await uploadProfilePhoto(file);
      toast.success("Profile photo updated.");
    } catch (err) {
      const msg = (err as ApiError).message ?? "Upload failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <header className="bg-navy text-white border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 h-[73px] flex items-center gap-4">
        <Link href="/" className="font-display text-2xl text-gold tracking-wide md:hidden">{brand}</Link>

        <div className="flex items-center gap-3 md:ml-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-sm border border-white/15 px-3 py-2 text-sm text-[#c7d0de] transition hover:border-gold/50 hover:text-gold"
          >
            <HomeIcon />
            <span className="hidden sm:inline">Home</span>
          </Link>

          <NotificationBell />

          <div className="hidden sm:block h-8 w-px bg-white/10" />

          <button
            type="button"
            onClick={pickFile}
            disabled={uploading}
            title="Change profile photo"
            className="relative rounded-full outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
          >
            <Avatar user={user} size={40} />
            <span className="absolute -bottom-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-gold text-navy ring-2 ring-navy">
              <CameraIcon />
            </span>
            {uploading && (
              <span className="absolute inset-0 grid place-items-center rounded-full bg-navy/60 text-[10px] font-semibold text-gold">
                …
              </span>
            )}
          </button>

          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-semibold text-white">{user?.fullName ?? "—"}</p>
            <p className="text-xs text-[#c7d0de]">{roleLabel(user?.role)}</p>
          </div>

          <button
            onClick={signOut}
            className="rounded-sm border border-gold/50 px-3 py-2 text-sm text-gold transition hover:bg-gold hover:text-navy md:hidden"
          >
            Sign out
          </button>

          <input ref={fileInput} type="file" accept="image/*" onChange={onFile} className="hidden" />
        </div>
      </div>

      {error && (
        <div className="max-w-6xl mx-auto px-6 sm:px-8 pb-2 text-right text-xs text-gold">{error}</div>
      )}
    </header>
  );
}

function HomeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9 21v-6h6v6" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8h3l1.5-2h7L17 8h3v11H4z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}
