import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog, DialogHeader, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { AuthUser, Role } from "@/types";

const ROLE_TONE: Record<Role, "navy" | "teal" | "success"> = { ADMIN: "navy", PROCUREMENT_OFFICER: "teal", REVIEWER: "success" };

export default function AdminUsers() {
  const [users, setUsers] = useState<AuthUser[] | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "REVIEWER" as Role, department: "" });
  const [saving, setSaving] = useState(false);
  const { push } = useToast();

  function load() { api.get<AuthUser[]>("/admin/users").then(setUsers); }
  useEffect(load, []);

  async function handleCreate() {
    setSaving(true);
    try {
      await api.post("/admin/users", form);
      push({ title: "User created", tone: "success" });
      setOpen(false);
      setForm({ name: "", email: "", password: "", role: "REVIEWER", department: "" });
      load();
    } catch (err: any) {
      push({ title: "Failed to create user", description: err.message, tone: "critical" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this user?")) return;
    await api.delete(`/admin/users/${id}`);
    load();
  }

  async function toggleActive(u: AuthUser & { isActive?: boolean }) {
    await api.put(`/admin/users/${u.id}`, { isActive: !u.isActive, name: u.name, role: u.role, department: u.department });
    load();
  }

  return (
    <AppShell breadcrumb={[{ label: "Admin", to: "/admin/users" }, { label: "Users" }]}>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink-900">User Management</h1>
          <p className="mt-0.5 text-sm text-ink-500">Manage platform access and roles.</p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus size={16} /> Add User</Button>
      </div>

      <Card>
        {!users ? (
          <div className="space-y-3 p-5">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-line">
                <tr className="text-left text-xs font-semibold text-ink-500">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Department</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {users.map((u: any) => (
                  <tr key={u._id} className="hover:bg-navy-100/40">
                    <td className="px-5 py-3 font-medium text-ink-900">{u.name}</td>
                    <td className="px-5 py-3 font-mono text-xs text-ink-700">{u.email}</td>
                    <td className="px-5 py-3"><Badge tone={ROLE_TONE[u.role as Role]}>{u.role.replace(/_/g, " ")}</Badge></td>
                    <td className="px-5 py-3 text-ink-700">{u.department}</td>
                    <td className="px-5 py-3">
                      <button onClick={() => toggleActive({ ...u, id: u._id })}>
                        <Badge tone={u.isActive ? "success" : "neutral"}>{u.isActive ? "Active" : "Disabled"}</Badge>
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => handleDelete(u._id)} className="rounded p-1.5 text-ink-500 hover:bg-critical-100 hover:text-critical-700">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogHeader title="Add User" onClose={() => setOpen(false)} />
        <DialogBody className="space-y-3">
          <input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="h-10 w-full rounded-md border border-line px-3 text-sm" />
          <input placeholder="Official email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="h-10 w-full rounded-md border border-line px-3 text-sm" />
          <input placeholder="Temporary password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="h-10 w-full rounded-md border border-line px-3 text-sm" />
          <input placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}
            className="h-10 w-full rounded-md border border-line px-3 text-sm" />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })} className="h-10 w-full rounded-md border border-line px-3 text-sm">
            <option value="PROCUREMENT_OFFICER">Procurement Officer</option>
            <option value="REVIEWER">Reviewer</option>
            <option value="ADMIN">Admin</option>
          </select>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button disabled={saving} onClick={handleCreate}>{saving ? "Creating..." : "Create User"}</Button>
        </DialogFooter>
      </Dialog>
    </AppShell>
  );
}
