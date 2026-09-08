import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Badge, riskTone } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Bidder } from "@/types";

export default function Bidders() {
  const [bidders, setBidders] = useState<Bidder[] | null>(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => { api.get<Bidder[]>("/bidders").then(setBidders); }, []);

  const filtered = bidders?.filter((b) => b.companyName.toLowerCase().includes(search.toLowerCase()));

  return (
    <AppShell breadcrumb={[{ label: "Bidders" }]}>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-ink-900">Bidders</h1>
        <p className="mt-0.5 text-sm text-ink-500">Registered vendors and their verification history.</p>
      </div>

      <div className="relative mb-4 max-w-xs">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search bidders..."
          className="h-9.5 w-full rounded-md border border-line bg-surface pl-9 pr-3 text-sm focus:border-teal-500 focus:outline-none"
        />
      </div>

      {!bidders ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-line">
                <tr className="text-left text-xs font-semibold text-ink-500">
                  <th className="px-5 py-3">Company</th>
                  <th className="px-5 py-3">PAN</th>
                  <th className="px-5 py-3">GSTIN</th>
                  <th className="px-5 py-3">Risk</th>
                  <th className="px-5 py-3">Compliance</th>
                  <th className="px-5 py-3">Last Verified</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered?.map((b) => (
                  <tr key={b._id} className="cursor-pointer hover:bg-navy-100/40" onClick={() => navigate(`/bidders/${b._id}`)}>
                    <td className="px-5 py-3 font-medium text-ink-900">{b.companyName}</td>
                    <td className="px-5 py-3 font-mono text-xs text-ink-700">{b.pan || "—"}</td>
                    <td className="px-5 py-3 font-mono text-xs text-ink-700">{b.gstin || "—"}</td>
                    <td className="px-5 py-3">{b.latestRisk ? <Badge tone={riskTone(b.latestRisk)}>{b.latestRisk}</Badge> : "—"}</td>
                    <td className="px-5 py-3 font-semibold text-ink-900">{b.latestCompliance ?? "—"}{b.latestCompliance !== null && b.latestCompliance !== undefined ? "%" : ""}</td>
                    <td className="px-5 py-3 text-ink-500">{formatDate(b.lastVerifiedAt)}</td>
                    <td className="px-5 py-3">
                      {b.isBlacklisted ? (
                        <Badge tone="critical"><ShieldAlert size={12} /> Blacklisted</Badge>
                      ) : (
                        <Badge tone="success">Clear</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </AppShell>
  );
}
