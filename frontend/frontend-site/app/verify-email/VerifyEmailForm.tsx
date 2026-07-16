"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { resendVerification, verifyEmail, type ApiError } from "@/lib/api";
import { useToast } from "@/lib/toast";
import AuthBackdrop from "@/components/AuthBackdrop";

export default function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlEmail = searchParams.get("email") ?? "";
  const urlToken = searchParams.get("token") ?? "";

  const [form, setForm] = useState({ email: urlEmail, verificationToken: urlToken });
  const [status, setStatus] = useState<"idle" | "verifying" | "done" | "error">(
    urlEmail && urlToken ? "verifying" : "idle"
  );
  const [error, setError] = useState<ApiError | null>(null);
  const [resent, setResent] = useState(false);
  const toast = useToast();

  const submit = async (email: string, verificationToken: string) => {
    setStatus("verifying");
    setError(null);
    try {
      const auth = await verifyEmail({ email, verificationToken });
      setStatus("done");
      toast.success("Email verified.");
      setTimeout(() => {
        router.push(auth.user.role === "ADMIN" ? "/admin" : "/portal");
      }, 1200);
    } catch (err) {
      const e = err as ApiError;
      setError(e);
      setStatus("error");
      toast.error(e.message ?? "Verification failed.");
    }
  };

  useEffect(() => {
    if (urlEmail && urlToken) {
      submit(urlEmail, urlToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resend = async () => {
    if (!form.email) return;
    try {
      await resendVerification(form.email);
      toast.success("If that email needs verification, a new link is on its way.");
    } finally {
      setResent(true);
    }
  };

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      <section className="relative isolate overflow-hidden hidden lg:flex flex-col justify-between bg-navy text-white p-14">
        <AuthBackdrop />
        <Link href="/" className="font-display text-2xl text-gold tracking-wide">UFB</Link>
        <div>
          <p className="text-gold uppercase tracking-[5px] text-xs mb-6">Unified Finance Bridge</p>
          <h1 className="font-display text-4xl leading-tight mb-5">
            Verify your <span className="text-gold">email</span>.
          </h1>
          <p className="text-[#c7d0de] font-light max-w-sm">
            Confirming your email proves the address is really yours before you can sign in.
          </p>
        </div>
        <p className="font-display italic text-[#c7d0de] text-sm">Where Capital Meets Expertise</p>
      </section>

      <section className="flex items-center justify-center bg-ivory p-8">
        <div className="w-full max-w-md">
          <p className="text-gold-dark uppercase tracking-[4px] text-xs mb-3 font-semibold">Verify email</p>

          {status === "verifying" && (
            <div className="border border-line bg-white rounded-md p-6">
              <h3 className="font-display text-xl text-navy mb-2">Verifying…</h3>
              <p className="text-mute text-sm">Hang on while we confirm your email.</p>
            </div>
          )}

          {status === "done" && (
            <div className="border border-line bg-white rounded-md p-6">
              <h3 className="font-display text-xl text-navy mb-2">Email verified.</h3>
              <p className="text-mute text-sm">Taking you to your dashboard…</p>
            </div>
          )}

          {(status === "idle" || status === "error") && (
            <>
              <h2 className="font-display text-3xl text-navy mb-8">Confirm your email</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-xs uppercase tracking-wide text-mute mb-2">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={update("email")}
                    className="w-full border border-line bg-white rounded-sm px-4 py-3 text-char outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wide text-mute mb-2">Verification token</label>
                  <input
                    type="text"
                    value={form.verificationToken}
                    onChange={update("verificationToken")}
                    placeholder="Paste the one-time token"
                    className="w-full border border-line bg-white rounded-sm px-4 py-3 text-char outline-none focus:border-gold font-mono text-sm"
                  />
                </div>

                {error && <p className="text-sm text-red-700">{error.message}</p>}

                <button
                  onClick={() => submit(form.email, form.verificationToken)}
                  className="w-full bg-gold text-navy font-semibold tracking-wide py-3.5 rounded-sm transition hover:bg-navy hover:text-gold"
                >
                  Verify email
                </button>

                {resent ? (
                  <p className="text-sm text-mute text-center">If that email needs verification, a new link is on its way.</p>
                ) : (
                  <p className="text-sm text-mute text-center">
                    Didn&rsquo;t get a link?{" "}
                    <button type="button" onClick={resend} className="text-gold-dark font-semibold">
                      Resend it
                    </button>
                  </p>
                )}

                <p className="text-sm text-mute text-center">
                  <Link href="/login" className="text-gold-dark font-semibold">Back to sign in</Link>
                </p>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
