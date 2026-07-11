"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/ConsultationThread";
import {
  listAllBusinesses, SECTORS, STAGES,
  type ApiError, type BusinessResponse, type Sector, type Stage,
} from "@/lib/api";

const SELECT_CLASS = "border border-line bg-white rounded-sm px-3 py-2 text-sm text-char outline-none focus:border-gold";

export default function AdminConsultationPage() {
  const [businesses, setBusinesses] = useState<BusinessResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sector, setSector] = useState<Sector | "">("");
  const [stage, setStage] = useState<Stage | "">("");
  const [sort, setSort] = useState("createdAt");
  const [dir, setDir] = useState<"asc" | "desc">("desc");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await listAllBusinesses({
        sector: sector || undefined,
        stage: stage || undefined,
        sort,
        dir,
      });
      setBusinesses(page.content);
    } catch (err) {
      setError((err as ApiError).message ?? "Failed to load businesses");
    } finally {
      setLoading(false);
    }
  }, [sector, stage, sort, dir]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleSort = (field: string) => {
    if (sort === field) {
      setDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSort(field);
      setDir("asc");
    }
  };

  const sortIndicator = (field: string) => (sort === field ? (dir === "asc" ? " ▲" : " ▼") : "");

  return (
    <section className="max-w-6xl mx-auto px-8 py-12">
      <div className="mb-8">
        <p className="text-gold-dark uppercase tracking-[4px] text-xs mb-3 font-semibold">Consultation</p>
        <h1 className="font-display text-4xl text-navy">All businesses</h1>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <select value={sector} onChange={(e) => setSector(e.target.value as Sector | "")} className={SELECT_CLASS}>
          <option value="">All sectors</option>
          {SECTORS.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
        <select value={stage} onChange={(e) => setStage(e.target.value as Stage | "")} className={SELECT_CLASS}>
          <option value="">All stages</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-red-700 mb-4">{error}</p>}

      <div className="bg-white border border-line rounded-lg overflow-hidden">
        {loading ? (
          <p className="text-mute text-sm p-8 text-center">Loading…</p>
        ) : businesses.length === 0 ? (
          <p className="text-mute text-sm p-8 text-center">No businesses match these filters.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-navy/5 text-left text-mute uppercase text-xs tracking-wide">
                <th className="px-5 py-3 font-semibold cursor-pointer" onClick={() => toggleSort("name")}>
                  Name{sortIndicator("name")}
                </th>
                <th className="px-5 py-3 font-semibold cursor-pointer" onClick={() => toggleSort("sector")}>
                  Sector{sortIndicator("sector")}
                </th>
                <th className="px-5 py-3 font-semibold cursor-pointer" onClick={() => toggleSort("stage")}>
                  Stage{sortIndicator("stage")}
                </th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold cursor-pointer" onClick={() => toggleSort("createdAt")}>
                  Created{sortIndicator("createdAt")}
                </th>
              </tr>
            </thead>
            <tbody>
              {businesses.map((b) => (
                <tr key={b.id} className="border-t border-line">
                  <td className="px-5 py-3">
                    <Link href={`/admin/consultation/${b.id}`} className="text-char font-medium hover:text-gold-dark">
                      {b.name}
                    </Link>
                    <div className="text-xs text-mute">{b.ownerEmail}</div>
                  </td>
                  <td className="px-5 py-3 text-mute">{b.sector.replace(/_/g, " ")}</td>
                  <td className="px-5 py-3 text-mute">{b.stage}</td>
                  <td className="px-5 py-3">{b.consultation && <StatusBadge status={b.consultation.status} />}</td>
                  <td className="px-5 py-3 text-mute">{new Date(b.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
