"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/ConsultationThread";
import { listMyBusinesses, type ApiError, type BusinessResponse } from "@/lib/api";

export default function MyBusinessesPage() {
  const [businesses, setBusinesses] = useState<BusinessResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setBusinesses(await listMyBusinesses());
    } catch (err) {
      setError((err as ApiError).message ?? "Failed to load businesses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <section className="max-w-6xl mx-auto px-8 py-12">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
        <div>
          <p className="text-gold-dark uppercase tracking-[4px] text-xs mb-3 font-semibold">Your businesses</p>
          <h1 className="font-display text-4xl text-navy">My Businesses</h1>
        </div>
        <Link
          href="/portal/businesses/new"
          className="text-sm bg-gold text-navy font-semibold px-5 py-2.5 rounded-sm transition hover:bg-navy hover:text-gold"
        >
          + New business
        </Link>
      </div>

      {error && <p className="text-sm text-red-700 mb-4">{error}</p>}

      {loading ? (
        <p className="text-mute text-sm">Loading…</p>
      ) : businesses.length === 0 ? (
        <div className="bg-white border border-line rounded-lg p-8 text-center">
          <p className="text-mute text-sm mb-4">You haven&rsquo;t described a business yet.</p>
          <Link href="/portal/businesses/new" className="text-gold-dark font-semibold text-sm">
            Describe your first business
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {businesses.map((b) => (
            <Link
              key={b.id}
              href={`/portal/businesses/${b.id}`}
              className="bg-white border border-line rounded-lg p-6 hover:border-gold transition block"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-display text-xl text-navy">{b.name}</h3>
                {b.consultation && <StatusBadge status={b.consultation.status} />}
              </div>
              <p className="text-xs uppercase tracking-wide text-mute mb-3">
                {b.sector.replace(/_/g, " ")} · {b.stage}
              </p>
              <p className="text-sm text-char line-clamp-2">{b.description}</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
