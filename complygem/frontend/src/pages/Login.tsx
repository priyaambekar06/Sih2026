import { FormEvent, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { ShieldCheck, Lock, Mail, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

const DEMO_ACCOUNTS = [
  { label: "Procurement Officer", email: "officer@complygem.demo" },
  { label: "Reviewer", email: "reviewer@complygem.demo" },
  { label: "Admin", email: "admin@complygem.demo" },
];

export default function Login() {
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("Demo@123");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");

  if (user) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Unable to sign in. Please check your credentials.");
    }
  }

  return (
    <div className="flex min-h-screen bg-navy-950">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-navy-900 p-12 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-teal-500 text-lg font-bold">CG</div>
          <span className="text-xl font-bold">ComplyGeM</span>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-3xl font-bold leading-tight">
            AI-powered bid compliance intelligence for GeM procurement.
          </h1>
          <p className="mt-4 text-navy-100/70">
            Cross-verify PAN, GST, Udyam, EPFO, ESIC, NSIC and MCA21 records in minutes — with every score fully
            explained and every final decision left to your procurement officers.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {["Document OCR", "Multi-source verification", "Explainable scoring", "Human-in-the-loop review"].map((f) => (
              <span key={f} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-navy-100/80">
                {f}
              </span>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-navy-100/40">Smart India Hackathon 2026 · Problem SIH26100</p>
      </div>

      <div className="flex w-full flex-1 items-center justify-center bg-bg p-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-navy-900 text-sm font-bold text-white">CG</div>
            <span className="text-lg font-bold text-ink-900">ComplyGeM</span>
          </div>

          <h2 className="text-xl font-bold text-ink-900">Sign in to your account</h2>
          <p className="mt-1 text-sm text-ink-500">Enter your official credentials to continue.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && <Alert tone="critical">{error}</Alert>}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-900">Official Email</label>
              <div className="relative">
                <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@department.gov.in"
                  className="h-10 w-full rounded-md border border-line pl-9 pr-3 text-sm focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-900">Password</label>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 w-full rounded-md border border-line pl-9 pr-3 text-sm focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-ink-700">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="rounded border-line" />
                Remember me
              </label>
              <button type="button" onClick={() => navigate("/forgot-password")} className="font-medium text-teal-600 hover:text-teal-500">
                Forgot password?
              </button>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"} {!loading && <ArrowRight size={16} />}
            </Button>
          </form>

          <div className="mt-5 flex items-center gap-2 rounded-md border border-line bg-navy-100/40 px-3 py-2 text-xs text-ink-700">
            <ShieldCheck size={15} className="text-teal-600" />
            Secure Procurement Environment
          </div>

          <div className="mt-6 rounded-md border border-dashed border-line p-3.5">
            <p className="mb-2 text-xs font-semibold text-ink-500">Demo accounts (password: Demo@123)</p>
            <div className="flex flex-col gap-1.5">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => { setEmail(acc.email); setPassword("Demo@123"); }}
                  className="flex items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-navy-100"
                >
                  <span className="font-medium text-ink-900">{acc.label}</span>
                  <span className="font-mono text-xs text-ink-500">{acc.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
