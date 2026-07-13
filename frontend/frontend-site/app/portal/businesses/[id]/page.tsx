"use client";

import { use, useCallback, useEffect, useState } from "react";
import BusinessForm from "@/components/BusinessForm";
import ConsultationThread, { StatusBadge } from "@/components/ConsultationThread";
import ConsultationStepper from "@/components/ConsultationStepper";
import {
  currentUser, getMyBusiness, requestConsultation, updateBusiness,
  type ApiError, type BusinessCreateRequest, type BusinessResponse,
} from "@/lib/api";

export default function BusinessDetailPage(props: PageProps<"/portal/businesses/[id]">) {
  const { id } = use(props.params);
  const businessId = Number(id);
  const viewerEmail = currentUser()?.email ?? "";

  const [business, setBusiness] = useState<BusinessResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setBusiness(await getMyBusiness(businessId));
    } catch (err) {
      setError((err as ApiError).message ?? "Failed to load business");
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (body: BusinessCreateRequest) => {
    const updated = await updateBusiness(businessId, body);
    setBusiness(updated);
  };

  const askForConsultation = async () => {
    setRequesting(true);
    try {
      await requestConsultation(businessId);
      setRequested(true);
      await load();
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return <section className="max-w-2xl mx-auto px-8 py-12"><p className="text-mute text-sm">Loading…</p></section>;
  }

  if (error || !business) {
    return <section className="max-w-2xl mx-auto px-8 py-12"><p className="text-sm text-red-700">{error ?? "Not found"}</p></section>;
  }

  return (
    <section className="max-w-2xl mx-auto px-8 py-12 space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <p className="text-gold-dark uppercase tracking-[4px] text-xs font-semibold">Business</p>
          {business.consultation && <StatusBadge status={business.consultation.status} />}
        </div>
        <h1 className="font-display text-4xl text-navy mb-4">{business.name}</h1>

        {business.consultation && (
          <div className="mb-5">
            <ConsultationStepper status={business.consultation.status} />
          </div>
        )}

        <button
          onClick={askForConsultation}
          disabled={requesting}
          className="text-sm border border-navy/20 text-navy px-4 py-2.5 rounded-sm transition hover:bg-navy hover:text-white disabled:opacity-60"
        >
          {requesting ? "Requesting…" : "Request consultation"}
        </button>
        {requested && <p className="text-xs text-mute mt-2">Your consultation request has been sent.</p>}
      </div>

      <BusinessForm
        initial={{
          name: business.name,
          sector: business.sector,
          stage: business.stage,
          description: business.description,
          needs: business.needs ?? "",
        }}
        submitLabel="Save changes"
        onSubmit={save}
      />

      <ConsultationThread businessId={businessId} viewerEmail={viewerEmail} />
    </section>
  );
}
