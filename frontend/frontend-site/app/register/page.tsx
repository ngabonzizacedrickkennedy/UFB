"use client";

import { useState } from "react";
import { registerUser, type ApiError, type UserResponse } from "@/lib/api";

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [created, setCreated] = useState<UserResponse | null>(null);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    setLoading(true);
    setError(null);
    setCreated(null);
    try {
      setCreated(await registerUser(form));
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      <section className="hidden lg:flex flex-col justify-between bg-navy text-white p-14">
        <span className="font-display text-2xl text-gold tracking-wide">UFB</span>
        <div>
          <p className="text-gold uppercase tracking-[5px] text-xs mb-6">
            Unified Finance Bridge
          </p>
          <h1 className="font-display text-4xl leading-tight mb-5">
            Bridging finance to <span className="text-gold">growth</span>.
          </h1>
          <p className="text-[#c7d0de] font-light max-w-sm">
            Create your account to describe your business and access tailored consultation.
          </p>
        </div>
        <p className="font-display italic text-[#c7d0de] text-sm">
          Where Capital Meets Expertise
        </p>
      </section>

      <section className="flex items-center justify-center bg-ivory p-8">
        <div className="w-full max-w-md">
          <p className="text-gold-dark uppercase tracking-[4px] text-xs mb-3 font-semibold">
            Get started
          </p>
          <h2 className="font-display text-3xl text-navy mb-8">Create your account</h2>

          {created ? (
            <div className="border border-line bg-white rounded-md p-6">
              <h3 className="font-display text-xl text-navy mb-2">Welcome, {created.fullName}.</h3>
              <p className="text-mute text-sm">
                Account created as {created.email}. You can log in next.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <Field label="Full name" value={form.fullName} onChange={update("fullName")}
                     error={error?.fields?.fullName} />
              <Field label="Email" type="email" value={form.email} onChange={update("email")}
                     error={error?.fields?.email} />
              <Field label="Password" type="password" value={form.password} onChange={update("password")}
                     error={error?.fields?.password} />

              {error && !error.fields && (
                <p className="text-sm text-red-700">{error.message}</p>
              )}

              <button
                onClick={submit}
                disabled={loading}
                className="w-full bg-gold text-navy font-semibold tracking-wide py-3.5 rounded-sm
                           transition hover:bg-navy hover:text-gold disabled:opacity-60"
              >
                {loading ? "Creating…" : "Create account"}
              </button>

              <p className="text-sm text-mute text-center">
                Already have an account?{" "}
                <a href="/login" className="text-gold-dark font-semibold">Log in</a>
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function Field({
  label, value, onChange, type = "text", error,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wide text-mute mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full border border-line bg-white rounded-sm px-4 py-3 text-char
                   outline-none focus:border-gold"
      />
      {error && <p className="text-xs text-red-700 mt-1">{error}</p>}
    </div>
  );
}
