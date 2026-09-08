import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await api.post("/auth/forgot-password", { email });
    setSent(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-6">
      <div className="w-full max-w-sm">
        <Link to="/login" className="mb-6 flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900">
          <ArrowLeft size={15} /> Back to sign in
        </Link>
        <h2 className="text-xl font-bold text-ink-900">Reset your password</h2>
        <p className="mt-1 text-sm text-ink-500">Enter your official email and we'll send you reset instructions.</p>

        {sent ? (
          <Alert tone="success" title="Check your inbox" className="mt-6">
            If this official email exists in our system, a reset link has been sent.
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-900">Official Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 w-full rounded-md border border-line px-3 text-sm focus:border-teal-500 focus:outline-none"
              />
            </div>
            <Button type="submit" className="w-full">Send Reset Link</Button>
          </form>
        )}
      </div>
    </div>
  );
}
