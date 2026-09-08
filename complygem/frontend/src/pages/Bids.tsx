import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, riskTone, statusTone } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Dialog, DialogHeader, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { formatDate } from "@/lib/utils";
import { Bid, Bidder, Tender } from "@/types";

export default function Bids() {
  const [bids, setBids] = useState<Bid[] | null>(null);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [bidders, setBidders] = useState<Bidder[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ tenderId: "", bidderId: "" });
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { push } = useToast();

  function load() {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (riskFilter) params.set("risk", riskFilter);
    api.get<Bid[]>(`/bids?${params.toString()}`).then(setBids);
  }
  useEffect(load, [statusFilter, riskFilter]);
  useEffect(() => {
    api.get<Tender[]>("/tenders").then(setTenders);
    api.get<Bidder[]>("/bidders").then(setBidders);
  }, []);

  async function handleCreate() {
    setCreating(true);
    try {
      const bid = await api.post<Bid>("/bids", form);
      push({ title: "Bid created", tone: "success" });
      setCreateOpen(false);
      navigate(`/bids/${bid._id}`);
    } catch (err: any) {
      push({ title: "Failed to create bid", description: err.message, tone: "critical" });
    } finally {
      setCreating(false);
    }
  }

  const canManage = user?.role === "PROCUREMENT_OFFICER" || user?.role === "ADMIN";

  return (
    <AppShell breadcrumb={[{ label: "Bids" }]}>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink-900">Bids</h1>
          <p className="mt-0.5 text-sm text-ink-500">All bids submitted across active tenders.</p>
        </div>
        {canManage && <Button onClick={() => setCreateOpen(true)}><Plus size={16} /> New Bid</Button>}
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9.5 rounded-md border border-line bg-surface px-3 text-sm">
          <option value="">All statuses</option>
          {["SUBMITTED", "PROCESSING", "VERIFIED", "MANUAL_REVIEW", "APPROVED", "APPROVED_WITH_CONDITIONS", "CLARIFICATION_REQUESTED", "REJECTED"].map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
        <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} className="h-9.5 rounded-md border border-line bg-surface px-3 text-sm">
          <option value="">All risk levels</option>
          {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <Card>
        {!bids ? (
          <div className="space-y-3 p-5">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-line">
                <tr className="text-left text-xs font-semibold text-ink-500">
                  <th className="px-5 py-3">Bid ID</th>
                  <th className="px-5 py-3">Bidder</th>
                  <th className="px-5 py-3">Tender</th>
                  <th className="px-5 py-3">Submitted</th>
                  <th className="px-5 py-3">Compliance</th>
                  <th className="px-5 py-3">Risk</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {bids.map((b) => (
                  <tr key={b._id} className="cursor-pointer hover:bg-navy-100/40" onClick={() => navigate(`/bids/${b._id}`)}>
                    <td className="px-5 py-3 font-mono text-xs text-ink-700">{b.bidRefId}</td>
                    <td className="px-5 py-3 font-medium text-ink-900">{typeof b.bidderId === "object" ? b.bidderId.companyName : ""}</td>
                    <td className="px-5 py-3 text-ink-700">{typeof b.tenderId === "object" ? (b.tenderId as Tender).name : ""}</td>
                    <td className="px-5 py-3 text-ink-500">{formatDate(b.submittedAt)}</td>
                    <td className="px-5 py-3 font-semibold">{b.complianceScore}%</td>
                    <td className="px-5 py-3"><Badge tone={riskTone(b.riskLevel)}>{b.riskLevel}</Badge></td>
                    <td className="px-5 py-3"><Badge tone={statusTone(b.status)}>{b.status.replace(/_/g, " ")}</Badge></td>
                    <td className="px-5 py-3 text-teal-600"><ArrowRight size={15} /></td>
                  </tr>
                ))}
                {bids.length === 0 && <tr><td colSpan={8} className="px-5 py-8 text-center text-ink-500">No bids found.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)}>
        <DialogHeader title="Create New Bid" onClose={() => setCreateOpen(false)} />
        <DialogBody className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-900">Tender</label>
            <select value={form.tenderId} onChange={(e) => setForm({ ...form, tenderId: e.target.value })} className="h-10 w-full rounded-md border border-line px-3 text-sm">
              <option value="">Select tender...</option>
              {tenders.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-900">Bidder</label>
            <select value={form.bidderId} onChange={(e) => setForm({ ...form, bidderId: e.target.value })} className="h-10 w-full rounded-md border border-line px-3 text-sm">
              <option value="">Select bidder...</option>
              {bidders.map((b) => <option key={b._id} value={b._id}>{b.companyName}</option>)}
            </select>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button disabled={!form.tenderId || !form.bidderId || creating} onClick={handleCreate}>
            {creating ? "Creating..." : "Create Bid"}
          </Button>
        </DialogFooter>
      </Dialog>
    </AppShell>
  );
}
