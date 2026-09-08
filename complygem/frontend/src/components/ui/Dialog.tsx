import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Dialog({ open, onClose, children, className }: { open: boolean; onClose: () => void; children: ReactNode; className?: string }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-950/50 backdrop-blur-[2px]" onClick={onClose} />
      <div className={cn("relative z-10 w-full max-w-lg rounded-lg border border-line bg-surface shadow-popover", className)}>
        {children}
      </div>
    </div>,
    document.body
  );
}

export function DialogHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between border-b border-line px-5 py-4">
      <h2 className="text-base font-semibold text-ink-900">{title}</h2>
      <button onClick={onClose} className="rounded-md p-1 text-ink-500 hover:bg-navy-100 hover:text-ink-900">
        <X size={18} />
      </button>
    </div>
  );
}

export function DialogBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("max-h-[70vh] overflow-y-auto px-5 py-4", className)}>{children}</div>;
}

export function DialogFooter({ children }: { children: ReactNode }) {
  return <div className="flex items-center justify-end gap-2 border-t border-line px-5 py-3">{children}</div>;
}
