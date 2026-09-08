import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCcw, CalendarClock } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, riskTone } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { formatDate } from "@/lib/utils";

interface ReverificationRow {
  bidderId: string;
  companyName: string;
  lastVerifiedAt?: string;
  nextVerificationDue?: string;
  isOverdue: boolean;
  latestBidId?: string;
  latestBidRefId?: string;
  riskLevel: string;
}

export default function Reverification() {
  const [rows, setRows] = useState<ReverificationRow[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { push } = useToast();

  function load() {
    api.get<ReverificationRow[]>("/reverification").then(setRows);
  }
  useEffect(load, []);

  async function verifyNow(bidderId: string) {
    setBusyId(bidderId);
    try {
      await api.post(`/reverification/${bidderId}/verify-now`);
      push({ title: "Reverification complete", tone: "success" });
      load();
    } catch (err: any) {
      push({ title: "Reverification failed", description: err.message, tone: "critical" });
    } finally {
      setBusyId(null);
    }
  }

  async function schedule(bidderId: string) {
    const days = prompt("Schedule next verification in how many days from today?", "30");
    if (!days) return;
    const dueDate = new Date(Date.now() + Number(days) * 24 * 60 * 60 * 1000).toISOString();
    try {
      await api.post(`/reverification/${bidderId}/schedule`, { dueDate });
      push({ title: "Reverification scheduled", tone: "success" });
      load();
    } catch (err: any) {
      push({ title: "Failed to schedule", description: err.message, tone: "critical" });
    }
  }

  const canManage = user?.role === "PROCUREMENT_OFFICER" || user?.role === "ADMIN";

  return (
    <AppShell breadcrumb={[{ label: "Reverification" }]}>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-ink-900">Periodic Reverification</h1>
        <p className="mt-0.5 text-sm text-ink-500">Post-award monitoring — GST status changes, license expiry and registration lapses.</p>
      </div>

      {!rows ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <Card key={r.bidderId}>
              <div className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-ink-900">{r.companyName}</p>
                    {r.isOverdue && <Badge tone="critical">Overdue</Badge>}
                    <Badge tone={riskTone(r.riskLevel)}>{r.riskLevel} risk</Badge>
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-500">
                    <CalendarClock size={13} /> Last Verified: {formatDate(r.lastVerifiedAt)} · Next Due: {formatDate(r.nextVerificationDue)}
                  </p>
                </div>
                {canManage && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => schedule(r.bidderId)}>Schedule Reverification</Button>
                    <Button size="sm" onClick={() => verifyNow(r.bidderId)} disabled={busyId === r.bidderId}>
                      <RefreshCcw size={14} /> {busyId === r.bidderId ? "Verifying..." : "Verify Now"}
                    </Button>
                  </div>
                )}
                {r.latestBidId && (
                  <button onClick={() => navigate(`/bids/${r.latestBidId}`)} className="text-xs font-medium text-teal-600 hover:underline">
                    View {r.latestBidRefId}
                  </button>
                )}
              </div>
            </Card>
          ))}
          {rows.length === 0 && <p className="text-sm text-ink-500">No bidders on record yet.</p>}
        </div>
      )}
    </AppShell>
  );
}
