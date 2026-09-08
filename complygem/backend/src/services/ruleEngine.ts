import { ITenderRules } from "../models/Tender";
import { IRequirementResult, IMismatch } from "../models/Bid";

export const OCR_CONFIDENCE_THRESHOLD = 75;

interface RequirementCheckInput {
  key: keyof ITenderRules;
  label: string;
  rule: ITenderRules[keyof ITenderRules];
  present: boolean;
  submittedValue?: string;
  verifiedValue?: string;
  matched?: boolean;
  source?: string;
  confidence?: number;
  reason?: string;
}

/**
 * Deterministic rule-based scoring. The LLM/OCR layer only ever produces
 * *extracted values* and *confidence scores* — every PASS/WARNING/FAIL
 * decision and every point awarded here is computed by fixed, auditable
 * logic, never inferred by a model.
 */
export function evaluateRequirement(input: RequirementCheckInput): IRequirementResult {
  const { key, label, rule, present, submittedValue, verifiedValue, matched, source, confidence, reason } = input;
  const maxScore = rule.weight;

  if (!present) {
    return {
      key,
      label,
      required: rule.required,
      status: rule.required ? "FAIL" : "PENDING",
      scoreAwarded: 0,
      maxScore,
      reason: rule.required ? `${label} document not submitted.` : `${label} not applicable for this tender.`,
    };
  }

  if (matched === true) {
    return {
      key,
      label,
      required: rule.required,
      status: "PASS",
      scoreAwarded: maxScore,
      maxScore,
      submittedValue,
      verifiedValue,
      source,
      confidence,
    };
  }

  // Not matched — distinguish a hard fail from a reviewable warning based on reason text
  const isHardFail =
    reason?.toLowerCase().includes("not found") ||
    reason?.toLowerCase().includes("inactive") ||
    reason?.toLowerCase().includes("expired") ||
    reason?.toLowerCase().includes("differs materially") ||
    reason?.toLowerCase().includes("match found on");

  const status = isHardFail ? "FAIL" : "WARNING";
  const scoreAwarded = status === "WARNING" ? Math.round(maxScore * 0.6) : 0;

  return {
    key,
    label,
    required: rule.required,
    status,
    scoreAwarded,
    maxScore,
    submittedValue,
    verifiedValue,
    source,
    confidence,
    reason,
  };
}

export function buildMismatch(
  title: string,
  submitted: string,
  verified: string,
  severity: IMismatch["severity"],
  explanation: string,
  recommendation: string
): IMismatch {
  return { title, submitted, verified, severity, explanation, recommendation };
}

export function computeComplianceScore(results: IRequirementResult[]): number {
  const totalMax = results.reduce((sum, r) => sum + r.maxScore, 0);
  const totalAwarded = results.reduce((sum, r) => sum + r.scoreAwarded, 0);
  if (totalMax === 0) return 0;
  return Math.round((totalAwarded / totalMax) * 100);
}

export function deriveRecommendation(
  score: number,
  hasCriticalMismatch: boolean,
  hasFail: boolean
): "COMPLIANT" | "CONDITIONALLY_COMPLIANT" | "REQUIRES_REVIEW" | "NON_COMPLIANT" {
  if (hasCriticalMismatch) return "NON_COMPLIANT";
  if (score >= 90 && !hasFail) return "COMPLIANT";
  if (score >= 75) return "CONDITIONALLY_COMPLIANT";
  if (score >= 50) return "REQUIRES_REVIEW";
  return "NON_COMPLIANT";
}
