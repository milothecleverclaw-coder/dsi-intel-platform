import { createFileRoute, Link, Outlet, useRouter } from "@tanstack/react-router";
import {
  Shield,
  Home,
  MessageSquare,
  FolderKanban,
  FileText,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

const navItems = [
  { icon: Home, label: "Dashboard", to: "/app" as const },
  { icon: MessageSquare, label: "Chat", to: "/app/chat" as const },
  { icon: FolderKanban, label: "Cases", to: "/app/cases" as const },
  { icon: FileText, label: "Reports", to: "/app/reports" as const },
  { icon: Settings, label: "Settings", to: "/app/settings" as const },
];

function AppLayout() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentPath = router.state.location.pathname;

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Mobile menu button */}
      <button
        className="fixed top-4 left-4 z-50 rounded-md border border-border bg-background p-2 shadow-md md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "flex w-64 shrink-0 flex-col border-r border-border bg-card",
          "fixed inset-y-0 left-0 z-40 md:static md:z-auto",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          "transition-transform duration-200",
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-5">
          <Shield className="h-7 w-7 shrink-0 text-primary" />
          <span className="text-lg font-semibold tracking-tight">DSI Intel</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => {
            const isActive =
              currentPath === item.to || (item.to === "/app" && currentPath === "/app/");
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <p className="text-xs text-muted-foreground">DSI Intelligence Platform v0.1</p>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
