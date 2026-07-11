"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/ConsultationThread";
import { listMyBusinesses, type ApiError, type BusinessResponse } from "@/lib/api";

export default function MyConsultationsPage() {
  const [businesses, setBusinesses] = useState<BusinessResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setBusinesses(await listMyBusinesses());
    } catch (err) {
      setError((err as ApiError).message ?? "Failed to load consultations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <section className="max-w-6xl mx-auto px-8 py-12">
      <p className="text-gold-dark uppercase tracking-[4px] text-xs mb-3 font-semibold">Consultations</p>
      <h1 className="font-display text-4xl text-navy mb-8">Your consultations</h1>

      {error && <p className="text-sm text-red-700 mb-4">{error}</p>}

      {loading ? (
        <p className="text-mute text-sm">Loading…</p>
      ) : businesses.length === 0 ? (
        <div className="bg-white border border-line rounded-lg p-8 text-center">
          <p className="text-mute text-sm">No businesses yet — describe one to start a consultation.</p>
        </div>
      ) : (
        <div className="bg-white border border-line rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-navy/5 text-left text-mute uppercase text-xs tracking-wide">
                <th className="px-5 py-3 font-semibold">Business</th>
                <th className="px-5 py-3 font-semibold">Sector</th>
                <th className="px-5 py-3 font-semibold">Stage</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {businesses.map((b) => (
                <tr key={b.id} className="border-t border-line">
                  <td className="px-5 py-3">
                    <Link href={`/portal/businesses/${b.id}`} className="text-char font-medium hover:text-gold-dark">
                      {b.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-mute">{b.sector.replace(/_/g, " ")}</td>
                  <td className="px-5 py-3 text-mute">{b.stage}</td>
                  <td className="px-5 py-3">
                    {b.consultation && <StatusBadge status={b.consultation.status} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
