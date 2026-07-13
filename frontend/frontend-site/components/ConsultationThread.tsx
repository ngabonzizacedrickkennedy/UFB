"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const endRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      send();
    }
  };

  const labelFor = (m: ConsultationMessageResponse) => {
    if (m.authorEmail === viewerEmail) return "You";
    return m.authorRole === "ADMIN" ? "Advisor" : "Business owner";
  };

  return (
    <div className="rounded-lg border border-line bg-white">
      <div className="flex items-center justify-between border-b border-line px-6 py-4">
        <h3 className="font-display text-lg text-navy">Consultation thread</h3>
        <span className="text-xs text-mute">{messages.length} message{messages.length === 1 ? "" : "s"}</span>
      </div>

      <div className="max-h-[26rem] space-y-4 overflow-y-auto px-6 py-5">
        {loading ? (
          <p className="text-mute text-sm">Loading messages…</p>
        ) : messages.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-mute">No messages yet.</p>
            <p className="mt-1 text-xs text-mute">Start the conversation below.</p>
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.authorEmail === viewerEmail;
            const isAdmin = m.authorRole === "ADMIN";
            return (
              <div key={m.id} className={`flex items-end gap-2.5 ${mine ? "flex-row-reverse" : ""}`}>
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-semibold ${
                    isAdmin ? "bg-navy text-gold" : "bg-gold/20 text-gold-dark"
                  }`}
                >
                  {isAdmin ? "UF" : (labelFor(m)[0] ?? "?")}
                </span>
                <div className={`max-w-[78%] ${mine ? "text-right" : ""}`}>
                  <div className="mb-1 flex items-center gap-2 text-xs text-mute" style={mine ? { justifyContent: "flex-end" } : undefined}>
                    <span className="font-semibold uppercase tracking-wide">{labelFor(m)}</span>
                    <span>{new Date(m.createdAt).toLocaleString()}</span>
                  </div>
                  <div
                    className={`inline-block rounded-lg px-4 py-2.5 text-sm ${
                      mine ? "bg-gold/15 text-char" : "bg-navy/5 text-char"
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-left">{m.body}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t border-line px-6 py-4">
        {error && <p className="mb-3 text-sm text-red-700">{error}</p>}
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          rows={3}
          placeholder="Write a message…"
          className="w-full resize-none rounded-sm border border-line bg-white px-4 py-3 text-char outline-none focus:border-gold"
        />
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-mute">Press ⌘/Ctrl + Enter to send</span>
          <button
            onClick={send}
            disabled={sending || !draft.trim()}
            className="rounded-sm bg-gold px-5 py-2.5 text-sm font-semibold text-navy transition hover:bg-navy hover:text-gold disabled:opacity-60"
          >
            {sending ? "Sending…" : "Send message"}
          </button>
        </div>
      </div>
    </div>
  );
}
