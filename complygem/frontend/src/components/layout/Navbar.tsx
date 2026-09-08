import { useEffect, useState } from "react";
import { Menu, Search, Bell, ChevronDown, LogOut, Settings as SettingsIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Dropdown, DropdownItem, DropdownLabel, DropdownSeparator } from "@/components/ui/Dropdown";
import { Badge } from "@/components/ui/Badge";
import { initials, timeAgo } from "@/lib/utils";
import { api } from "@/lib/api";
import { Notification } from "@/types";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

const SEVERITY_TONE: Record<string, "critical" | "warning" | "teal"> = { CRITICAL: "critical", WARNING: "warning", INFO: "teal" };

export function Navbar({ onMenuClick, breadcrumb }: { onMenuClick: () => void; breadcrumb: { label: string; to?: string }[] }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    api.get<Notification[]>("/notifications").then(setNotifications).catch(() => {});
  }, []);

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-line bg-surface/95 px-4 backdrop-blur sm:px-6">
      <button onClick={onMenuClick} className="rounded-md p-1.5 text-ink-700 hover:bg-navy-100 lg:hidden">
        <Menu size={20} />
      </button>

      <Breadcrumb items={breadcrumb} />

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <div className="relative hidden md:block">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
          <input
            placeholder="Search bids, bidders, tenders..."
            className="h-9 w-64 rounded-md border border-line bg-bg pl-9 pr-3 text-sm placeholder:text-ink-300 focus:border-teal-500 focus:outline-none"
          />
        </div>

        <Dropdown
          align="right"
          trigger={
            <button className="relative rounded-md p-2 text-ink-700 hover:bg-navy-100">
              <Bell size={18} />
              {unread > 0 && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-critical-500" />}
            </button>
          }
        >
          <DropdownLabel>Notifications</DropdownLabel>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && <p className="px-3.5 py-3 text-sm text-ink-500">You're all caught up.</p>}
            {notifications.slice(0, 8).map((n) => (
              <div key={n._id} className="border-t border-line px-3.5 py-2.5">
                <div className="flex items-center gap-1.5">
                  <Badge tone={SEVERITY_TONE[n.severity]} className="px-1.5 py-0 text-[10px]">{n.severity}</Badge>
                  <span className="text-[11px] text-ink-300">{timeAgo(n.createdAt)}</span>
                </div>
                <p className="mt-1 text-sm font-medium text-ink-900">{n.title}</p>
                <p className="text-xs text-ink-500">{n.message}</p>
              </div>
            ))}
          </div>
          <DropdownSeparator />
          <DropdownItem onClick={() => navigate("/notifications")}>View all notifications</DropdownItem>
        </Dropdown>

        <Dropdown
          align="right"
          trigger={
            <button className="flex items-center gap-2 rounded-md py-1 pl-1 pr-2 hover:bg-navy-100">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-navy-900 text-xs font-semibold text-white">
                {user ? initials(user.name) : ""}
              </div>
              <ChevronDown size={14} className="text-ink-500" />
            </button>
          }
        >
          <DropdownLabel>{user?.department}</DropdownLabel>
          <div className="px-3.5 pb-2">
            <p className="text-sm font-semibold text-ink-900">{user?.name}</p>
            <p className="text-xs text-ink-500">{user?.role.replace(/_/g, " ")}</p>
          </div>
          <DropdownSeparator />
          <DropdownItem onClick={() => navigate("/settings")}>
            <SettingsIcon size={15} /> Settings
          </DropdownItem>
          <DropdownItem onClick={logout} className="text-critical-700">
            <LogOut size={15} /> Logout
          </DropdownItem>
        </Dropdown>
      </div>
    </header>
  );
}
