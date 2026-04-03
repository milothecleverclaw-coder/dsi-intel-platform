import { createFileRoute } from "@tanstack/react-router";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/app/chat")({
  component: ChatPage,
});

const RAGFLOW_BASE = "https://ragflow.hotserver.uk";
const SHARE_AUTH = "u0knS-A4qxPRorjfKqEL6KDe6ccz-2ah";

const AGENTS = [
  {
    key: "general",
    label: "General Chat",
    sharedId: "0c91ccfc2f4e11f1868a91828498d495",
  },
  {
    key: "case-assistant",
    label: "Case Assistant",
    sharedId: "2cc1a3fc253111f1868a91828498d495",
  },
  {
    key: "specific-case",
    label: "Specific Case",
    sharedId: "2cc1a3fc253111f1868a91828498d495",
  },
] as const;

function AgentIframe({ sharedId }: { sharedId: string }) {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <iframe
        src={`${RAGFLOW_BASE}/agent/share?shared_id=${sharedId}&from=agent&auth=${SHARE_AUTH}&theme=light`}
        className="h-full w-full border-0"
        allow="microphone"
        title="RAGFlow Agent"
      />
      <div className="pointer-events-none absolute top-0 left-0 h-12 w-full bg-white" />
    </div>
  );
}

function ChatPage() {
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-gray-200 px-8 py-5">
        <h1 className="text-xl font-semibold text-gray-900">AI Chat</h1>
        <p className="mt-1 text-sm text-gray-500">
          Interact with case data using natural language queries
        </p>
      </div>

      <div className="flex flex-1 overflow-hidden p-4">
        <Tabs defaultValue="general" className="flex h-full w-full flex-col">
          <TabsList>
            {AGENTS.map((a) => (
              <TabsTrigger key={a.key} value={a.key}>
                {a.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {AGENTS.map((a) => (
            <TabsContent
              key={a.key}
              value={a.key}
              className="mt-4 flex-1 overflow-hidden rounded-lg border border-gray-200"
            >
              <AgentIframe sharedId={a.sharedId} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
