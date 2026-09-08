import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  PlayCircle, RefreshCcw, Download, Gavel, ShieldCheck, ShieldAlert, Building2,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, riskTone, statusTone } from "@/components/ui/Badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Skeleton } from "@/components/ui/Skeleton";
import { Alert } from "@/components/ui/Alert";
import { useToast } from "@/components/ui/Toast";
import { CircularScore } from "@/components/compliance/CircularScore";
import { RiskCard } from "@/components/compliance/RiskCard";
import { ChecklistItem } from "@/components/compliance/ChecklistItem";
import { MismatchCard } from "@/components/compliance/MismatchCard";
import { CrossVerificationMap } from "@/components/compliance/CrossVerificationMap";
import { DecisionModal } from "@/components/compliance/DecisionModal";
import { UploadDropzone } from "@/components/documents/UploadDropzone";
import { PipelineStatus } from "@/components/documents/PipelineStatus";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { formatDate, formatDateTime } from "@/lib/utils";
import { Bid, BidDocument, Bidder, Tender } from "@/types";

export default function BidDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { push } = useToast();

  const [bid, setBid] = useState<Bid | null>(null);
  const [documents, setDocuments] = useState<BidDocument[]>([]);
  const [relationshipMap, setRelationshipMap] = useState<{ edges: any[] } | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [decisionOpen, setDecisionOpen] = useState(false);
  const [decisionSubmitting, setDecisionSubmitting] = useState(false);

  const load = useCallback(async () => {
    const res = await api.get<{ bid: Bid; documents: BidDocument[] }>(`/bids/${id}`);
    setBid(res.bid);
    setDocuments(res.documents);
    try {
      const comp = await api.get<{ relationshipMap: { edges: any[] } }>(`/compliance/${id}`);
      setRelationshipMap(comp.relationshipMap);
    } catch {}
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // Poll while documents are still processing so the pipeline animates live.
  useEffect(() => {
    const processing = documents.some((d) => ["UPLOADED", "OCR_PROCESSING"].includes(d.status));
    if (!processing) return;
    const t = setInterval(load, 2000);
    return () => clearInterval(t);
  }, [documents, load]);

  async function runVerification(isReverify: boolean) {
    setVerifying(true);
    try {
      await api.post(`/bids/${id}/${isReverify ? "reverify" : "verify"}`);
      push({ title: isReverify ? "Reverification complete" : "Verification complete", tone: "success" });
      await load();
    } catch (err: any) {
      push({ title: "Verification failed", description: err.message, tone: "critical" });
    } finally {
      setVerifying(false);
    }
  }

  async function submitDecision(outcome: string, remarks: string) {
    setDecisionSubmitting(true);
    try {
      await api.post(`/bids/${id}/decision`, { outcome, remarks });
      push({ title: "Decision recorded", tone: "success" });
      setDecisionOpen(false);
      await load();
    } catch (err: any) {
      push({ title: "Failed to record decision", description: err.message, tone: "critical" });
    } finally {
      setDecisionSubmitting(false);
    }
  }

  if (!bid) {
    return (
      <AppShell breadcrumb={[{ label: "Bids" }, { label: "..." }]}>
        <div className="space-y-4"><Skeleton className="h-24" /><Skeleton className="h-64" /></div>
      </AppShell>
    );
  }

  const bidder = typeof bid.bidderId === "object" ? (bid.bidderId as Bidder) : null;
  const tender = typeof bid.tenderId === "object" ? (bid.tenderId as Tender) : null;
  const canAct = user?.role === "PROCUREMENT_OFFICER" || user?.role === "ADMIN";
  const hasBeenVerified = bid.status !== "SUBMITTED";

  return (
    <AppShell breadcrumb={[{ label: "Bids" }, { label: bid.bidRefId }]}>
      <Card className="mb-5">
        <CardContent className="flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm text-ink-500">{bid.bidRefId}</span>
              <Badge tone={statusTone(bid.status)}>{bid.status.replace(/_/g, " ")}</Badge>
              {bid.scenarioTag && <Badge tone="teal">{bid.scenarioTag}</Badge>}
            </div>
            <div className="mt-1.5 flex items-center gap-2 text-lg font-bold text-ink-900">
              <Building2 size={18} className="text-navy-800" />
              {bidder?.companyName}
            </div>
            <p className="mt-0.5 text-sm text-ink-500">{tender?.name}</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-ink-500">Compliance</p>
              <p className="text-xl font-bold text-ink-900">{bid.complianceScore}<span className="text-sm text-ink-500">/100</span></p>
            </div>
            <div className="text-right">
              <p className="text-xs text-ink-500">Risk</p>
              <Badge tone={riskTone(bid.riskLevel)} className="text-sm">{bid.riskLevel}</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {canAct && !hasBeenVerified && (
                <Button size="sm" onClick={() => runVerification(false)} disabled={verifying}>
                  <PlayCircle size={15} /> {verifying ? "Verifying..." : "Start Verification"}
                </Button>
              )}
              {canAct && hasBeenVerified && (
                <Button size="sm" variant="outline" onClick={() => runVerification(true)} disabled={verifying}>
                  <RefreshCcw size={15} /> {verifying ? "Reverifying..." : "Reverify"}
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => navigate(`/reports/${bid._id}`)}>
                <Download size={15} /> Report
              </Button>
              {canAct && hasBeenVerified && !bid.decision && (
                <Button size="sm" variant="secondary" onClick={() => setDecisionOpen(true)}>
                  <Gavel size={15} /> Make Decision
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {bid.decision && (
        <Alert tone={bid.decision.outcome === "REJECTED" ? "critical" : "success"} title={`Decision: ${bid.decision.outcome.replace(/_/g, " ")}`} className="mb-5">
          "{bid.decision.remarks}" — {bid.decision.decidedBy?.name || "Officer"} on {formatDateTime(bid.decision.decidedAt)}
        </Alert>
      )}

      <Tabs defaultValue="overview">
        <TabsList className="mb-5 flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="checklist">Compliance Checklist</TabsTrigger>
          <TabsTrigger value="crossverify">Cross-Verification Map</TabsTrigger>
          <TabsTrigger value="mismatches">Mismatches ({bid.mismatches.length})</TabsTrigger>
          <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {!hasBeenVerified ? (
            <Alert tone="info" title="Verification not yet started">
              Upload the bidder's documents in the Documents tab, then click "Start Verification" to run OCR extraction,
              multi-source cross-checking and the compliance rule engine.
            </Alert>
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              <Card className="flex flex-col items-center justify-center py-8 lg:col-span-1">
                <CircularScore score={bid.complianceScore} recommendation={bid.recommendation} />
                <p className="mt-4 max-w-[220px] text-center text-xs text-ink-500">
                  Last verified {formatDateTime(bid.lastVerifiedAt)} · Next due {formatDate(bid.nextVerificationDue)}
                </p>
              </Card>
              <Card className="lg:col-span-1">
                <CardHeader><CardTitle>Risk Assessment</CardTitle></CardHeader>
                <CardContent><RiskCard riskScore={bid.riskScore} riskLevel={bid.riskLevel} riskFactors={bid.riskFactors} /></CardContent>
              </Card>
              <Card className="lg:col-span-1">
                <CardHeader><CardTitle>Blacklist Status</CardTitle></CardHeader>
                <CardContent>
                  {bidder?.isBlacklisted ? (
                    <div className="flex items-start gap-2.5 text-critical-700">
                      <ShieldAlert size={20} className="mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold">Match Found</p>
                        <p className="text-sm text-ink-700">{bidder.companyName} appears on a restricted vendor list. Officer review required.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2.5 text-success-700">
                      <ShieldCheck size={20} className="mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold">No Match Found</p>
                        <p className="text-sm text-ink-700">Checked against mock GeM blacklist, departmental blacklist and vendor restriction dataset.</p>
                        <p className="mt-1 text-xs text-ink-500">Last checked {formatDate(bid.lastVerifiedAt)}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="checklist">
          <Card>
            <CardHeader><CardTitle>Requirement Checklist</CardTitle></CardHeader>
            <CardContent className="space-y-2.5">
              {bid.requirementResults.length === 0 && <p className="text-sm text-ink-500">Run verification to generate the checklist.</p>}
              {bid.requirementResults.map((r) => <ChecklistItem key={r.key} result={r} />)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crossverify">
          <Card>
            <CardHeader><CardTitle>Multi-Source Relationship Map</CardTitle></CardHeader>
            <CardContent>
              {relationshipMap ? (
                <CrossVerificationMap edges={relationshipMap.edges} />
              ) : (
                <p className="text-sm text-ink-500">Run verification to build the cross-document relationship map.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mismatches">
          <div className="space-y-3">
            {bid.mismatches.length === 0 && (
              <Alert tone="success" title="No mismatches detected">Every submitted document is consistent with the verified source records.</Alert>
            )}
            {bid.mismatches.map((m, i) => <MismatchCard key={i} mismatch={m} />)}
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle>Uploaded Documents</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {documents.length === 0 && <p className="text-sm text-ink-500">No documents uploaded yet.</p>}
                {documents.map((d) => (
                  <div key={d._id} className="rounded-md border border-line p-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-ink-900">{d.docType === "MCA" ? "MCA21" : d.docType} — {d.fileName}</p>
                        <p className="text-xs text-ink-500">
                          {d.ocrConfidence !== undefined ? `OCR Confidence: ${d.ocrConfidence}%` : "Awaiting OCR"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge tone={statusTone(d.status)}>{d.status.replace(/_/g, " ")}</Badge>
                        <Button size="sm" variant="outline" onClick={() => navigate(`/documents/${d._id}`)}>Review</Button>
                      </div>
                    </div>
                    <div className="mt-3"><PipelineStatus doc={d} /></div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {canAct && (
              <Card>
                <CardHeader><CardTitle>Upload Bidder Documents</CardTitle></CardHeader>
                <CardContent>
                  <UploadDropzone bidId={bid._id} onUploaded={(doc) => setDocuments((prev) => [...prev, doc])} />
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <DecisionModal open={decisionOpen} onClose={() => setDecisionOpen(false)} bid={bid} onSubmit={submitDecision} submitting={decisionSubmitting} />
    </AppShell>
  );
}
