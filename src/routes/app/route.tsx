import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Link, useMatchRoute } from "@tanstack/react-router";
import { Shield, FolderKanban, Menu, X } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

const navItems = [{ icon: FolderKanban, label: "Cases", to: "/app/cases" }];

function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const matchRoute = useMatchRoute();

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-card px-4 md:h-14 md:px-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground md:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Shield className="h-5 w-5 text-primary" />
          <span className="text-sm font-semibold tracking-tight md:text-base">DSI Intel</span>
        </div>
      </header>

      {/* Mobile nav overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile nav drawer */}
      <nav
        className={`fixed top-12 left-0 z-50 h-[calc(100vh-3rem)] w-60 border-r border-border bg-card p-3 transition-transform duration-200 md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-1">
          {navItems.map((item) => {
            const active = !!matchRoute({ to: item.to });
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
