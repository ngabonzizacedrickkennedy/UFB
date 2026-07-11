"use client";

import { useState } from "react";
import { SECTORS, STAGES, type ApiError, type BusinessCreateRequest } from "@/lib/api";

const SELECT_CLASS = "w-full border border-line bg-white rounded-sm px-4 py-3 text-char outline-none focus:border-gold";
const INPUT_CLASS = "w-full border border-line bg-white rounded-sm px-4 py-3 text-char outline-none focus:border-gold";
const LABEL_CLASS = "block text-xs uppercase tracking-wide text-mute mb-2";

export default function BusinessForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: BusinessCreateRequest;
  submitLabel: string;
  onSubmit: (body: BusinessCreateRequest) => Promise<void>;
}) {
  const [form, setForm] = useState<BusinessCreateRequest>(
    initial ?? { name: "", sector: "OTHER", stage: "STARTUP", description: "", needs: "" }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-line rounded-lg p-6 space-y-5">
      <div>
        <label className={LABEL_CLASS}>Business name</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={INPUT_CLASS}
        />
        {error?.fields?.name && <p className="text-xs text-red-700 mt-1">{error.fields.name}</p>}
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={LABEL_CLASS}>Sector</label>
          <select
            value={form.sector}
            onChange={(e) => setForm({ ...form, sector: e.target.value as BusinessCreateRequest["sector"] })}
            className={SELECT_CLASS}
          >
            {SECTORS.map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL_CLASS}>Stage</label>
          <select
            value={form.stage}
            onChange={(e) => setForm({ ...form, stage: e.target.value as BusinessCreateRequest["stage"] })}
            className={SELECT_CLASS}
          >
            {STAGES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={LABEL_CLASS}>What does your business do?</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={4}
          className={INPUT_CLASS}
        />
        {error?.fields?.description && <p className="text-xs text-red-700 mt-1">{error.fields.description}</p>}
      </div>

      <div>
        <label className={LABEL_CLASS}>What do you need help with?</label>
        <textarea
          value={form.needs ?? ""}
          onChange={(e) => setForm({ ...form, needs: e.target.value })}
          rows={3}
          className={INPUT_CLASS}
        />
      </div>

      {error && !error.fields && <p className="text-sm text-red-700">{error.message}</p>}

      <button
        onClick={submit}
        disabled={saving}
        className="text-sm bg-gold text-navy font-semibold px-5 py-2.5 rounded-sm transition hover:bg-navy hover:text-gold disabled:opacity-60"
      >
        {saving ? "Saving…" : submitLabel}
      </button>
    </div>
  );
}
