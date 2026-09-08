import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FileText, Save, Check, X, RotateCw, AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { PipelineStatus } from "@/components/documents/PipelineStatus";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { BidDocument, Bid, Bidder, Tender } from "@/types";

const OCR_THRESHOLD = 75;

export default function DocumentViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { push } = useToast();

  const [doc, setDoc] = useState<BidDocument | null>(null);
  const [bid, setBid] = useState<Bid | null>(null);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await api.get<{ document: BidDocument; bid: Bid }>(`/review/${id}`);
    setDoc(res.document);
    setBid(res.bid);
  }
  useEffect(() => { load(); }, [id]);

  async function saveField(fieldKey: string) {
    const newValue = edits[fieldKey];
    if (newValue === undefined) return;
    setSaving(true);
    try {
      await api.patch(`/documents/${id}/correct-field`, { fieldKey, newValue });
      push({ title: "Field corrected", tone: "success" });
      await load();
    } catch (err: any) {
      push({ title: "Failed to save correction", description: err.message, tone: "critical" });
    } finally {
      setSaving(false);
    }
  }

  async function reviewAction(action: "APPROVE" | "REJECT" | "REPROCESS") {
    setSaving(true);
    try {
      await api.post(`/documents/${id}/review-action`, { action, remarks });
      push({ title: `Document ${action.toLowerCase()}d`, tone: action === "REJECT" ? "warning" : "success" });
      await load();
    } catch (err: any) {
      push({ title: "Action failed", description: err.message, tone: "critical" });
    } finally {
      setSaving(false);
    }
  }

  const canReview = user?.role === "REVIEWER" || user?.role === "PROCUREMENT_OFFICER" || user?.role === "ADMIN";

  if (!doc || !bid) {
    return <AppShell breadcrumb={[{ label: "Documents" }, { label: "..." }]}><Skeleton className="h-96" /></AppShell>;
  }

  const bidder = typeof bid.bidderId === "object" ? (bid.bidderId as Bidder) : null;
  const tender = typeof bid.tenderId === "object" ? (bid.tenderId as Tender) : null;

  return (
    <AppShell breadcrumb={[{ label: "Documents", to: "/documents" }, { label: doc.fileName }]}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-ink-900">{doc.docType === "MCA" ? "MCA21" : doc.docType} Document</h1>
            <Badge tone={statusTone(doc.status)}>{doc.status.replace(/_/g, " ")}</Badge>
          </div>
          <p className="mt-0.5 text-sm text-ink-500">
            {bidder?.companyName} · {bid.bidRefId} · {tender?.name}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate(`/bids/${bid._id}`)}>Back to Bid</Button>
      </div>

      <Card className="mb-5"><CardContent className="py-3"><PipelineStatus doc={doc} /></CardContent></Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Document Preview</CardTitle></CardHeader>
          <CardContent>
            <div className="flex aspect-[3/4] flex-col items-center justify-center rounded-md border border-dashed border-line bg-navy-100/20 text-center">
              <FileText size={40} className="mb-3 text-ink-300" />
              <p className="text-sm font-medium text-ink-700">{doc.fileName}</p>
              <p className="mt-1 max-w-[220px] text-xs text-ink-500">
                Demo preview — connect AWS S3 / Supabase Storage to render the original scanned document here.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Extracted Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {doc.ocrConfidence !== undefined && doc.ocrConfidence < OCR_THRESHOLD && (
              <Alert tone="warning" title={`OCR Confidence: ${doc.ocrConfidence}%`}>
                Manual Review Required — this extraction falls below the {OCR_THRESHOLD}% confidence threshold.
              </Alert>
            )}
            {doc.verificationResult && !doc.verificationResult.matched && (
              <Alert tone="critical" title="Verification mismatch">{doc.verificationResult.reason}</Alert>
            )}

            {doc.extractedFields.length === 0 && <p className="text-sm text-ink-500">Extraction pending...</p>}

            {doc.extractedFields.map((f) => {
              const low = f.confidence < OCR_THRESHOLD;
              return (
                <div key={f.key} className={cn("rounded-md border p-3", low ? "border-warning-500 bg-warning-100/40" : "border-line")}>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium capitalize text-ink-500">{f.key.replace(/([A-Z])/g, " $1")}</label>
                    <span className={cn("flex items-center gap-1 text-xs font-semibold", low ? "text-warning-700" : "text-success-700")}>
                      {low && <AlertTriangle size={12} />} Confidence {f.confidence}%
                    </span>
                  </div>
                  {canReview ? (
                    <div className="mt-1.5 flex gap-2">
                      <input
                        defaultValue={f.value}
                        onChange={(e) => setEdits((prev) => ({ ...prev, [f.key]: e.target.value }))}
                        className="h-9 flex-1 rounded-md border border-line px-2.5 font-mono text-sm focus:border-teal-500 focus:outline-none"
                      />
                      <Button size="sm" variant="outline" onClick={() => saveField(f.key)} disabled={saving || edits[f.key] === undefined}>
                        <Save size={14} />
                      </Button>
                    </div>
                  ) : (
                    <p className="mt-1 font-mono text-sm text-ink-900">{f.value}</p>
                  )}
                </div>
              );
            })}

            {canReview && (
              <div className="border-t border-line pt-4">
                <label className="mb-1.5 block text-sm font-medium text-ink-900">Review Remarks</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={2}
                  placeholder="Optional notes for approval, required for rejection..."
                  className="w-full rounded-md border border-line px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="success" onClick={() => reviewAction("APPROVE")} disabled={saving}>
                    <Check size={14} /> Approve Extraction
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => reviewAction("REJECT")} disabled={saving || !remarks.trim()}>
                    <X size={14} /> Reject Extraction
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => reviewAction("REPROCESS")} disabled={saving}>
                    <RotateCw size={14} /> Re-run OCR
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
