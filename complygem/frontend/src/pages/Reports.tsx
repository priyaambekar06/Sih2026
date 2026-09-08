import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Badge, riskTone, statusTone } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Bid, Bidder, Tender } from "@/types";

export default function Reports() {
  const [bids, setBids] = useState<Bid[] | null>(null);
  const navigate = useNavigate();

  useEffect(() => { api.get<Bid[]>("/reports").then(setBids); }, []);

  return (
    <AppShell breadcrumb={[{ label: "Reports" }]}>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-ink-900">Compliance Reports</h1>
        <p className="mt-0.5 text-sm text-ink-500">Explainable compliance reports for every verified bid.</p>
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
                  <th className="px-5 py-3">Verified On</th>
                  <th className="px-5 py-3">Compliance</th>
                  <th className="px-5 py-3">Risk</th>
                  <th className="px-5 py-3">Decision</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {bids.map((b) => (
                  <tr key={b._id} className="hover:bg-navy-100/40">
                    <td className="px-5 py-3 font-mono text-xs text-ink-700">{b.bidRefId}</td>
                    <td className="px-5 py-3 font-medium text-ink-900">{typeof b.bidderId === "object" ? (b.bidderId as Bidder).companyName : ""}</td>
                    <td className="px-5 py-3 text-ink-700">{typeof b.tenderId === "object" ? (b.tenderId as Tender).name : ""}</td>
                    <td className="px-5 py-3 text-ink-500">{formatDate(b.lastVerifiedAt)}</td>
                    <td className="px-5 py-3 font-semibold">{b.complianceScore}%</td>
                    <td className="px-5 py-3"><Badge tone={riskTone(b.riskLevel)}>{b.riskLevel}</Badge></td>
                    <td className="px-5 py-3">
                      {b.decision ? <Badge tone={statusTone(b.decision.outcome)}>{b.decision.outcome.replace(/_/g, " ")}</Badge> : <Badge tone="neutral">Pending</Badge>}
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => navigate(`/reports/${b._id}`)} className="rounded p-1.5 text-ink-500 hover:bg-navy-100 hover:text-navy-800">
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
                {bids.length === 0 && <tr><td colSpan={8} className="px-5 py-8 text-center text-ink-500">No reports available yet.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AppShell>
  );
}
