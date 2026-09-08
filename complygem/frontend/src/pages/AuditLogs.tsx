import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";

interface AuditLog {
  _id: string;
  actorName: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: string;
  createdAt: string;
}

const ACTION_TONE: Record<string, "success" | "warning" | "critical" | "navy" | "neutral"> = {
  LOGIN: "navy",
  CREATE_TENDER: "success",
  CREATE_BID: "success",
  RUN_VERIFICATION: "teal",
  DECIDE_BID: "warning",
  DELETE_TENDER: "critical",
  DELETE_USER: "critical",
  REVIEW_REJECT: "critical",
};

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[] | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  function load(p: number) {
    api.get<{ logs: AuditLog[]; page: number; pages: number }>(`/audit-logs?page=${p}&limit=25`).then((res) => {
      setLogs(res.logs);
      setPage(res.page);
      setPages(res.pages);
    });
  }
  useEffect(() => load(1), []);

  return (
    <AppShell breadcrumb={[{ label: "Audit Logs" }]}>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-ink-900">Audit Logs</h1>
        <p className="mt-0.5 text-sm text-ink-500">Full trail of actions taken across the platform.</p>
      </div>

      <Card>
        {!logs ? (
          <div className="space-y-3 p-5">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-line">
                <tr className="text-left text-xs font-semibold text-ink-500">
                  <th className="px-5 py-3">Actor</th>
                  <th className="px-5 py-3">Action</th>
                  <th className="px-5 py-3">Entity</th>
                  <th className="px-5 py-3">Details</th>
                  <th className="px-5 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {logs.map((l) => (
                  <tr key={l._id} className="hover:bg-navy-100/40">
                    <td className="px-5 py-3">
                      <p className="font-medium text-ink-900">{l.actorName}</p>
                      <p className="text-xs text-ink-500">{l.actorRole.replace(/_/g, " ")}</p>
                    </td>
                    <td className="px-5 py-3"><Badge tone={ACTION_TONE[l.action] || "neutral"}>{l.action.replace(/_/g, " ")}</Badge></td>
                    <td className="px-5 py-3 text-ink-700">{l.entityType}{l.entityId ? ` · ${l.entityId.slice(-6)}` : ""}</td>
                    <td className="max-w-xs truncate px-5 py-3 text-ink-500">{l.details || "—"}</td>
                    <td className="px-5 py-3 text-ink-500">{formatDateTime(l.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-line px-5 py-3">
          <p className="text-xs text-ink-500">Page {page} of {pages || 1}</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => load(page - 1)}>Previous</Button>
            <Button size="sm" variant="outline" disabled={page >= pages} onClick={() => load(page + 1)}>Next</Button>
          </div>
        </div>
      </Card>
    </AppShell>
  );
}
