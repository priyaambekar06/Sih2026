import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Eye, Pencil, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { formatDate } from "@/lib/utils";
import { Tender } from "@/types";

const STATUS_TONE: Record<string, "navy" | "success" | "neutral" | "teal"> = {
  DRAFT: "neutral", OPEN: "success", CLOSED: "navy", AWARDED: "teal",
};

export default function Tenders() {
  const [tenders, setTenders] = useState<Tender[] | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { push } = useToast();

  function load() {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    api.get<Tender[]>(`/tenders?${params.toString()}`).then(setTenders).catch(() => {});
  }

  useEffect(load, [search, statusFilter]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this tender? This cannot be undone.")) return;
    try {
      await api.delete(`/tenders/${id}`);
      push({ title: "Tender deleted", tone: "success" });
      load();
    } catch (e: any) {
      push({ title: "Failed to delete", description: e.message, tone: "critical" });
    }
  }

  const canManage = user?.role === "PROCUREMENT_OFFICER" || user?.role === "ADMIN";

  return (
    <AppShell breadcrumb={[{ label: "Tenders" }]}>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink-900">Tenders</h1>
          <p className="mt-0.5 text-sm text-ink-500">Manage GeM tenders and their compliance requirements.</p>
        </div>
        {canManage && (
          <Button onClick={() => navigate("/tenders/create")}>
            <Plus size={16} /> Create Tender
          </Button>
        )}
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tenders..."
            className="h-9.5 w-full rounded-md border border-line bg-surface pl-9 pr-3 text-sm focus:border-teal-500 focus:outline-none sm:max-w-xs"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9.5 rounded-md border border-line bg-surface px-3 text-sm focus:border-teal-500 focus:outline-none"
        >
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="OPEN">Open</option>
          <option value="CLOSED">Closed</option>
          <option value="AWARDED">Awarded</option>
        </select>
      </div>

      <Card>
        {!tenders ? (
          <div className="space-y-3 p-5">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-line">
                <tr className="text-left text-xs font-semibold text-ink-500">
                  <th className="px-5 py-3">Tender ID</th>
                  <th className="px-5 py-3">Tender Name</th>
                  <th className="px-5 py-3">Department</th>
                  <th className="px-5 py-3">Closing Date</th>
                  <th className="px-5 py-3">Bids</th>
                  <th className="px-5 py-3">Compliance</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {tenders.map((t) => (
                  <tr key={t._id} className="hover:bg-navy-100/40">
                    <td className="px-5 py-3 font-mono text-xs text-ink-700">{t.tenderId}</td>
                    <td className="px-5 py-3 font-medium text-ink-900">{t.name}</td>
                    <td className="px-5 py-3 text-ink-700">{t.department}</td>
                    <td className="px-5 py-3 text-ink-500">{formatDate(t.endDate)}</td>
                    <td className="px-5 py-3 text-ink-700">{t.bidCount ?? 0}</td>
                    <td className="px-5 py-3 font-semibold text-ink-900">{t.avgCompliance ?? 0}%</td>
                    <td className="px-5 py-3"><Badge tone={STATUS_TONE[t.status]}>{t.status}</Badge></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => navigate(`/tenders/${t._id}`)} className="rounded p-1.5 text-ink-500 hover:bg-navy-100 hover:text-navy-800" title="View">
                          <Eye size={15} />
                        </button>
                        {user?.role === "ADMIN" && (
                          <button onClick={() => handleDelete(t._id)} className="rounded p-1.5 text-ink-500 hover:bg-critical-100 hover:text-critical-700" title="Delete">
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {tenders.length === 0 && (
                  <tr><td colSpan={8} className="px-5 py-8 text-center text-sm text-ink-500">No tenders found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AppShell>
  );
}
