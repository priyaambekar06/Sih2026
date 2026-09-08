import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge, riskTone, statusTone } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Bidder, Bid, Tender } from "@/types";
import { ArrowRight, ShieldAlert, ShieldCheck } from "lucide-react";

export default function BidderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<{ bidder: Bidder; bids: Bid[] } | null>(null);

  useEffect(() => { api.get<{ bidder: Bidder; bids: Bid[] }>(`/bidders/${id}`).then(setData); }, [id]);

  if (!data) return <AppShell breadcrumb={[{ label: "Bidders", to: "/bidders" }, { label: "..." }]}><Skeleton className="h-40" /></AppShell>;

  const { bidder, bids } = data;

  const fields: { label: string; value?: string }[] = [
    { label: "Legal Name (MCA)", value: bidder.legalNameMCA },
    { label: "PAN", value: bidder.pan },
    { label: "GSTIN", value: bidder.gstin },
    { label: "Udyam Number", value: bidder.udyamNumber },
    { label: "CIN", value: bidder.cin },
  ];

  return (
    <AppShell breadcrumb={[{ label: "Bidders", to: "/bidders" }, { label: bidder.companyName }]}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink-900">{bidder.companyName}</h1>
          <p className="mt-0.5 text-sm text-ink-500">Company overview and verification timeline.</p>
        </div>
        {bidder.isBlacklisted ? (
          <Badge tone="critical" className="text-sm"><ShieldAlert size={13} /> Blacklisted</Badge>
        ) : (
          <Badge tone="success" className="text-sm"><ShieldCheck size={13} /> No Blacklist Match</Badge>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Company Overview</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {fields.map((f) => (
              <div key={f.label}>
                <p className="text-xs text-ink-500">{f.label}</p>
                <p className="font-mono text-sm text-ink-900">{f.value || "—"}</p>
              </div>
            ))}
            <div className="border-t border-line pt-3">
              <p className="text-xs text-ink-500">Last Verified</p>
              <p className="text-sm text-ink-900">{formatDate(bidder.lastVerifiedAt)}</p>
            </div>
            <div>
              <p className="text-xs text-ink-500">Next Verification Due</p>
              <p className="text-sm text-ink-900">{formatDate(bidder.nextVerificationDue)}</p>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Bid History</CardTitle></CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-line">
                  <tr className="text-left text-xs font-semibold text-ink-500">
                    <th className="px-5 py-3">Bid ID</th>
                    <th className="px-5 py-3">Tender</th>
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
                      <td className="px-5 py-3 text-ink-700">{typeof b.tenderId === "object" ? (b.tenderId as Tender).name : ""}</td>
                      <td className="px-5 py-3 font-semibold">{b.complianceScore}%</td>
                      <td className="px-5 py-3"><Badge tone={riskTone(b.riskLevel)}>{b.riskLevel}</Badge></td>
                      <td className="px-5 py-3"><Badge tone={statusTone(b.status)}>{b.status.replace(/_/g, " ")}</Badge></td>
                      <td className="px-5 py-3 text-teal-600"><ArrowRight size={15} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
