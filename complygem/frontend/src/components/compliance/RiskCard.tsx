import { RiskFactor, RiskLevel } from "@/types";
import { Badge, riskTone } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";

const TONE_PROGRESS: Record<RiskLevel, "success" | "warning" | "critical"> = {
  LOW: "success",
  MEDIUM: "warning",
  HIGH: "critical",
  CRITICAL: "critical",
};

export function RiskCard({ riskScore, riskLevel, riskFactors }: { riskScore: number; riskLevel: RiskLevel; riskFactors: RiskFactor[] }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-ink-500">Risk Score</p>
          <p className="text-2xl font-bold tabular-nums text-ink-900">{riskScore}/100</p>
        </div>
        <Badge tone={riskTone(riskLevel)} className="text-sm">{riskLevel} RISK</Badge>
      </div>
      <Progress value={riskScore} tone={TONE_PROGRESS[riskLevel]} className="mt-3" />

      <div className="mt-4 space-y-2.5">
        {riskFactors.length === 0 && <p className="text-sm text-ink-500">No risk factors identified.</p>}
        {riskFactors.map((f, i) => (
          <div key={i} className="flex items-center justify-between gap-3 text-sm">
            <span className="text-ink-700">{f.label}</span>
            <span className="shrink-0 font-mono font-medium text-critical-700">+{f.points}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
