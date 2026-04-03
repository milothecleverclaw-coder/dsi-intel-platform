import { createFileRoute } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/app/")({
  component: DashboardPage,
});

const stats = [
  { label: "Active Cases", value: "12", icon: "📁" },
  { label: "Pending Reports", value: "3", icon: "📝" },
  { label: "Documents This Week", value: "5", icon: "📄" },
];

function DashboardPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-8 py-5">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome to the DSI Intelligence Platform
        </p>
      </div>
      <div className="space-y-8 p-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {stats.map((s) => (
            <Card key={s.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {s.label}
                </CardTitle>
                <span className="text-2xl">{s.icon}</span>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{s.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Case DSI-2026-SB-042 updated</p>
                  <p className="text-xs text-muted-foreground">New evidence uploaded</p>
                </div>
                <Badge variant="secondary">2h ago</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Report ตร.1 draft created</p>
                  <p className="text-xs text-muted-foreground">Auto-generated from case notes</p>
                </div>
                <Badge variant="secondary">5h ago</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Case DSI-2026-SB-041 assigned</p>
                  <p className="text-xs text-muted-foreground">Assigned to investigation team B</p>
                </div>
                <Badge variant="secondary">1d ago</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
