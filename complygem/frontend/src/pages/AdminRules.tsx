import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";

interface RuleTemplate {
  defaultWeights: Record<string, number>;
  ocrConfidenceThreshold: number;
  riskThresholds: { low: number; medium: number; high: number };
  reverificationCycleDays: number;
}

const LABELS: Record<string, string> = { pan: "PAN", gst: "GST", udyam: "Udyam/MSME", epfo: "EPFO", esic: "ESIC", nsic: "NSIC", mca: "MCA21", blacklist: "Blacklist" };

export default function AdminRules() {
  const [rules, setRules] = useState<RuleTemplate | null>(null);
  const [saving, setSaving] = useState(false);
  const { push } = useToast();

  useEffect(() => { api.get<RuleTemplate>("/admin/rules").then(setRules); }, []);

  const total = rules ? Object.values(rules.defaultWeights).reduce((a, b) => a + b, 0) : 0;

  async function save() {
    if (!rules) return;
    setSaving(true);
    try {
      await api.put("/admin/rules", rules);
      push({ title: "Default rule template updated", tone: "success" });
    } catch (err: any) {
      push({ title: "Failed to save", description: err.message, tone: "critical" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell breadcrumb={[{ label: "Admin" }, { label: "Tender Rules" }]}>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-ink-900">Default Tender Rules</h1>
        <p className="mt-0.5 text-sm text-ink-500">Organization-wide defaults new tenders start with. Individual tenders can still override weights.</p>
      </div>

      {!rules ? <Skeleton className="h-96" /> : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Requirement Weights</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(rules.defaultWeights).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-ink-700">{LABELS[key] || key}</span>
                  <input
                    type="number"
                    value={val}
                    onChange={(e) => setRules({ ...rules, defaultWeights: { ...rules.defaultWeights, [key]: Number(e.target.value) } })}
                    className="h-8 w-20 rounded-md border border-line px-2 text-right text-sm"
                  />
                </div>
              ))}
              <div className={`flex justify-between text-sm font-semibold ${total === 100 ? "text-success-700" : "text-critical-700"}`}>
                <span>Total</span><span>{total} / 100</span>
              </div>
            </CardContent>
            <CardFooter><Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Defaults"}</Button></CardFooter>
          </Card>

          <Card>
            <CardHeader><CardTitle>Engine Thresholds</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-1 block text-xs text-ink-500">OCR Confidence Threshold (manual review below this)</label>
                <input type="number" value={rules.ocrConfidenceThreshold}
                  onChange={(e) => setRules({ ...rules, ocrConfidenceThreshold: Number(e.target.value) })}
                  className="h-9 w-full rounded-md border border-line px-3 text-sm" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-ink-500">Low/Medium boundary</label>
                  <input type="number" value={rules.riskThresholds.low}
                    onChange={(e) => setRules({ ...rules, riskThresholds: { ...rules.riskThresholds, low: Number(e.target.value) } })}
                    className="h-9 w-full rounded-md border border-line px-2 text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-ink-500">Medium/High boundary</label>
                  <input type="number" value={rules.riskThresholds.medium}
                    onChange={(e) => setRules({ ...rules, riskThresholds: { ...rules.riskThresholds, medium: Number(e.target.value) } })}
                    className="h-9 w-full rounded-md border border-line px-2 text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-ink-500">High/Critical boundary</label>
                  <input type="number" value={rules.riskThresholds.high}
                    onChange={(e) => setRules({ ...rules, riskThresholds: { ...rules.riskThresholds, high: Number(e.target.value) } })}
                    className="h-9 w-full rounded-md border border-line px-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-ink-500">Reverification Cycle (days)</label>
                <input type="number" value={rules.reverificationCycleDays}
                  onChange={(e) => setRules({ ...rules, reverificationCycleDays: Number(e.target.value) })}
                  className="h-9 w-full rounded-md border border-line px-3 text-sm" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
