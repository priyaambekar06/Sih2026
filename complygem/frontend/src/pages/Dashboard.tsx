import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { FileStack, FolderKanban, ListChecks, ShieldAlert, CheckCircle2, TrendingUp, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge, riskTone, statusTone } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { formatDate } from "@/lib/utils";
import { Bid, Tender } from "@/types";

interface DashboardData {
  cards: { totalTenders: number; activeBids: number; pendingReview: number; highRisk: number; verifiedToday: number; avgCompliance: number };
  charts: {
    complianceOverview: { date: string; avgScore: number }[];
    riskDistribution: { level: string; count: number }[];
    verificationStatus: { status: string; count: number }[];
    documentProcessing: { status: string; count: number }[];
  };
  priorityBids: Bid[];
  recentBids: Bid[];
}

const RISK_COLORS: Record<string, string> = { LOW: "#1E9159", MEDIUM: "#C1770B", HIGH: "#C13636", CRITICAL: "#9A2A2A" };

function StatCard({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string | number; accent: string }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between py-4">
        <div>
          <p className="text-xs font-medium text-ink-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-ink-900">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-md ${accent}`}>
          <Icon size={19} />
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    api.get<DashboardData>("/dashboard").then(setData).catch(() => {});
  }, []);

  const roleLabel = user?.role === "PROCUREMENT_OFFICER" ? "Officer" : user?.role === "REVIEWER" ? "Reviewer" : "Admin";

  return (
    <AppShell breadcrumb={[{ label: "Dashboard" }]}>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-ink-900">Good morning, {roleLabel}</h1>
        <p className="mt-0.5 text-sm text-ink-500">Here's your procurement compliance overview.</p>
      </div>

      {!data ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
            <StatCard icon={FileStack} label="Total Tenders" value={data.cards.totalTenders} accent="bg-navy-100 text-navy-800" />
            <StatCard icon={FolderKanban} label="Active Bids" value={data.cards.activeBids} accent="bg-teal-100 text-teal-600" />
            <StatCard icon={ListChecks} label="Pending Review" value={data.cards.pendingReview} accent="bg-warning-100 text-warning-700" />
            <StatCard icon={ShieldAlert} label="High Risk" value={data.cards.highRisk} accent="bg-critical-100 text-critical-700" />
            <StatCard icon={CheckCircle2} label="Verified Today" value={data.cards.verifiedToday} accent="bg-success-100 text-success-700" />
            <StatCard icon={TrendingUp} label="Average Compliance" value={`${data.cards.avgCompliance}%`} accent="bg-navy-100 text-navy-800" />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Compliance Overview — Last 7 Days</CardTitle></CardHeader>
              <CardContent className="h-64 pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.charts.complianceOverview}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#DFE7ED" />
                    <XAxis dataKey="date" tickFormatter={(d) => formatDate(d).slice(0, 6)} tick={{ fontSize: 11, fill: "#52708A" }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#52708A" }} />
                    <RTooltip />
                    <Line type="monotone" dataKey="avgScore" stroke="#0C97A3" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Risk Distribution</CardTitle></CardHeader>
              <CardContent className="h-64 pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.charts.riskDistribution} dataKey="count" nameKey="level" innerRadius={55} outerRadius={85} paddingAngle={3}>
                      {data.charts.riskDistribution.map((d) => <Cell key={d.level} fill={RISK_COLORS[d.level]} />)}
                    </Pie>
                    <RTooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-3 text-xs">
                  {data.charts.riskDistribution.map((d) => (
                    <span key={d.level} className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ background: RISK_COLORS[d.level] }} />
                      {d.level} ({d.count})
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Verification Status</CardTitle></CardHeader>
              <CardContent className="h-56 pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.charts.verificationStatus}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#DFE7ED" />
                    <XAxis dataKey="status" tick={{ fontSize: 11, fill: "#52708A" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#52708A" }} allowDecimals={false} />
                    <RTooltip />
                    <Bar dataKey="count" fill="#123A63" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Document Processing</CardTitle></CardHeader>
              <CardContent className="h-56 pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.charts.documentProcessing}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#DFE7ED" />
                    <XAxis dataKey="status" tick={{ fontSize: 11, fill: "#52708A" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#52708A" }} allowDecimals={false} />
                    <RTooltip />
                    <Bar dataKey="count" fill="#0C97A3" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {data.priorityBids.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-3 text-sm font-semibold text-ink-900">Requires Your Attention</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {data.priorityBids.map((b) => {
                  const bidder = typeof b.bidderId === "object" ? b.bidderId.companyName : "";
                  return (
                    <Card key={b._id} className="border-l-4" style={{ borderLeftColor: RISK_COLORS[b.riskLevel] }}>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <Badge tone={riskTone(b.riskLevel)}>{b.status === "MANUAL_REVIEW" ? "MANUAL REVIEW" : `${b.riskLevel} RISK`}</Badge>
                          <span className="font-mono text-xs text-ink-500">{b.bidRefId}</span>
                        </div>
                        <p className="mt-2 text-sm font-semibold text-ink-900">{bidder}</p>
                        <div className="mt-1 flex items-center gap-3 text-xs text-ink-500">
                          <span>Score: <span className="font-semibold text-ink-900">{b.complianceScore}</span></span>
                          <span>Risk: <span className="font-semibold text-ink-900">{b.riskLevel}</span></span>
                        </div>
                        {b.mismatches.length > 0 && (
                          <ul className="mt-2 space-y-0.5 text-xs text-ink-500">
                            {b.mismatches.slice(0, 2).map((m, i) => <li key={i}>• {m.title}</li>)}
                          </ul>
                        )}
                        <Button size="sm" variant="outline" className="mt-3 w-full" onClick={() => navigate(`/bids/${b._id}`)}>
                          Review Bid <ArrowRight size={14} />
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-6">
            <Card>
              <CardHeader><CardTitle>Recent Bids</CardTitle></CardHeader>
              <div className="hidden overflow-x-auto sm:block">
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
                    {data.recentBids.map((b) => {
                      const bidder = typeof b.bidderId === "object" ? b.bidderId.companyName : "";
                      const tender = typeof b.tenderId === "object" ? (b.tenderId as Tender).name : "";
                      return (
                        <tr key={b._id} className="cursor-pointer hover:bg-navy-100/40" onClick={() => navigate(`/bids/${b._id}`)}>
                          <td className="px-5 py-3 font-mono text-xs text-ink-700">{b.bidRefId}</td>
                          <td className="px-5 py-3 font-medium text-ink-900">{bidder}</td>
                          <td className="px-5 py-3 text-ink-700">{tender}</td>
                          <td className="px-5 py-3 text-ink-500">{formatDate(b.submittedAt)}</td>
                          <td className="px-5 py-3 font-semibold text-ink-900">{b.complianceScore}%</td>
                          <td className="px-5 py-3"><Badge tone={riskTone(b.riskLevel)}>{b.riskLevel}</Badge></td>
                          <td className="px-5 py-3"><Badge tone={statusTone(b.status)}>{b.status.replace(/_/g, " ")}</Badge></td>
                          <td className="px-5 py-3 text-teal-600"><ArrowRight size={15} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="divide-y divide-line sm:hidden">
                {data.recentBids.map((b) => {
                  const bidder = typeof b.bidderId === "object" ? b.bidderId.companyName : "";
                  return (
                    <div key={b._id} className="px-5 py-3.5" onClick={() => navigate(`/bids/${b._id}`)}>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-ink-500">{b.bidRefId}</span>
                        <Badge tone={riskTone(b.riskLevel)}>{b.riskLevel}</Badge>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-ink-900">{bidder}</p>
                      <p className="text-xs text-ink-500">Compliance: {b.complianceScore}% · {b.status.replace(/_/g, " ")}</p>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </>
      )}
    </AppShell>
  );
}
