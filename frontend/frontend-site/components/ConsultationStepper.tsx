import type { ConsultationStatus } from "@/lib/api";

const STEPS: { key: ConsultationStatus; label: string }[] = [
  { key: "PENDING", label: "Pending" },
  { key: "IN_REVIEW", label: "In review" },
  { key: "ADVISED", label: "Advised" },
];

export default function ConsultationStepper({ status }: { status: ConsultationStatus }) {
  const current = STEPS.findIndex((s) => s.key === status);

  return (
    <div className="flex items-center">
      {STEPS.map((step, i) => {
        const done = i <= current;
        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <span
                className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${
                  done ? "bg-gold text-navy" : "bg-navy/5 text-mute"
                }`}
              >
                {i < current ? "✓" : i + 1}
              </span>
              <span className={`mt-1.5 text-[11px] uppercase tracking-wide ${done ? "text-gold-dark font-semibold" : "text-mute"}`}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span className={`mx-2 mb-5 h-0.5 w-10 sm:w-16 ${i < current ? "bg-gold" : "bg-navy/10"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
