import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";

interface Integration { name: string; category: string; status: string; detail: string }

export default function AdminIntegrations() {
  const [items, setItems] = useState<Integration[] | null>(null);
  useEffect(() => { api.get<Integration[]>("/admin/integrations").then(setItems); }, []);

  return (
    <AppShell breadcrumb={[{ label: "Admin" }, { label: "Integrations" }]}>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-ink-900">Integrations</h1>
        <p className="mt-0.5 text-sm text-ink-500">External data sources powering document OCR and multi-source verification.</p>
      </div>

      {!items ? (
        <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {items.map((it) => (
            <Card key={it.name} className="p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-ink-900">{it.name}</p>
                <Badge tone={it.status === "CONFIGURED" ? "success" : it.status === "MOCKED" ? "warning" : "neutral"}>{it.status}</Badge>
              </div>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-ink-300">{it.category}</p>
              <p className="mt-2 text-sm text-ink-700">{it.detail}</p>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
