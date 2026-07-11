"use client";

import { useCallback, useEffect, useState } from "react";
import { listMessages, postMessage, type ApiError, type ConsultationMessageResponse } from "@/lib/api";

export function StatusBadge({ status }: { status: "PENDING" | "IN_REVIEW" | "ADVISED" }) {
  const styles: Record<string, string> = {
    PENDING: "bg-navy/10 text-navy",
    IN_REVIEW: "bg-gold/20 text-gold-dark",
    ADVISED: "bg-green-100 text-green-800",
  };
  const labels: Record<string, string> = {
    PENDING: "Pending",
    IN_REVIEW: "In review",
    ADVISED: "Advised",
  };
  return (
    <span className={`inline-block text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

export default function ConsultationThread({ businessId, viewerEmail }: { businessId: number; viewerEmail: string }) {
  const [messages, setMessages] = useState<ConsultationMessageResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setMessages(await listMessages(businessId));
    } catch (err) {
      setError((err as ApiError).message ?? "Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    load();
  }, [load]);

  const send = async () => {
    if (!draft.trim()) return;
    setSending(true);
    setError(null);
    try {
      const message = await postMessage(businessId, draft.trim());
      setMessages((prev) => [...prev, message]);
      setDraft("");
    } catch (err) {
      setError((err as ApiError).message ?? "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const labelFor = (m: ConsultationMessageResponse) => {
    if (m.authorEmail === viewerEmail) return "You";
    return m.authorRole === "ADMIN" ? "Admin" : "Business owner";
  };

  return (
    <div className="bg-white border border-line rounded-lg p-6">
      <h3 className="font-display text-lg text-navy mb-4">Consultation thread</h3>

      {loading ? (
        <p className="text-mute text-sm">Loading messages…</p>
      ) : messages.length === 0 ? (
        <p className="text-mute text-sm mb-4">No messages yet.</p>
      ) : (
        <div className="space-y-3 mb-5 max-h-96 overflow-y-auto">
          {messages.map((m) => {
            const mine = m.authorEmail === viewerEmail;
            return (
              <div key={m.id} className={`rounded-sm p-4 ${mine ? "bg-gold/10" : "bg-navy/5"}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs uppercase tracking-wide text-mute font-semibold">{labelFor(m)}</span>
                  <span className="text-xs text-mute">{new Date(m.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm text-char whitespace-pre-wrap">{m.body}</p>
              </div>
            );
          })}
        </div>
      )}

      {error && <p className="text-sm text-red-700 mb-3">{error}</p>}

      <div className="space-y-3">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          placeholder="Write a message…"
          className="w-full border border-line bg-white rounded-sm px-4 py-3 text-char outline-none focus:border-gold"
        />
        <button
          onClick={send}
          disabled={sending || !draft.trim()}
          className="text-sm bg-gold text-navy font-semibold px-5 py-2.5 rounded-sm transition hover:bg-navy hover:text-gold disabled:opacity-60"
        >
          {sending ? "Sending…" : "Send message"}
        </button>
      </div>
    </div>
  );
}
