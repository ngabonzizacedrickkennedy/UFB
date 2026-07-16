"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type ToastKind = "success" | "error" | "info";
type ToastEntry = { id: number; kind: ToastKind; message: string };
type ToastApi = {
  toast: (message: string, kind?: ToastKind) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);
let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastEntry[]>([]);

  const remove = useCallback((id: number) => {
    setItems((list) => list.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, kind: ToastKind = "info") => {
    const id = ++nextId;
    setItems((list) => [...list, { id, kind, message }]);
  }, []);

  const api: ToastApi = {
    toast,
    success: (m) => toast(m, "success"),
    error: (m) => toast(m, "error"),
    info: (m) => toast(m, "info"),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed bottom-5 left-5 z-[200] flex flex-col gap-3">
        {items.map((t) => (
          <ToastCard key={t.id} entry={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return { toast: () => {}, success: () => {}, error: () => {}, info: () => {} };
  }
  return ctx;
}

function ToastCard({ entry, onClose }: { entry: ToastEntry; onClose: () => void }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true));
    const timer = setTimeout(onClose, 4200);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [onClose]);

  return (
    <div
      role="status"
      className={`pointer-events-auto flex min-w-[260px] max-w-sm items-center gap-3 rounded-lg border border-white/10 bg-[#0b1b36] px-4 py-3 text-white shadow-xl transition-all duration-200 ${
        shown ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      <ToastIcon kind={entry.kind} />
      <span className="flex-1 text-sm">{entry.message}</span>
      <button onClick={onClose} aria-label="Dismiss" className="text-lg leading-none text-white/50 hover:text-white">
        ×
      </button>
    </div>
  );
}

function ToastIcon({ kind }: { kind: ToastKind }) {
  const color = kind === "success" ? "#22c55e" : kind === "error" ? "#ef4444" : "#C9A65A";
  return (
    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full" style={{ background: color }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0b1b36" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        {kind === "success" && <path d="M20 6 9 17l-5-5" />}
        {kind === "error" && (
          <>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </>
        )}
        {kind === "info" && (
          <>
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </>
        )}
      </svg>
    </span>
  );
}
