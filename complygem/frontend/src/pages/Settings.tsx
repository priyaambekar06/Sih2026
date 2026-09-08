import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";
import { initials } from "@/lib/utils";

export default function Settings() {
  const { user } = useAuth();
  return (
    <AppShell breadcrumb={[{ label: "Settings" }]}>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-ink-900">Settings</h1>
        <p className="mt-0.5 text-sm text-ink-500">Your account and platform preferences.</p>
      </div>

      <div className="max-w-2xl space-y-5">
        <Card>
          <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-navy-900 text-lg font-semibold text-white">
              {user ? initials(user.name) : ""}
            </div>
            <div>
              <p className="font-semibold text-ink-900">{user?.name}</p>
              <p className="text-sm text-ink-500">{user?.email}</p>
              <p className="text-xs text-ink-500">{user?.role.replace(/_/g, " ")} · {user?.department}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>About ComplyGeM</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-ink-700">
            <p>ComplyGeM — AI-Powered Integrated Bid Compliance Verification Platform, built for Smart India Hackathon 2026 (Problem SIH26100, Theme: Smart Automation).</p>
            <p className="text-ink-500">Version 1.0.0 · Verification adapters currently run against mocked government data sources — see Admin → Integrations for status.</p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
