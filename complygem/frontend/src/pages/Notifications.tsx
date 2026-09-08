import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCheck } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import { timeAgo } from "@/lib/utils";
import { Notification } from "@/types";
import { cn } from "@/lib/utils";

const TONE: Record<string, "critical" | "warning" | "teal"> = { CRITICAL: "critical", WARNING: "warning", INFO: "teal" };

export default function Notifications() {
  const [items, setItems] = useState<Notification[] | null>(null);
  const navigate = useNavigate();

  function load() { api.get<Notification[]>("/notifications").then(setItems); }
  useEffect(load, []);

  async function markAll() {
    await api.patch("/notifications/read-all");
    load();
  }

  async function open(n: Notification) {
    if (!n.isRead) await api.patch(`/notifications/${n._id}/read`);
    if (n.link) navigate(n.link);
    load();
  }

  return (
    <AppShell breadcrumb={[{ label: "Notifications" }]}>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink-900">Notifications</h1>
          <p className="mt-0.5 text-sm text-ink-500">Alerts from verification runs, reviews and officer decisions.</p>
        </div>
        <Button variant="outline" size="sm" onClick={markAll}><CheckCheck size={15} /> Mark all read</Button>
      </div>

      {!items ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : (
        <Card>
          <div className="divide-y divide-line">
            {items.map((n) => (
              <button key={n._id} onClick={() => open(n)} className={cn("flex w-full items-start gap-3 px-5 py-4 text-left hover:bg-navy-100/40", !n.isRead && "bg-teal-100/20")}>
                <Badge tone={TONE[n.severity]} className="mt-0.5 shrink-0">{n.severity}</Badge>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-ink-900">{n.title}</p>
                  <p className="text-sm text-ink-700">{n.message}</p>
                  <p className="mt-1 text-xs text-ink-500">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-teal-500" />}
              </button>
            ))}
            {items.length === 0 && <p className="px-5 py-8 text-center text-sm text-ink-500">No notifications yet.</p>}
          </div>
        </Card>
      )}
    </AppShell>
  );
}
