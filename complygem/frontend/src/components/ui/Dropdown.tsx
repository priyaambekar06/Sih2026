import { ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function Dropdown({ trigger, children, align = "right" }: { trigger: ReactNode; children: ReactNode; align?: "left" | "right" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen((o) => !o)}>{trigger}</div>
      {open && (
        <div
          className={cn(
            "absolute z-40 mt-2 min-w-[14rem] rounded-lg border border-line bg-surface py-1.5 shadow-popover",
            align === "right" ? "right-0" : "left-0"
          )}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn("flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm text-ink-700 hover:bg-navy-100 hover:text-ink-900", className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function DropdownLabel({ children }: { children: ReactNode }) {
  return <div className="px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink-300">{children}</div>;
}

export function DropdownSeparator() {
  return <div className="my-1.5 border-t border-line" />;
}
