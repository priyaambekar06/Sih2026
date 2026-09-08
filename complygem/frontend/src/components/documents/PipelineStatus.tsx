import { Check, Loader2, Circle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { BidDocument } from "@/types";

const STAGES = ["Uploaded", "OCR Processing", "Data Extraction", "Validation", "Cross Verification", "Compliance Evaluation"];

function stageIndex(doc: BidDocument): number {
  switch (doc.status) {
    case "UPLOADED": return 0;
    case "OCR_PROCESSING": return 1;
    case "OCR_DONE": return 3;
    case "MANUAL_REVIEW": return 3;
    case "VERIFIED": return 5;
    case "MISMATCH": return 5;
    case "FAILED": return -1;
    default: return 0;
  }
}

export function PipelineStatus({ doc }: { doc: BidDocument }) {
  const current = stageIndex(doc);
  const failed = current === -1;

  return (
    <div className="flex items-center gap-1 overflow-x-auto py-1">
      {STAGES.map((label, i) => {
        const done = !failed && i < current;
        const active = !failed && i === current;
        const err = failed && i === 0;
        return (
          <div key={label} className="flex items-center gap-1">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px]",
                  done && "border-success-500 bg-success-500 text-white",
                  active && "border-teal-500 bg-teal-500 text-white",
                  err && "border-critical-500 bg-critical-500 text-white",
                  !done && !active && !err && "border-line bg-surface text-ink-300"
                )}
              >
                {done ? <Check size={13} /> : active ? <Loader2 size={12} className="animate-spin" /> : err ? <AlertTriangle size={12} /> : <Circle size={8} />}
              </div>
              <span className="whitespace-nowrap text-[10px] text-ink-500">{label}</span>
            </div>
            {i < STAGES.length - 1 && <div className={cn("h-px w-6", done ? "bg-success-500" : "bg-line")} />}
          </div>
        );
      })}
    </div>
  );
}
