import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";

const REQUIREMENTS: { key: string; label: string; weight: number; hasActive?: boolean }[] = [
  { key: "pan", label: "PAN", weight: 15 },
  { key: "gst", label: "GST", weight: 20, hasActive: true },
  { key: "udyam", label: "Udyam/MSME", weight: 15 },
  { key: "epfo", label: "EPFO", weight: 10 },
  { key: "esic", label: "ESIC", weight: 10 },
  { key: "nsic", label: "NSIC", weight: 10 },
  { key: "mca", label: "MCA21", weight: 10 },
  { key: "blacklist", label: "Blacklist Verification", weight: 10 },
];

export default function TenderCreate() {
  const navigate = useNavigate();
  const { push } = useToast();
  const [form, setForm] = useState({ name: "", department: "", description: "", startDate: "", endDate: "" });
  const [required, setRequired] = useState<Record<string, boolean>>(
    Object.fromEntries(REQUIREMENTS.map((r) => [r.key, r.key !== "nsic"]))
  );
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const rules = Object.fromEntries(
        REQUIREMENTS.map((r) => [r.key, { required: required[r.key], activeRequired: r.hasActive ? true : undefined, weight: r.weight }])
      );
      const tender = await api.post<{ _id: string }>("/tenders", { ...form, rules });
      push({ title: "Tender created", tone: "success" });
      navigate(`/tenders/${tender._id}`);
    } catch (err: any) {
      push({ title: "Failed to create tender", description: err.message, tone: "critical" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell breadcrumb={[{ label: "Tenders", to: "/tenders" }, { label: "Create Tender" }]}>
      <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-6">
        <Card>
          <CardHeader><CardTitle>Tender Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-900">Tender Name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="h-10 w-full rounded-md border border-line px-3 text-sm focus:border-teal-500 focus:outline-none" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-900">Department</label>
                <input required value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="h-10 w-full rounded-md border border-line px-3 text-sm focus:border-teal-500 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink-900">Start Date</label>
                  <input required type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="h-10 w-full rounded-md border border-line px-3 text-sm focus:border-teal-500 focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink-900">End Date</label>
                  <input required type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="h-10 w-full rounded-md border border-line px-3 text-sm focus:border-teal-500 focus:outline-none" />
                </div>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-900">Description</label>
              <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-md border border-line px-3 py-2 text-sm focus:border-teal-500 focus:outline-none" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Compliance Requirements</CardTitle></CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-ink-500">Select which verifications the rule engine must enforce for bids submitted to this tender.</p>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {REQUIREMENTS.map((r) => (
                <label key={r.key} className="flex items-center justify-between rounded-md border border-line px-3.5 py-2.5">
                  <span className="flex items-center gap-2.5 text-sm text-ink-900">
                    <input
                      type="checkbox"
                      checked={required[r.key]}
                      onChange={(e) => setRequired({ ...required, [r.key]: e.target.checked })}
                      className="rounded border-line"
                    />
                    {r.label}
                  </span>
                  <span className="font-mono text-xs text-ink-500">{r.weight} pts</span>
                </label>
              ))}
            </div>
            <p className="mt-3 text-xs text-ink-500">
              Weights always total 100. Rules are compiled into a JSON configuration consumed by the deterministic
              compliance rule engine — never by the LLM/OCR layer.
            </p>
          </CardContent>
          <CardFooter>
            <Button type="button" variant="outline" onClick={() => navigate("/tenders")}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Creating..." : "Create Tender"}</Button>
          </CardFooter>
        </Card>
      </form>
    </AppShell>
  );
}
