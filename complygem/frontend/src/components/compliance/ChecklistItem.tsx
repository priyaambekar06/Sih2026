import { useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Clock, ChevronDown } from "lucide-react";
import { RequirementResult } from "@/types";
import { cn } from "@/lib/utils";

const ICONS: Record<string, JSX.Element> = {
  PASS: <CheckCircle2 size={18} className="text-success-500" />,
  WARNING: <AlertTriangle size={18} className="text-warning-500" />,
  FAIL: <XCircle size={18} className="text-critical-500" />,
  PENDING: <Clock size={18} className="text-ink-300" />,
};

export function ChecklistItem({ result }: { result: RequirementResult }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-md border border-line">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left">
        <div className="flex items-center gap-3">
          {ICONS[result.status]}
          <div>
            <p className="text-sm font-medium text-ink-900">{result.label}</p>
            <p className="text-xs text-ink-500">{result.reason || (result.status === "PASS" ? "Verified" : "")}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm tabular-nums text-ink-700">
            {result.scoreAwarded}/{result.maxScore}
          </span>
          <ChevronDown size={16} className={cn("text-ink-300 transition-transform", open && "rotate-180")} />
        </div>
      </button>
      {open && (
        <div className="grid grid-cols-2 gap-3 border-t border-line bg-navy-100/30 px-4 py-3 text-xs sm:grid-cols-4">
          <div>
            <p className="text-ink-500">Submitted Value</p>
            <p className="mt-0.5 font-mono text-ink-900">{result.submittedValue || "—"}</p>
          </div>
          <div>
            <p className="text-ink-500">Verified Value</p>
            <p className="mt-0.5 font-mono text-ink-900">{result.verifiedValue || "—"}</p>
          </div>
          <div>
            <p className="text-ink-500">Source</p>
            <p className="mt-0.5 text-ink-900">{result.source || "—"}</p>
          </div>
          <div>
            <p className="text-ink-500">OCR Confidence</p>
            <p className="mt-0.5 text-ink-900">{result.confidence !== undefined ? `${result.confidence}%` : "—"}</p>
          </div>
          {result.reason && (
            <div className="col-span-2 sm:col-span-4">
              <p className="text-ink-500">Reason</p>
              <p className="mt-0.5 text-ink-900">{result.reason}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
