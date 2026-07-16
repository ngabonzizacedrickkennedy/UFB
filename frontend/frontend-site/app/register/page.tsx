"use client";

import { useState } from "react";
import Link from "next/link";
import { checkEmailDeliverable, registerUser, resendVerification, type ApiError } from "@/lib/api";
import { useToast } from "@/lib/toast";
import AuthBackdrop from "@/components/AuthBackdrop";

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [emailStatus, setEmailStatus] = useState<"idle" | "checking" | "ok" | "invalid">("idle");
  const [submitted, setSubmitted] = useState(false);
  const [resent, setResent] = useState(false);
  const toast = useToast();

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const checkEmail = async () => {
    if (!form.email) {
      setEmailStatus("idle");
      return;
    }
    setEmailStatus("checking");
    try {
      const deliverable = await checkEmailDeliverable(form.email);
      setEmailStatus(deliverable ? "ok" : "invalid");
    } catch {
      setEmailStatus("idle");
    }
  };

  const submit = async () => {
    if (emailStatus === "invalid") return;
    setLoading(true);
    setError(null);
    try {
      await registerUser(form);
      setSubmitted(true);
      toast.success("Account created — check your email to verify.");
    } catch (err) {
      const e = err as ApiError;
      setError(e);
      if (!e.fields) toast.error(e.message ?? "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    try {
      await resendVerification(form.email);
      toast.success("A new link is on its way.");
    } finally {
      setResent(true);
    }
  };

  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      <section className="relative isolate overflow-hidden hidden lg:flex flex-col justify-between bg-navy text-white p-14">
        <AuthBackdrop />
        <Link href="/" className="font-display text-2xl text-gold tracking-wide">UFB</Link>
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
          {submitted ? (
            <div className="border border-line bg-white rounded-md p-6">
              <h3 className="font-display text-xl text-navy mb-2">Check your email.</h3>
              <p className="text-mute text-sm">
                We&rsquo;ve sent a verification link to {form.email}. Confirm it to activate your account before signing in.
              </p>
              {resent ? (
                <p className="text-sm text-mute mt-4">A new link is on its way.</p>
              ) : (
                <p className="text-sm text-mute mt-4">
                  Didn&rsquo;t get it?{" "}
                  <button type="button" onClick={resend} className="text-gold-dark font-semibold">Resend it</button>
                </p>
              )}
              <p className="text-sm text-mute text-center mt-6">
                <Link href="/login" className="text-gold-dark font-semibold">Back to sign in</Link>
              </p>
            </div>
          ) : (
            <>
              <h2 className="font-display text-3xl text-navy mb-8">Create your account</h2>

              <div className="space-y-5">
                  <Field label="Full name" value={form.fullName} onChange={update("fullName")}
                         error={error?.fields?.fullName} />
                  <Field label="Email" type="email" value={form.email} onChange={update("email")}
                         onBlur={checkEmail}
                         error={error?.fields?.email ?? (emailStatus === "invalid" ? "This email doesn't appear to exist." : undefined)}
                         hint={emailStatus === "checking" ? "Checking…" : undefined} />
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
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function Field({
  label, value, onChange, onBlur, type = "text", error, hint,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  type?: string;
  error?: string;
  hint?: string;
}) {
  const [show, setShow] = useState(false);
  const inputType = type === "password" ? (show ? "text" : "password") : type;

  return (
    <div>
      <label className="block text-xs uppercase tracking-wide text-mute mb-2">{label}</label>
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className="w-full border border-line bg-white rounded-sm px-4 py-3 text-char
                     outline-none focus:border-gold pr-11"
        />
        {type === "password" && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShow((s) => !s)}
            className="absolute inset-y-0 right-3 flex items-center text-mute hover:text-char"
          >
            {show ? <EyeOff /> : <Eye />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-700 mt-1">{error}</p>}
      {!error && hint && <p className="text-xs text-mute mt-1">{hint}</p>}
    </div>
  );
}

function Eye() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function EyeOff() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}
