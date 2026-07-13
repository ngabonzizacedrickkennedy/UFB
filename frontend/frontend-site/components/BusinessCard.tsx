import Link from "next/link";
import { StatusBadge } from "@/components/ConsultationThread";
import type { BusinessResponse, Sector } from "@/lib/api";

const COVER_VARIANTS = [
  { from: "#03122E", to: "#0a2350" },
  { from: "#0a2350", to: "#223247" },
  { from: "#223247", to: "#03122E" },
  { from: "#03122E", to: "#A07C2C" },
  { from: "#0a2350", to: "#A07C2C" },
  { from: "#223247", to: "#0a2350" },
];

function coverTheme(sector: string) {
  let hash = 0;
  for (let i = 0; i < sector.length; i++) hash = (hash * 31 + sector.charCodeAt(i)) >>> 0;
  return COVER_VARIANTS[hash % COVER_VARIANTS.length];
}

export function BusinessCover({
  sector,
  stage,
  className = "",
}: {
  sector: Sector;
  stage: string;
  className?: string;
}) {
  const theme = coverTheme(sector);
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(120% 120% at 85% 0%, rgba(201,166,90,0.28), transparent 55%)" }}
      />
      <div className="pointer-events-none absolute -right-3 -top-2 text-gold/25">
        <SectorGlyph sector={sector} />
      </div>
      <div className="absolute bottom-3 left-5">
        <p className="text-[11px] font-semibold uppercase tracking-[3px] text-gold">
          {sector.replace(/_/g, " ")}
        </p>
        <span className="mt-1 inline-block rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-[#e7ddc6]">
          {stage}
        </span>
      </div>
    </div>
  );
}

export default function BusinessCard({
  business,
  href,
}: {
  business: BusinessResponse;
  href: string;
}) {
  const isNew = Date.now() - new Date(business.createdAt).getTime() < 7 * 24 * 3600 * 1000;
  const initial = business.name.trim().charAt(0).toUpperCase() || "?";

  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-lg border border-line bg-white transition hover:border-gold hover:shadow-[0_8px_30px_rgba(3,18,46,0.08)]"
    >
      <div className="relative">
        <BusinessCover sector={business.sector} stage={business.stage} className="h-28" />
        {isNew && (
          <span className="absolute right-3 top-3 rounded-full bg-gold px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-navy">
            New
          </span>
        )}
        <div className="absolute -bottom-6 left-5 grid h-12 w-12 place-items-center rounded-lg bg-white ring-1 ring-line">
          <span className="font-display text-xl text-gold-dark">{initial}</span>
        </div>
      </div>

      <div className="px-5 pb-5 pt-8">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl text-navy group-hover:text-gold-dark">{business.name}</h3>
          {business.consultation && <StatusBadge status={business.consultation.status} />}
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-char">{business.description}</p>
        {business.needs && (
          <p className="mt-3 line-clamp-1 text-xs text-mute">
            <span className="font-semibold text-gold-dark">Needs:</span> {business.needs}
          </p>
        )}
      </div>
    </Link>
  );
}

function SectorGlyph({ sector }: { sector: Sector }) {
  const p = {
    width: 108,
    height: 108,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (sector) {
    case "TECHNOLOGY":
      return (
        <svg {...p}>
          <rect x="4" y="4" width="16" height="12" rx="1" />
          <path d="M8 20h8M12 16v4" />
        </svg>
      );
    case "AGRICULTURE":
      return (
        <svg {...p}>
          <path d="M11 20c0-6 3-10 9-11-1 6-4 10-9 11Z" />
          <path d="M11 20c-4-1-7-4-7-9 4 1 6 3 7 6" />
        </svg>
      );
    case "FINANCE":
      return (
        <svg {...p}>
          <path d="M4 19h16M7 16V9M12 16V5M17 16v-4" />
        </svg>
      );
    case "HEALTHCARE":
      return (
        <svg {...p}>
          <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10Z" />
          <path d="M12 8v6M9 11h6" />
        </svg>
      );
    case "RETAIL":
      return (
        <svg {...p}>
          <path d="M6 7h12l-1 13H7L6 7Z" />
          <path d="M9 7a3 3 0 0 1 6 0" />
        </svg>
      );
    case "EDUCATION":
      return (
        <svg {...p}>
          <path d="M3 9l9-4 9 4-9 4-9-4Z" />
          <path d="M7 11v4c0 1 5 3 5 3s5-2 5-3v-4" />
        </svg>
      );
    case "HOSPITALITY":
      return (
        <svg {...p}>
          <path d="M5 8h11v4a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5V8Z" />
          <path d="M16 9h2a2 2 0 0 1 0 4h-2M6 20h12" />
        </svg>
      );
    case "CONSTRUCTION":
      return (
        <svg {...p}>
          <path d="M4 16a8 8 0 0 1 16 0" />
          <path d="M3 16h18v3H3zM11 8V4M11 4l4 2" />
        </svg>
      );
    case "TRANSPORTATION":
      return (
        <svg {...p}>
          <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" />
          <circle cx="7" cy="17" r="1.6" />
          <circle cx="17" cy="17" r="1.6" />
        </svg>
      );
    case "MANUFACTURING":
      return (
        <svg {...p}>
          <path d="M4 20V9l5 3V9l5 3V6l6 4v10H4Z" />
        </svg>
      );
    case "PROFESSIONAL_SERVICES":
      return (
        <svg {...p}>
          <rect x="4" y="8" width="16" height="11" rx="1" />
          <path d="M9 8V6a3 3 0 0 1 6 0v2" />
        </svg>
      );
    default:
      return (
        <svg {...p}>
          <path d="M4 21V6l7-3 7 3v15" />
          <path d="M9 21v-5h4v5" />
        </svg>
      );
  }
}
