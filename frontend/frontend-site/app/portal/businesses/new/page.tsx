"use client";

import { useRouter } from "next/navigation";
import BusinessForm from "@/components/BusinessForm";
import { createBusiness, type BusinessCreateRequest } from "@/lib/api";

export default function NewBusinessPage() {
  const router = useRouter();

  const submit = async (body: BusinessCreateRequest) => {
    const created = await createBusiness(body);
    router.push(`/portal/businesses/${created.id}`);
  };

  return (
    <section className="max-w-2xl mx-auto px-8 py-12">
      <p className="text-gold-dark uppercase tracking-[4px] text-xs mb-3 font-semibold">New business</p>
      <h1 className="font-display text-4xl text-navy mb-8">Describe your business</h1>
      <BusinessForm submitLabel="Create business" onSubmit={submit} />
    </section>
  );
}
