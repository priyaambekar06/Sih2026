import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge, riskTone, statusTone } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Tender, Bid } from "@/types";
import { ArrowRight } from "lucide-react";

export default function TenderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<{ tender: Tender; bids: Bid[] } | null>(null);

  useEffect(() => { api.get<{ tender: Tender; bids: Bid[] }>(`/tenders/${id}`).then(setData); }, [id]);

  if (!data) {
    return (
      <AppShell breadcrumb={[{ label: "Tenders", to: "/tenders" }, { label: "..." }]}>
        <Skeleton className="h-40" />
      </AppShell>
    );
  }

  const { tender, bids } = data;
  const requirementEntries = Object.entries(tender.rules || {});

  return (
    <AppShell breadcrumb={[{ label: "Tenders", to: "/tenders" }, { label: tender.tenderId }]}>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-ink-900">{tender.name}</h1>
            <Badge tone="navy">{tender.status}</Badge>
          </div>
          <p className="mt-0.5 font-mono text-xs text-ink-500">{tender.tenderId} · {tender.department}</p>
        </div>
        <div className="text-right text-sm text-ink-500">
          <p>{formatDate(tender.startDate)} — {formatDate(tender.endDate)}</p>
        </div>
      </div>

      {tender.description && <p className="mb-5 max-w-3xl text-sm text-ink-700">{tender.description}</p>}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Bids ({bids.length})</CardTitle></CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-line">
                  <tr className="text-left text-xs font-semibold text-ink-500">
                    <th className="px-5 py-3">Bid ID</th>
                    <th className="px-5 py-3">Bidder</th>
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
                      <td className="px-5 py-3 font-semibold">{b.complianceScore}%</td>
                      <td className="px-5 py-3"><Badge tone={riskTone(b.riskLevel)}>{b.riskLevel}</Badge></td>
                      <td className="px-5 py-3"><Badge tone={statusTone(b.status)}>{b.status.replace(/_/g, " ")}</Badge></td>
                      <td className="px-5 py-3 text-teal-600"><ArrowRight size={15} /></td>
                    </tr>
                  ))}
                  {bids.length === 0 && <tr><td colSpan={6} className="px-5 py-8 text-center text-ink-500">No bids submitted yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Compliance Requirements</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {requirementEntries.map(([key, rule]) => (
              <div key={key} className="flex items-center justify-between text-sm">
                <span className="capitalize text-ink-700">{key === "mca" ? "MCA21" : key === "nsic" ? "NSIC" : key}</span>
                <span className="flex items-center gap-2">
                  {rule.required ? <Badge tone="success">Required</Badge> : <Badge tone="neutral">Optional</Badge>}
                  <span className="font-mono text-xs text-ink-500">{rule.weight} pts</span>
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
