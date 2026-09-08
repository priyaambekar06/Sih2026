import { cn } from "@/lib/utils";
import { ArrowDown } from "lucide-react";

interface Edge { from: string; to: string; status: "MATCH" | "MISMATCH" | "PENDING" }

function Node({ label }: { label: string }) {
  return (
    <div className="rounded-md border border-line bg-surface px-4 py-2 text-center text-sm font-semibold text-ink-900 shadow-card">
      {label}
    </div>
  );
}

function Connector({ status }: { status: Edge["status"] }) {
  const color = status === "MATCH" ? "text-success-500" : status === "MISMATCH" ? "text-critical-500" : "text-ink-300";
  return <ArrowDown size={18} className={cn("mx-auto", color)} />;
}

export function CrossVerificationMap({ edges }: { edges: Edge[] }) {
  const find = (from: string, to: string) => edges.find((e) => e.from === from && e.to === to)?.status || "PENDING";

  return (
    <div>
      <div className="flex flex-col items-center gap-1">
        <Node label="PAN" />
        <Connector status={find("PAN", "GST")} />
        <Node label="GST" />
        <div className="mt-1 grid w-full max-w-md grid-cols-2 gap-6">
          <div className="flex flex-col items-center gap-1">
            <Connector status={find("GST", "UDYAM")} />
            <Node label="UDYAM" />
            <div className="mt-1 grid w-full grid-cols-2 gap-3">
              <div className="flex flex-col items-center gap-1">
                <Connector status={find("UDYAM", "EPFO")} />
                <Node label="EPFO" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <Connector status={find("UDYAM", "ESIC")} />
                <Node label="ESIC" />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Connector status={find("GST", "MCA")} />
            <Node label="MCA" />
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-1.5 border-t border-line pt-4">
        {edges.map((e, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="text-ink-700">
              {e.from} <span className="text-ink-300">↔</span> {e.to}
            </span>
            <span className={cn("text-xs font-semibold", e.status === "MATCH" ? "text-success-700" : e.status === "MISMATCH" ? "text-critical-700" : "text-ink-500")}>
              {e.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
