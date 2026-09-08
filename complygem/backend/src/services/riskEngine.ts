import { IMismatch, IRequirementResult, IRiskFactor, RiskLevel } from "../models/Bid";
import { OCR_CONFIDENCE_THRESHOLD } from "./ruleEngine";

const SEVERITY_POINTS: Record<IMismatch["severity"], number> = {
  LOW: 3,
  MEDIUM: 10,
  HIGH: 20,
  CRITICAL: 35,
};

export function computeRisk(
  results: IRequirementResult[],
  mismatches: IMismatch[],
  isBlacklisted: boolean
): { riskScore: number; riskLevel: RiskLevel; riskFactors: IRiskFactor[] } {
  const factors: IRiskFactor[] = [];

  for (const m of mismatches) {
    const points = SEVERITY_POINTS[m.severity];
    factors.push({ label: m.title, points, reason: m.explanation });
  }

  for (const r of results) {
    if (r.confidence !== undefined && r.confidence < OCR_CONFIDENCE_THRESHOLD) {
      factors.push({
        label: `Low OCR confidence — ${r.label}`,
        points: 5,
        reason: `Extraction confidence ${r.confidence}% is below the ${OCR_CONFIDENCE_THRESHOLD}% review threshold.`,
      });
    }
    if (r.status === "FAIL" && r.required) {
      factors.push({
        label: `${r.label} requirement failed`,
        points: 8,
        reason: r.reason || `${r.label} could not be verified.`,
      });
    }
  }

  if (isBlacklisted) {
    factors.push({ label: "Blacklist match", points: 40, reason: "Bidder appears on a restricted vendor list." });
  }

  const riskScore = Math.min(100, factors.reduce((sum, f) => sum + f.points, 0));

  let riskLevel: RiskLevel = "LOW";
  if (riskScore > 75) riskLevel = "CRITICAL";
  else if (riskScore > 50) riskLevel = "HIGH";
  else if (riskScore > 25) riskLevel = "MEDIUM";

  return { riskScore, riskLevel, riskFactors: factors };
}
