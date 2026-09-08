import { cn } from "@/lib/utils";

export function Progress({ value, className, tone = "teal" }: { value: number; className?: string; tone?: "teal" | "success" | "warning" | "critical" }) {
  const toneClass = {
    teal: "bg-teal-500",
    success: "bg-success-500",
    warning: "bg-warning-500",
    critical: "bg-critical-500",
  }[tone];
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-navy-100", className)}>
      <div className={cn("h-full rounded-full transition-all duration-500", toneClass)} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}
