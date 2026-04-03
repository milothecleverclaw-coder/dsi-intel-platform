import { createFileRoute } from "@tanstack/react-router";
import { FolderKanban, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MOCK_CASES = [
  {
    id: "DSI-2026-SB-042",
    title: "Southern Border Terrorism Investigation",
    type: "Terrorism",
    priority: "High",
    status: "Active",
  },
  {
    id: "DSI-2026-SB-041",
    title: "Narathiwat Arms Trafficking",
    type: "Arms",
    priority: "Medium",
    status: "Active",
  },
  {
    id: "DSI-2026-NE-017",
    title: "Northeast Financial Crime Network",
    type: "Financial",
    priority: "High",
    status: "Active",
  },
  {
    id: "DSI-2026-CB-008",
    title: "Bangkok Money Laundering Ring",
    type: "Financial",
    priority: "Low",
    status: "Closed",
  },
];

export const Route = createFileRoute("/app/cases")({
  component: CasesPage,
});

function priorityVariant(priority: string) {
  switch (priority) {
    case "High":
      return "destructive" as const;
    case "Medium":
      return "secondary" as const;
    default:
      return "outline" as const;
  }
}

function CasesPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-8 py-5">
        <div>
          <h1 className="text-xl font-semibold">Cases</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track and manage investigation cases</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Case
        </Button>
      </div>
      <div className="p-8">
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
          </TabsList>

          {["all", "active", "closed"].map((tab) => (
            <TabsContent key={tab} value={tab}>
              <div className="mt-4 space-y-3">
                {MOCK_CASES.filter((c) => tab === "all" || c.status.toLowerCase() === tab).map(
                  (c) => (
                    <Card key={c.id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                          <FolderKanban className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{c.title}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {c.id} · {c.type}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={priorityVariant(c.priority)}>{c.priority}</Badge>
                          <Badge variant="outline">{c.status}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ),
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
