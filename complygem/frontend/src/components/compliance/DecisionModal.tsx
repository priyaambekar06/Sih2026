import { useState } from "react";
import { Dialog, DialogHeader, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Badge, riskTone } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Bid } from "@/types";
import { CheckCircle2, AlertTriangle, RotateCcw, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Outcome = "APPROVED" | "APPROVED_WITH_CONDITIONS" | "CLARIFICATION_REQUESTED" | "REJECTED";

const OPTIONS: { value: Outcome; label: string; icon: JSX.Element; tone: string }[] = [
  { value: "APPROVED", label: "Approve", icon: <CheckCircle2 size={16} />, tone: "border-success-500 text-success-700 data-[on=true]:bg-success-100" },
  { value: "APPROVED_WITH_CONDITIONS", label: "Approve with Conditions", icon: <AlertTriangle size={16} />, tone: "border-warning-500 text-warning-700 data-[on=true]:bg-warning-100" },
  { value: "CLARIFICATION_REQUESTED", label: "Request Clarification", icon: <RotateCcw size={16} />, tone: "border-teal-500 text-teal-600 data-[on=true]:bg-teal-100" },
  { value: "REJECTED", label: "Reject", icon: <XCircle size={16} />, tone: "border-critical-500 text-critical-700 data-[on=true]:bg-critical-100" },
];

export function DecisionModal({
  open, onClose, bid, onSubmit, submitting,
}: {
  open: boolean;
  onClose: () => void;
  bid: Bid;
  onSubmit: (outcome: Outcome, remarks: string) => void;
  submitting?: boolean;
}) {
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [remarks, setRemarks] = useState("");
  const [confirming, setConfirming] = useState(false);

  const criticalIssues = bid.mismatches.filter((m) => m.severity === "CRITICAL" || m.severity === "HIGH");

  function close() {
    setOutcome(null);
    setRemarks("");
    setConfirming(false);
    onClose();
  }

  return (
    <Dialog open={open} onClose={close} className="max-w-xl">
      <DialogHeader title="Procurement Officer Decision" onClose={close} />
      <DialogBody>
        {!confirming ? (
          <div className="space-y-5">
            <div className="flex items-center justify-between rounded-md border border-line bg-navy-100/30 px-4 py-3">
              <div>
                <p className="text-xs text-ink-500">Compliance Score</p>
                <p className="text-lg font-bold text-ink-900">{bid.complianceScore}/100</p>
              </div>
              <div>
                <p className="text-xs text-ink-500">Risk Level</p>
                <Badge tone={riskTone(bid.riskLevel)}>{bid.riskLevel}</Badge>
              </div>
              <div>
                <p className="text-xs text-ink-500">Recommendation</p>
                <p className="text-sm font-semibold text-ink-900">{bid.recommendation.replace(/_/g, " ")}</p>
              </div>
            </div>

            {criticalIssues.length > 0 && (
              <Alert tone="warning" title={`${criticalIssues.length} issue(s) require attention`}>
                {criticalIssues.map((m) => m.title).join(", ")}
              </Alert>
            )}

            <div>
              <p className="mb-2 text-sm font-medium text-ink-900">Decision</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setOutcome(opt.value)}
                    data-on={outcome === opt.value}
                    className={cn("flex items-center gap-2 rounded-md border bg-surface px-3 py-2.5 text-sm font-medium transition-colors", opt.tone)}
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-900">Officer Remarks (required)</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
                placeholder="Document the rationale for this decision..."
                className="w-full rounded-md border border-line px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>
        ) : (
          <Alert tone="info" title="AI analysis is advisory only">
            This system provides decision support based on document verification and rule-based scoring. The final procurement
            decision, and full responsibility for it, rests with you as the reviewing officer. Do you want to record this
            decision?
          </Alert>
        )}
      </DialogBody>
      <DialogFooter>
        <Button variant="outline" onClick={close}>Cancel</Button>
        {!confirming ? (
          <Button disabled={!outcome || !remarks.trim()} onClick={() => setConfirming(true)}>
            Continue
          </Button>
        ) : (
          <Button disabled={submitting} onClick={() => outcome && onSubmit(outcome, remarks)}>
            {submitting ? "Recording..." : "Confirm Decision"}
          </Button>
        )}
      </DialogFooter>
    </Dialog>
  );
}
