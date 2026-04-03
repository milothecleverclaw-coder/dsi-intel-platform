import { createFileRoute } from "@tanstack/react-router";
import { MessageSquare, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/app/chat")({
  component: ChatPage,
});

function ChatPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-8 py-5">
        <h1 className="text-xl font-semibold">AI Chat</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Interact with case data using natural language queries
        </p>
      </div>

      {/* Messages area */}
      <div className="flex flex-1 items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="flex flex-col items-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 text-lg font-medium text-muted-foreground">AI Chat coming soon</p>
            <p className="mt-1 text-center text-sm text-muted-foreground/70">
              Query your case data with natural language. Ask about suspects, evidence, timelines,
              and more.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Input bar */}
      <div className="border-t border-border p-4">
        <div className="flex gap-2">
          <Input placeholder="Ask about your cases..." className="flex-1" disabled />
          <Button disabled>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
