"use client";

import { useEffect, useState } from "react";
import { getHome } from "@/lib/api";
import { normalizeHomeData } from "@/lib/home";

function isVideo(url: string): boolean {
  return /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url);
}

export default function AuthBackdrop() {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    getHome()
      .then((r) => setUrl(normalizeHomeData(r.data).authBackgroundUrl))
      .catch(() => setUrl(null));
  }, []);

  if (!url) return null;

  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
      {isVideo(url) ? (
        <video src={url} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${url})` }} />
      )}
      <div className="absolute inset-0 bg-navy/80" />
    </div>
  );
}
