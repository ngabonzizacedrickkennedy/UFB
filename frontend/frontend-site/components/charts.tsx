export type Slice = { label: string; value: number; color: string };
export type Bar = { label: string; value: number };

export function StatTile({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string;
  value: number | string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={
        accent
          ? "rounded-lg border border-gold/40 bg-gold/10 p-5"
          : "rounded-lg border border-line bg-white p-5"
      }
    >
      <p className="text-[11px] font-semibold uppercase tracking-[2px] text-mute">{label}</p>
      <p className="mt-2 font-display text-4xl leading-none text-navy">{value}</p>
      {hint && <p className="mt-2 text-xs text-mute">{hint}</p>}
    </div>
  );
}

export function Donut({
  data,
  size = 176,
  thickness = 22,
}: {
  data: Slice[];
  size?: number;
  thickness?: number;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-wrap items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {total === 0 ? (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="rgba(90,107,130,0.15)"
              strokeWidth={thickness}
            />
          ) : (
            data.map((d) => {
              const dash = (d.value / total) * circumference;
              const el = (
                <circle
                  key={d.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={d.color}
                  strokeWidth={thickness}
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={-offset}
                />
              );
              offset += dash;
              return el;
            })
          )}
        </g>
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-navy font-display"
          style={{ fontSize: size * 0.24 }}
        >
          {total}
        </text>
      </svg>

      <ul className="space-y-2 text-sm">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-sm" style={{ background: d.color }} />
            <span className="text-char">{d.label}</span>
            <span className="text-mute">· {d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BarList({ data }: { data: Bar[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  if (data.length === 0) {
    return <p className="text-sm text-mute">No data yet.</p>;
  }
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.label}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-char">{d.label}</span>
            <span className="text-mute">{d.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-navy/5">
            <div
              className="h-full rounded-full bg-gold"
              style={{ width: `${(d.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TrendBars({ data }: { data: Bar[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-3">
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center justify-end gap-2">
          <span className="text-xs font-semibold text-navy">{d.value}</span>
          <div
            className="w-full max-w-[2.75rem] rounded-t-sm bg-gradient-to-t from-navy to-navy-2"
            style={{ height: `${Math.max(4, Math.round((d.value / max) * 150))}px` }}
          />
          <span className="text-[10px] uppercase tracking-wide text-mute">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function Panel({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-line bg-white p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h3 className="font-display text-lg text-navy">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}
