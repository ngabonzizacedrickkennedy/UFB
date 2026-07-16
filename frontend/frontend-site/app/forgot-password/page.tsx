"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPassword, type ApiError } from "@/lib/api";
import { useToast } from "@/lib/toast";
import AuthBackdrop from "@/components/AuthBackdrop";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [sent, setSent] = useState(false);
  const toast = useToast();

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      await forgotPassword(email);
      setSent(true);
      toast.success("If that account exists, a reset link has been sent.");
    } catch (err) {
      const e = err as ApiError;
      setError(e);
      if (!e.fields) toast.error(e.message ?? "Could not send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      <section className="relative isolate overflow-hidden hidden lg:flex flex-col justify-between bg-navy text-white p-14">
        <AuthBackdrop />
        <Link href="/" className="font-display text-2xl text-gold tracking-wide">UFB</Link>
        <div>
          <p className="text-gold uppercase tracking-[5px] text-xs mb-6">Unified Finance Bridge</p>
          <h1 className="font-display text-4xl leading-tight mb-5">
            Forgot your <span className="text-gold">password</span>?
          </h1>
          <p className="text-[#c7d0de] font-light max-w-sm">
            Enter the email on your account and we&rsquo;ll send you a link to reset your password.
          </p>
        </div>
        <p className="font-display italic text-[#c7d0de] text-sm">Where Capital Meets Expertise</p>
      </section>

      <section className="flex items-center justify-center bg-ivory p-8">
        <div className="w-full max-w-md">
          <p className="text-gold-dark uppercase tracking-[4px] text-xs mb-3 font-semibold">Reset access</p>
          <h2 className="font-display text-3xl text-navy mb-8">Reset your password</h2>

          {sent ? (
            <div className="border border-line bg-white rounded-md p-6">
              <h3 className="font-display text-xl text-navy mb-2">Check your email.</h3>
              <p className="text-mute text-sm">
                If an account exists for {email}, we&rsquo;ve sent a link to reset your password.
              </p>
              <p className="text-sm text-mute text-center mt-6">
                <Link href="/login" className="text-gold-dark font-semibold">Back to sign in</Link>
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="block text-xs uppercase tracking-wide text-mute mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-line bg-white rounded-sm px-4 py-3 text-char outline-none focus:border-gold"
                />
                {error?.fields?.email && <p className="text-xs text-red-700 mt-1">{error.fields.email}</p>}
              </div>

              {error && !error.fields && <p className="text-sm text-red-700">{error.message}</p>}

              <button
                onClick={submit}
                disabled={loading}
                className="w-full bg-gold text-navy font-semibold tracking-wide py-3.5 rounded-sm transition hover:bg-navy hover:text-gold disabled:opacity-60"
              >
                {loading ? "Sending…" : "Send reset link"}
              </button>

              <p className="text-sm text-mute text-center">
                Remembered it?{" "}
                <Link href="/login" className="text-gold-dark font-semibold">Sign in</Link>
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
