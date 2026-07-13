"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BusinessCard from "@/components/BusinessCard";
import { currentUser, listMyBusinesses, type ApiError, type BusinessResponse, type UserResponse } from "@/lib/api";

export default function PortalPage() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [businesses, setBusinesses] = useState<BusinessResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setUser(currentUser());
    (async () => {
      try {
        setBusinesses(await listMyBusinesses());
      } catch (err) {
        setError((err as ApiError).message ?? "Failed to load your businesses");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const hasBusinesses = businesses.length > 0;

  return (
    <section className="max-w-6xl mx-auto px-8 py-14">
      <p className="text-gold-dark uppercase tracking-[4px] text-xs mb-3 font-semibold">Your portal</p>
      <h1 className="font-display text-4xl text-navy mb-3">
        Welcome, <span className="text-gold-dark">{user?.fullName?.split(" ")[0] ?? "there"}</span>.
      </h1>
      <p className="text-mute max-w-xl mb-12">
        This is your space to describe your business and follow your consultations.
      </p>

      {error && <p className="mb-6 text-sm text-red-700">{error}</p>}

      {loading ? (
        <p className="text-mute text-sm">Loading your dashboard…</p>
      ) : hasBusinesses ? (
        <>
          <div className="mb-5 flex items-end justify-between gap-4">
            <h2 className="font-display text-2xl text-navy">Your businesses</h2>
            <Link
              href="/portal/businesses/new"
              className="text-sm bg-gold text-navy font-semibold px-4 py-2.5 rounded-sm transition hover:bg-navy hover:text-gold"
            >
              + Describe another
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {businesses.map((b) => (
              <BusinessCard key={b.id} business={b} href={`/portal/businesses/${b.id}`} />
            ))}
          </div>
        </>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border border-line rounded-lg p-8">
            <h3 className="font-display text-xl text-navy mb-2">Describe your business</h3>
            <p className="text-mute text-sm mb-5">
              Tell us your sector, stage, and what you need — it appears here as a card and starts your consultation.
            </p>
            <Link
              href="/portal/businesses/new"
              className="inline-block text-sm bg-gold text-navy font-semibold px-4 py-2.5 rounded-sm transition hover:bg-navy hover:text-gold"
            >
              Describe your business
            </Link>
          </div>

          <div className="bg-white border border-line rounded-lg p-8">
            <h3 className="font-display text-xl text-navy mb-2">Your consultations</h3>
            <p className="text-mute text-sm mb-5">
              Once you&rsquo;ve described a business, your consultation thread and advice appear here.
            </p>
            <Link
              href="/portal/consultations"
              className="inline-block text-sm bg-gold text-navy font-semibold px-4 py-2.5 rounded-sm transition hover:bg-navy hover:text-gold"
            >
              View consultations
            </Link>
          </div>
        </div>
      )}

      <div className="mt-12 bg-white border border-line rounded-lg p-6">
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
