import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "navy" | "teal" | "success" | "warning" | "critical" | "neutral";

const toneClasses: Record<Tone, string> = {
  navy: "bg-navy-100 text-navy-800 border-navy-100",
  teal: "bg-teal-100 text-teal-600 border-teal-100",
  success: "bg-success-100 text-success-700 border-success-100",
  warning: "bg-warning-100 text-warning-700 border-warning-100",
  critical: "bg-critical-100 text-critical-700 border-critical-100",
  neutral: "bg-ink-900/5 text-ink-700 border-transparent",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium leading-5",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}

export function riskTone(level?: string): Tone {
  switch (level) {
    case "LOW": return "success";
    case "MEDIUM": return "warning";
    case "HIGH": return "critical";
    case "CRITICAL": return "critical";
    default: return "neutral";
  }
}

export function statusTone(status?: string): Tone {
  switch (status) {
    case "PASS":
    case "VERIFIED":
    case "APPROVED":
    case "COMPLIANT":
      return "success";
    case "WARNING":
    case "MANUAL_REVIEW":
    case "CONDITIONALLY_COMPLIANT":
    case "APPROVED_WITH_CONDITIONS":
      return "warning";
    case "FAIL":
    case "MISMATCH":
    case "REJECTED":
    case "NON_COMPLIANT":
      return "critical";
    default:
      return "neutral";
  }
}
