import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, FileStack, Building2, ShieldCheck, ListChecks,
  RefreshCcw, FileBarChart, Bell, Users, SlidersHorizontal, Plug,
  ScrollText, Settings, LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { initials } from "@/lib/utils";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tenders", label: "Tenders", icon: FileStack },
  { to: "/bidders", label: "Bidders", icon: Building2 },
  { to: "/review", label: "Review Queue", icon: ListChecks },
  { to: "/reverification", label: "Reverification", icon: RefreshCcw },
  { to: "/reports", label: "Reports", icon: FileBarChart },
  { to: "/notifications", label: "Notifications", icon: Bell },
];

const ADMIN_NAV = [
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/rules", label: "Tender Rules", icon: SlidersHorizontal },
  { to: "/admin/integrations", label: "Integrations", icon: Plug },
  { to: "/audit-logs", label: "Audit Logs", icon: ScrollText },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-full flex-col text-navy-100">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-teal-500 text-sm font-bold text-white">CG</div>
        <div>
          <p className="text-sm font-bold leading-none text-white">ComplyGeM</p>
          <p className="mt-1 text-[11px] leading-none text-navy-100/60">Bid Compliance Platform</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        <ul className="space-y-0.5">
          {NAV.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive ? "bg-white/10 text-white" : "text-navy-100/70 hover:bg-white/5 hover:text-white"
                  )
                }
              >
                <item.icon size={17} />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {user?.role === "ADMIN" && (
          <>
            <p className="mb-1.5 mt-5 px-3 text-[11px] font-semibold tracking-wide text-navy-100/40">ADMIN</p>
            <ul className="space-y-0.5">
              {ADMIN_NAV.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive ? "bg-white/10 text-white" : "text-navy-100/70 hover:bg-white/5 hover:text-white"
                      )
                    }
                  >
                    <item.icon size={17} />
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </>
        )}
      </nav>

      <div className="border-t border-white/10 px-4 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/90 text-xs font-semibold text-white">
            {user ? initials(user.name) : "--"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{user?.name}</p>
            <p className="truncate text-[11px] text-navy-100/60">{user?.role.replace(/_/g, " ")}</p>
          </div>
          <button onClick={logout} className="rounded-md p-1.5 text-navy-100/60 hover:bg-white/10 hover:text-white" title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 bg-navy-900 lg:block">
      <div className="fixed h-full w-64">
        <SidebarContent />
      </div>
    </aside>
  );
}
