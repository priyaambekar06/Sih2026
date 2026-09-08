import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Badge, riskTone } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/utils";
import { api } from "@/lib/api";

interface ReviewRow {
  documentId: string;
  bidId: string;
  bidRefId: string;
  docType: string;
  fileName: string;
  issue: string;
  confidence?: number;
  risk: string;
  age: string;
  status: string;
  assignedTo: string;
}

const FILTERS = [
  { key: "", label: "All" },
  { key: "high-risk", label: "High Risk" },
  { key: "low-confidence", label: "Low OCR Confidence" },
  { key: "mismatch", label: "Mismatch" },
  { key: "missing", label: "Missing Document" },
];

export default function Review() {
  const [items, setItems] = useState<ReviewRow[] | null>(null);
  const [filter, setFilter] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const params = filter ? `?filter=${filter}` : "";
    api.get<ReviewRow[]>(`/review${params}`).then(setItems);
  }, [filter]);

  return (
    <AppShell breadcrumb={[{ label: "Review Queue" }]}>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-ink-900">Manual Review Queue</h1>
        <p className="mt-0.5 text-sm text-ink-500">Documents flagged for low OCR confidence, mismatches or missing data.</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              filter === f.key ? "border-navy-900 bg-navy-900 text-white" : "border-line bg-surface text-ink-700 hover:bg-navy-100"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Card>
        {!items ? (
          <div className="space-y-3 p-5">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-line">
                <tr className="text-left text-xs font-semibold text-ink-500">
                  <th className="px-5 py-3">Bid</th>
                  <th className="px-5 py-3">Document</th>
                  <th className="px-5 py-3">Issue</th>
                  <th className="px-5 py-3">Confidence</th>
                  <th className="px-5 py-3">Risk</th>
                  <th className="px-5 py-3">Age</th>
                  <th className="px-5 py-3">Assigned To</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {items.map((it) => (
                  <tr key={it.documentId} className="cursor-pointer hover:bg-navy-100/40" onClick={() => navigate(`/review/${it.documentId}`)}>
                    <td className="px-5 py-3 font-mono text-xs text-ink-700">{it.bidRefId}</td>
                    <td className="px-5 py-3 text-ink-900">{it.docType === "MCA" ? "MCA21" : it.docType} — {it.fileName}</td>
                    <td className="px-5 py-3 text-ink-700">{it.issue}</td>
                    <td className="px-5 py-3">{it.confidence !== undefined ? `${it.confidence}%` : "—"}</td>
                    <td className="px-5 py-3"><Badge tone={riskTone(it.risk)}>{it.risk}</Badge></td>
                    <td className="px-5 py-3 text-ink-500">{timeAgo(it.age)}</td>
                    <td className="px-5 py-3 text-ink-500">{it.assignedTo}</td>
                    <td className="px-5 py-3 text-teal-600 underline">Review</td>
                  </tr>
                ))}
                {items.length === 0 && <tr><td colSpan={8} className="px-5 py-8 text-center text-ink-500">Nothing needs review right now.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AppShell>
  );
}
