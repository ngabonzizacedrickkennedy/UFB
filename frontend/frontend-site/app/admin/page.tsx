"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  listUsers, listAllBusinesses,
  type ApiError, type BusinessResponse, type UserResponse,
} from "@/lib/api";
import { BarList, Donut, Panel, StatTile, TrendBars, type Bar } from "@/components/charts";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#5A6B82",
  IN_REVIEW: "#C9A65A",
  ADVISED: "#15803d",
};
const STAGE_COLORS: Record<string, string> = {
  STARTUP: "#C9A65A",
  ONGOING: "#0a2350",
  SCALING: "#A07C2C",
};

export default function AdminOverviewPage() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [businesses, setBusinesses] = useState<BusinessResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [u, page] = await Promise.all([listUsers(), listAllBusinesses()]);
        setUsers(u);
        setBusinesses(page.content);
      } catch (err) {
        setError((err as ApiError).message ?? "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const metrics = useMemo(() => {
    const activeUsers = users.filter((u) => u.enabled).length;
    const admins = users.filter((u) => u.role === "ADMIN").length;

    const withConsultation = businesses.filter((b) => b.consultation);
    const statusCount = { PENDING: 0, IN_REVIEW: 0, ADVISED: 0 };
    withConsultation.forEach((b) => {
      statusCount[b.consultation!.status] += 1;
    });

    const sectorMap = new Map<string, number>();
    businesses.forEach((b) => {
      const key = b.sector.replace(/_/g, " ");
      sectorMap.set(key, (sectorMap.get(key) ?? 0) + 1);
    });
    const sectorBars: Bar[] = [...sectorMap.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);

    const stageMap = { STARTUP: 0, ONGOING: 0, SCALING: 0 } as Record<string, number>;
    businesses.forEach((b) => {
      stageMap[b.stage] += 1;
    });

    const now = new Date();
    const months: Bar[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString("en-US", { month: "short" });
      const count = users.filter((u) => {
        const c = new Date(u.createdAt);
        return c.getFullYear() === d.getFullYear() && c.getMonth() === d.getMonth();
      }).length;
      months.push({ label, value: count });
    }

    return {
      activeUsers,
      admins,
      members: users.length - admins,
      openConsultations: statusCount.PENDING + statusCount.IN_REVIEW,
      advised: statusCount.ADVISED,
      statusSlices: [
        { label: "Pending", value: statusCount.PENDING, color: STATUS_COLORS.PENDING },
        { label: "In review", value: statusCount.IN_REVIEW, color: STATUS_COLORS.IN_REVIEW },
        { label: "Advised", value: statusCount.ADVISED, color: STATUS_COLORS.ADVISED },
      ],
      stageSlices: [
        { label: "Startup", value: stageMap.STARTUP, color: STAGE_COLORS.STARTUP },
        { label: "Ongoing", value: stageMap.ONGOING, color: STAGE_COLORS.ONGOING },
        { label: "Scaling", value: stageMap.SCALING, color: STAGE_COLORS.SCALING },
      ],
      sectorBars,
      months,
    };
  }, [users, businesses]);

  const recent = useMemo(
    () =>
      [...businesses]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    [businesses]
  );

  return (
    <section className="max-w-6xl mx-auto px-8 py-12">
      <div className="mb-8">
        <p className="text-gold-dark uppercase tracking-[4px] text-xs mb-3 font-semibold">Overview</p>
        <h1 className="font-display text-4xl text-navy">Analytics dashboard</h1>
        <p className="mt-2 text-mute">A live picture of your users, businesses, and consultations.</p>
      </div>

      {error && <p className="mb-6 text-sm text-red-700">{error}</p>}

      {loading ? (
        <p className="text-mute text-sm">Loading analytics…</p>
      ) : (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile label="Total users" value={users.length} hint={`${metrics.activeUsers} active`} accent />
            <StatTile label="Businesses" value={businesses.length} hint={`${metrics.sectorBars.length} sectors`} />
            <StatTile label="Open consultations" value={metrics.openConsultations} hint="Pending or in review" />
            <StatTile label="Advised" value={metrics.advised} hint="Completed consultations" />
          </div>

          <Panel
            title="New users (last 6 months)"
            action={<Link href="/admin/users" className="text-sm font-semibold text-gold-dark hover:text-navy">Manage users →</Link>}
          >
            <TrendBars data={metrics.months} />
          </Panel>

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Businesses by sector">
              <BarList data={metrics.sectorBars} />
            </Panel>
            <Panel title="Businesses by stage">
              <Donut data={metrics.stageSlices} />
            </Panel>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel
              title="Consultation status"
              action={<Link href="/admin/consultation" className="text-sm font-semibold text-gold-dark hover:text-navy">Review →</Link>}
            >
              <Donut data={metrics.statusSlices} />
            </Panel>

            <Panel title="Recent businesses">
              {recent.length === 0 ? (
                <p className="text-sm text-mute">No businesses yet.</p>
              ) : (
                <ul className="divide-y divide-line">
                  {recent.map((b) => (
                    <li key={b.id} className="flex items-center justify-between gap-3 py-2.5">
                      <Link href={`/admin/consultation/${b.id}`} className="min-w-0">
                        <p className="truncate text-sm font-medium text-char hover:text-gold-dark">{b.name}</p>
                        <p className="truncate text-xs text-mute">{b.sector.replace(/_/g, " ")} · {b.stage}</p>
                      </Link>
                      <span className="shrink-0 text-xs text-mute">
                        {new Date(b.createdAt).toLocaleDateString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>
        </div>
      )}
    </section>
  );
}
