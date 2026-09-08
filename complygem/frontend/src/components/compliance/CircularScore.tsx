import { cn } from "@/lib/utils";

const RECOMMENDATION_LABEL: Record<string, string> = {
  COMPLIANT: "Compliant",
  CONDITIONALLY_COMPLIANT: "Conditionally Compliant",
  REQUIRES_REVIEW: "Requires Review",
  NON_COMPLIANT: "Non-Compliant",
};

function toneFor(score: number) {
  if (score >= 90) return { ring: "#1E9159", text: "text-success-700", chip: "bg-success-100 text-success-700" };
  if (score >= 75) return { ring: "#C1770B", text: "text-warning-700", chip: "bg-warning-100 text-warning-700" };
  if (score >= 50) return { ring: "#C1770B", text: "text-warning-700", chip: "bg-warning-100 text-warning-700" };
  return { ring: "#C13636", text: "text-critical-700", chip: "bg-critical-100 text-critical-700" };
}

export function CircularScore({ score, recommendation, size = 168 }: { score: number; recommendation: string; size?: number }) {
  const tone = toneFor(score);
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="#E7EEF5" strokeWidth={stroke} fill="none" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={tone.ring}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 700ms ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-4xl font-bold tabular-nums", tone.text)}>{score}</span>
          <span className="text-xs font-medium text-ink-500">/ 100</span>
        </div>
      </div>
      <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", tone.chip)}>
        {RECOMMENDATION_LABEL[recommendation] || recommendation}
      </span>
    </div>
  );
}
