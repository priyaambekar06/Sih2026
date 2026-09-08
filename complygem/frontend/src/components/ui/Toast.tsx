import { createContext, useCallback, useContext, useState, ReactNode } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastTone = "success" | "warning" | "critical" | "info";
interface ToastItem { id: number; title: string; description?: string; tone: ToastTone }

const ToastCtx = createContext<{ push: (t: Omit<ToastItem, "id">) => void } | null>(null);

const icon: Record<ToastTone, ReactNode> = {
  success: <CheckCircle2 size={18} className="text-success-500" />,
  warning: <AlertTriangle size={18} className="text-warning-500" />,
  critical: <XCircle size={18} className="text-critical-500" />,
  info: <Info size={18} className="text-teal-500" />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = useCallback((t: Omit<ToastItem, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 5000);
  }, []);

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex w-80 flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className="flex items-start gap-2.5 rounded-lg border border-line bg-surface p-3.5 shadow-popover">
            {icon[t.tone]}
            <div className="flex-1">
              <p className="text-sm font-semibold text-ink-900">{t.title}</p>
              {t.description && <p className="mt-0.5 text-xs text-ink-500">{t.description}</p>}
            </div>
            <button onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))} className="text-ink-300 hover:text-ink-700">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
