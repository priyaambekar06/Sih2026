import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, Info, ShieldAlert, CheckCircle2 } from "lucide-react";

type Tone = "info" | "warning" | "critical" | "success";

const styles: Record<Tone, { wrap: string; icon: ReactNode }> = {
  info: { wrap: "border-navy-100 bg-navy-100/40 text-navy-800", icon: <Info size={17} /> },
  warning: { wrap: "border-warning-100 bg-warning-100 text-warning-700", icon: <AlertTriangle size={17} /> },
  critical: { wrap: "border-critical-100 bg-critical-100 text-critical-700", icon: <ShieldAlert size={17} /> },
  success: { wrap: "border-success-100 bg-success-100 text-success-700", icon: <CheckCircle2 size={17} /> },
};

export function Alert({ tone = "info", title, children }: { tone?: Tone; title?: string; children?: ReactNode }) {
  const s = styles[tone];
  return (
    <div className={cn("flex gap-3 rounded-md border px-4 py-3 text-sm", s.wrap)}>
      <div className="mt-0.5 shrink-0">{s.icon}</div>
      <div>
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="mt-0.5 leading-relaxed">{children}</div>}
      </div>
    </div>
  );
}
