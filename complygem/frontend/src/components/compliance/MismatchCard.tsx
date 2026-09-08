import { Mismatch } from "@/types";
import { cn } from "@/lib/utils";
import { AlertOctagon, AlertTriangle } from "lucide-react";

const SEVERITY_STYLE: Record<string, string> = {
  LOW: "border-warning-100 bg-warning-100/40",
  MEDIUM: "border-warning-100 bg-warning-100/60",
  HIGH: "border-critical-100 bg-critical-100/50",
  CRITICAL: "border-critical-500 bg-critical-100",
};

export function MismatchCard({ mismatch }: { mismatch: Mismatch }) {
  const critical = mismatch.severity === "CRITICAL";
  return (
    <div className={cn("rounded-md border p-4", SEVERITY_STYLE[mismatch.severity])}>
      <div className="flex items-start gap-2.5">
        {critical ? (
          <AlertOctagon size={18} className="mt-0.5 shrink-0 text-critical-700" />
        ) : (
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-warning-700" />
        )}
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-ink-900">{mismatch.title}</p>
            <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", critical ? "bg-critical-500 text-white" : "bg-warning-500 text-white")}>
              {mismatch.severity}
            </span>
          </div>
          <div className="mt-2 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
            <div>
              <p className="text-ink-500">Submitted</p>
              <p className="font-mono text-ink-900">{mismatch.submitted}</p>
            </div>
            <div>
              <p className="text-ink-500">Verification source</p>
              <p className="font-mono text-ink-900">{mismatch.verified}</p>
            </div>
          </div>
          <p className="mt-2 text-sm text-ink-700">{mismatch.explanation}</p>
          <p className="mt-1 text-sm font-medium text-ink-900">{mismatch.recommendation}</p>
        </div>
      </div>
    </div>
  );
}
