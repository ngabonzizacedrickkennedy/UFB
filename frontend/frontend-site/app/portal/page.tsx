"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { currentUser, type UserResponse } from "@/lib/api";

export default function PortalPage() {
  const [user, setUser] = useState<UserResponse | null>(null);

  useEffect(() => {
    setUser(currentUser());
  }, []);

  return (
    <section className="max-w-6xl mx-auto px-8 py-14">
      <p className="text-gold-dark uppercase tracking-[4px] text-xs mb-3 font-semibold">Your portal</p>
      <h1 className="font-display text-4xl text-navy mb-3">
        Welcome, <span className="text-gold-dark">{user?.fullName?.split(" ")[0] ?? "there"}</span>.
      </h1>
      <p className="text-mute max-w-xl mb-12">
        This is your space to describe your business and follow your consultations.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-line rounded-lg p-8">
          <h3 className="font-display text-xl text-navy mb-2">Your business profile</h3>
          <p className="text-mute text-sm mb-5">
            Tell us about your business — sector, stage, and what you need — so we can consult effectively.
          </p>
          <Link
            href="/portal/businesses"
            className="inline-block text-sm bg-gold text-navy font-semibold px-4 py-2.5 rounded-sm transition hover:bg-navy hover:text-gold"
          >
            Describe your business
          </Link>
        </div>

        <div className="bg-white border border-line rounded-lg p-8">
          <h3 className="font-display text-xl text-navy mb-2">Your consultations</h3>
          <p className="text-mute text-sm mb-5">
            Once you&rsquo;ve described your business, your consultation thread and advice will appear here.
          </p>
          <Link
            href="/portal/consultations"
            className="inline-block text-sm bg-gold text-navy font-semibold px-4 py-2.5 rounded-sm transition hover:bg-navy hover:text-gold"
          >
            View consultations
          </Link>
        </div>
      </div>

      <div className="mt-10 bg-white border border-line rounded-lg p-6">
        <h4 className="text-xs uppercase tracking-wide text-mute mb-3">Account</h4>
        <dl className="grid sm:grid-cols-3 gap-4 text-sm">
          <div>
            <dt className="text-mute">Name</dt>
            <dd className="text-char font-medium">{user?.fullName}</dd>
          </div>
          <div>
            <dt className="text-mute">Email</dt>
            <dd className="text-char font-medium">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-mute">Role</dt>
            <dd className="text-char font-medium">{user?.role}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
