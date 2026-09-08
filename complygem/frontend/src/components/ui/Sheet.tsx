import { ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export function Sheet({ open, onClose, children, side = "left" }: { open: boolean; onClose: () => void; children: ReactNode; side?: "left" | "right" }) {
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-navy-950/50" onClick={onClose} />
      <div
        className={cn(
          "absolute top-0 h-full w-72 bg-navy-900 shadow-popover transition-transform",
          side === "left" ? "left-0" : "right-0"
        )}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
