import { ReactNode, useState } from "react";
import { Sidebar, SidebarContent } from "./Sidebar";
import { Navbar } from "./Navbar";
import { Sheet } from "@/components/ui/Sheet";

export function AppShell({ children, breadcrumb }: { children: ReactNode; breadcrumb: { label: string; to?: string }[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <Sheet open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <SidebarContent onNavigate={() => setMobileOpen(false)} />
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <Navbar onMenuClick={() => setMobileOpen(true)} breadcrumb={breadcrumb} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
