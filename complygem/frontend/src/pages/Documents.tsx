import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Eye } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import { BidDocument } from "@/types";

const DOC_TYPES = ["PAN", "GST", "UDYAM", "EPFO", "ESIC", "NSIC", "MCA", "OTHER"];
const STATUSES = ["UPLOADED", "OCR_PROCESSING", "OCR_DONE", "VERIFIED", "MISMATCH", "MANUAL_REVIEW", "FAILED"];

export default function Documents() {
  const [docs, setDocs] = useState<BidDocument[] | null>(null);
  const [search, setSearch] = useState("");
  const [docType, setDocType] = useState("");
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  function load() {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (docType) params.set("docType", docType);
    if (status) params.set("status", status);
    api.get<BidDocument[]>(`/documents?${params.toString()}`).then(setDocs);
  }
  useEffect(load, [search, docType, status]);

  return (
    <AppShell breadcrumb={[{ label: "Documents" }]}>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-ink-900">Documents</h1>
        <p className="mt-0.5 text-sm text-ink-500">Every document processed through the OCR and verification pipeline.</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by file name..."
            className="h-9.5 w-full rounded-md border border-line bg-surface pl-9 pr-3 text-sm focus:border-teal-500 focus:outline-none" />
        </div>
        <select value={docType} onChange={(e) => setDocType(e.target.value)} className="h-9.5 rounded-md border border-line bg-surface px-3 text-sm">
          <option value="">All types</option>
          {DOC_TYPES.map((t) => <option key={t} value={t}>{t === "MCA" ? "MCA21" : t}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-9.5 rounded-md border border-line bg-surface px-3 text-sm">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
        </select>
      </div>

      <Card>
        {!docs ? (
          <div className="space-y-3 p-5">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-line">
                <tr className="text-left text-xs font-semibold text-ink-500">
                  <th className="px-5 py-3">File</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">OCR Confidence</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Uploaded</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {docs.map((d) => (
                  <tr key={d._id} className="hover:bg-navy-100/40">
                    <td className="px-5 py-3 font-medium text-ink-900">{d.fileName}</td>
                    <td className="px-5 py-3 text-ink-700">{d.docType === "MCA" ? "MCA21" : d.docType}</td>
                    <td className="px-5 py-3 text-ink-700">{d.ocrConfidence !== undefined ? `${d.ocrConfidence}%` : "—"}</td>
                    <td className="px-5 py-3"><Badge tone={statusTone(d.status)}>{d.status.replace(/_/g, " ")}</Badge></td>
                    <td className="px-5 py-3 text-ink-500">{formatDateTime(d.createdAt)}</td>
                    <td className="px-5 py-3">
                      <button onClick={() => navigate(`/documents/${d._id}`)} className="rounded p-1.5 text-ink-500 hover:bg-navy-100 hover:text-navy-800">
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
                {docs.length === 0 && <tr><td colSpan={6} className="px-5 py-8 text-center text-ink-500">No documents found.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AppShell>
  );
}
