"use client";

import { use, useCallback, useEffect, useState } from "react";
import { currentUser, getAdminBusiness, updateConsultationStatus } from "@/lib/api";
import ConsultationThread, { StatusBadge } from "@/components/ConsultationThread";
import ConsultationStepper from "@/components/ConsultationStepper";
import { useToast } from "@/lib/toast";
import type { ApiError, BusinessResponse, ConsultationStatus } from "@/lib/api";

const STATUS_ORDER: ConsultationStatus[] = ["PENDING", "IN_REVIEW", "ADVISED"];
const STATUS_LABELS: Record<ConsultationStatus, string> = {
  PENDING: "Pending",
  IN_REVIEW: "In review",
  ADVISED: "Advised",
};

export default function AdminBusinessDetailPage(props: PageProps<"/admin/consultation/[id]">) {
  const { id } = use(props.params);
  const businessId = Number(id);
  const viewerEmail = currentUser()?.email ?? "";

  const [business, setBusiness] = useState<BusinessResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setBusiness(await getAdminBusiness(businessId));
    } catch (err) {
      setError((err as ApiError).message ?? "Failed to load business");
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    load();
  }, [load]);

  const advanceTo = async (status: ConsultationStatus) => {
    if (!business?.consultation) return;
    setUpdating(true);
    setError(null);
    try {
      await updateConsultationStatus(business.consultation.id, status);
      toast.success(`Marked ${STATUS_LABELS[status]}.`);
      await load();
    } catch (err) {
      const msg = (err as ApiError).message ?? "Failed to update status";
      setError(msg);
      toast.error(msg);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <section className="max-w-2xl mx-auto px-8 py-12"><p className="text-mute text-sm">Loading…</p></section>;
  }

  if (error || !business) {
    return <section className="max-w-2xl mx-auto px-8 py-12"><p className="text-sm text-red-700">{error ?? "Not found"}</p></section>;
  }

  const currentIndex = business.consultation ? STATUS_ORDER.indexOf(business.consultation.status) : -1;
  const nextStatuses = STATUS_ORDER.slice(currentIndex + 1);

  return (
    <section className="max-w-2xl mx-auto px-8 py-12 space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <p className="text-gold-dark uppercase tracking-[4px] text-xs font-semibold">Business</p>
          {business.consultation && <StatusBadge status={business.consultation.status} />}
        </div>
        <h1 className="font-display text-4xl text-navy mb-1">{business.name}</h1>
        <p className="text-sm text-mute mb-5">{business.ownerEmail}</p>

        {business.consultation && (
          <div className="mb-5">
            <ConsultationStepper status={business.consultation.status} />
          </div>
        )}

        {nextStatuses.length > 0 && (
          <div className="flex gap-2">
            {nextStatuses.map((s) => (
              <button
                key={s}
                onClick={() => advanceTo(s)}
                disabled={updating}
                className="text-sm border border-navy/20 text-navy px-4 py-2 rounded-sm transition hover:bg-navy hover:text-white disabled:opacity-60"
              >
                Mark {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border border-line rounded-lg p-6 space-y-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-mute mb-1">Sector · Stage</p>
          <p className="text-char">{business.sector.replace(/_/g, " ")} · {business.stage}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-mute mb-1">What they do</p>
          <p className="text-char whitespace-pre-wrap">{business.description}</p>
        </div>
        {business.needs && (
          <div>
            <p className="text-xs uppercase tracking-wide text-mute mb-1">What they need</p>
            <p className="text-char whitespace-pre-wrap">{business.needs}</p>
          </div>
        )}
      </div>

      <ConsultationThread businessId={businessId} viewerEmail={viewerEmail} />
    </section>
  );
}
