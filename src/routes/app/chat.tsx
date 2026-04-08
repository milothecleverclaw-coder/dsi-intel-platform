import { createFileRoute } from "@tanstack/react-router";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Play,
  Upload,
  FolderPlus,
  Menu,
  FileText,
  Info,
  MessageSquare,
} from "lucide-react";
import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type FormEvent,
  type KeyboardEvent,
  type ChangeEvent,
  type MouseEvent,
} from "react";
import Markdown from "react-markdown";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/app/chat")({
  component: ChatPage,
});

const RAGFLOW_BASE = "https://ragflow.hotserver.uk";
const RAGFLOW_API = `${RAGFLOW_BASE}/api/v1`;
const RAGFLOW_TOKEN = "ragflow-OlzPV-jhtT7tQ6SVTtsXHIuxhIWwqVQ1F6dzHXh7yQk";
const DSI_AGENT_ID = "491d5e9832aa11f195dfeffdd1714b4e";
const USER_ID = "4e804422250811f19e73b999782d6f14";

interface Case {
  id: string;
  name: string;
  datasetId: string;
  agentId: string;
  createdById: string;
  createdAt: string;
}

interface Session {
  id: string;
  title: string;
  created_at?: string;
}

interface Chunk {
  id: string;
  content: string;
  document_id: string;
  document_name: string;
  dataset_id: string;
  similarity: number;
  doc_type: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

type RefsMap = Record<string, Record<string, Chunk>>;

const SESSION_NAMES_KEY = "dsi-session-names";
const SESSION_REFS_KEY = "dsi-session-refs";

function stripCitationTags(text: string): string {
  return text.replace(/\[ID:\d+\]?\s*/g, "");
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

function truncate(str: string, max: number): string {
  const clean = stripHtml(str);
  if (clean.length <= max) return clean;
  return clean.slice(0, max) + "...";
}

function parseCitations(text: string): { idMap: Record<string, number>; ids: string[] } {
  const idMap: Record<string, number> = {};
  const ids: string[] = [];
  // Match [ID:123] or malformed [ID:123 (missing closing bracket)
  const re = /\[ID:(\d+)\]?\s*/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const id = m[1];
    if (!(id in idMap)) {
      idMap[id] = ids.length + 1;
      ids.push(id);
    }
  }
  return { idMap, ids };
}

function renderCitedText(
  text: string,
  idMap: Record<string, number>,
  onCiteClick: (badgeNum: number, anchorEl: HTMLSpanElement) => void,
) {
  if (!Object.keys(idMap).length) return <Markdown>{text}</Markdown>;

  const parts = text.split(/(\[ID:\d+\]?\s*)/);
  const nodes: React.ReactNode[] = [];
  let mdBuf = "";

  for (const part of parts) {
    const m = part.match(/^\[ID:(\d+)\]?\s*$/);
    if (m) {
      if (mdBuf) {
        nodes.push(<Markdown key={`md-${nodes.length}`}>{mdBuf}</Markdown>);
        mdBuf = "";
      }
      const num = idMap[m[1]];
      if (num !== undefined) {
        nodes.push(
          <sup
            key={`cite-${m[1]}`}
            className="ml-0.5 inline-flex cursor-pointer items-center justify-center rounded bg-blue-100 px-1 py-0 text-[10px] leading-none font-semibold text-blue-700 transition-colors hover:bg-blue-200"
            onClick={(e) => {
              e.stopPropagation();
              const el = e.currentTarget as HTMLSpanElement;
              onCiteClick(num, el);
            }}
          >
            {num}
          </sup>,
        );
      }
    } else {
      mdBuf += part;
    }
  }
  if (mdBuf) {
    nodes.push(<Markdown key={`md-last`}>{mdBuf}</Markdown>);
  }
  return nodes;
}

function loadSessionNames(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(SESSION_NAMES_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveSessionName(id: string, name: string) {
  const names = loadSessionNames();
  names[id] = name;
  localStorage.setItem(SESSION_NAMES_KEY, JSON.stringify(names));
}

function removeSessionName(id: string) {
  const names = loadSessionNames();
  delete names[id];
  localStorage.setItem(SESSION_NAMES_KEY, JSON.stringify(names));
}

function loadSessionRefs(): Record<string, Record<string, Chunk>> {
  try {
    return JSON.parse(localStorage.getItem(SESSION_REFS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveSessionRefs(sessionId: string, refs: Record<string, Chunk>) {
  const all = loadSessionRefs();
  all[sessionId] = { ...(all[sessionId] || {}), ...refs };
  localStorage.setItem(SESSION_REFS_KEY, JSON.stringify(all));
}

function removeSessionRefs(sessionId: string) {
  const all = loadSessionRefs();
  delete all[sessionId];
  localStorage.setItem(SESSION_REFS_KEY, JSON.stringify(all));
}

function getSessionTitle(session: Session): string {
  const names = loadSessionNames();
  if (names[session.id]) return names[session.id];
  if (session.title) return session.title;
  return session.id.slice(0, 8) + "...";
}

async function fetchSessions(
  agentId: string,
): Promise<{ sessions: Session[]; messagesMap: Record<string, Message[]> }> {
  try {
    const res = await fetch(
      `${RAGFLOW_API}/agents/${agentId}/sessions?page=1&page_size=50&user_id=${USER_ID}`,
      { headers: { Authorization: `Bearer ${RAGFLOW_TOKEN}` } },
    );
    const data = await res.json();
    if (data.code === 0 && Array.isArray(data.data)) {
      const msgsMap: Record<string, Message[]> = {};
      const sessions = data.data.map((s: Record<string, unknown>) => {
        const id = s.id as string;
        const rawMsgs = (s.messages as Message[] | undefined) || [];
        const filtered = rawMsgs.filter((m, i) => {
          if (
            i === 0 &&
            m.role === "assistant" &&
            /hi!?\s*i'?m\s+(your\s+)?assistant/i.test(m.content)
          )
            return false;
          return true;
        });
        msgsMap[id] = filtered;
        return {
          id,
          title: (s.name as string) || "",
          created_at: s.created_at as string | undefined,
        };
      });
      return { sessions, messagesMap: msgsMap };
    }
  } catch {
    /* ignore */
  }
  return { sessions: [], messagesMap: {} };
}

async function createSession(agentId: string): Promise<Session | null> {
  try {
    const res = await fetch(`${RAGFLOW_API}/agents/${agentId}/sessions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${RAGFLOW_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: USER_ID }),
    });
    const data = await res.json();
    if (data.code === 0 && data.data?.id) return { id: data.data.id, title: "" };
  } catch {
    /* ignore */
  }
  return null;
}

async function deleteSession(agentId: string, sessionId: string): Promise<boolean> {
  try {
    const res = await fetch(`${RAGFLOW_API}/agents/${agentId}/sessions`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${RAGFLOW_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [sessionId] }),
    });
    const data = await res.json();
    return data.code === 0;
  } catch {
    return false;
  }
}

// ── Citation Tooltip ──────────────────────────────────────────────

function CitationTooltip({
  chunk,
  anchorRect,
  onClose,
}: {
  chunk: Chunk;
  anchorRect: DOMRect;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const justOpened = useRef(true);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      justOpened.current = false;
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (justOpened.current) return;
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClick as unknown as EventListener);
    return () => document.removeEventListener("mousedown", handleClick as unknown as EventListener);
  }, [onClose]);

  const style: React.CSSProperties = {
    position: "fixed",
    zIndex: 50,
    maxWidth: 350,
    minWidth: 220,
  };
  const spaceBelow = window.innerHeight - anchorRect.bottom;
  if (spaceBelow > 250) {
    style.top = anchorRect.bottom + 6;
    style.left = Math.min(anchorRect.left, window.innerWidth - 360);
  } else {
    style.bottom = window.innerHeight - anchorRect.top + 6;
    style.left = Math.min(anchorRect.left, window.innerWidth - 360);
  }

  return (
    <div
      ref={ref}
      className="rounded-lg border border-gray-200 bg-white p-3 text-sm shadow-lg"
      style={style}
    >
      <p className="mb-1 text-xs font-semibold break-all text-gray-800">{chunk.document_name}</p>
      <p className="mb-1 text-xs text-blue-600">ความคล้าย: {Math.round(chunk.similarity * 100)}%</p>
      <p className="text-xs leading-relaxed text-gray-600">{truncate(chunk.content, 200)}</p>
    </div>
  );
}

function ReferencePanel({
  chunks,
  idMap,
  onRequestTooltip,
}: {
  chunks: Record<string, Chunk>;
  idMap: Record<string, number>;
  onRequestTooltip: (badgeNum: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const ids = Object.keys(idMap);
  if (!ids.length) return null;

  return (
    <div className="mt-2 rounded-md bg-gray-50 px-2 py-1">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-xs font-medium text-gray-600 transition-colors hover:text-gray-800"
      >
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        <BookOpen className="h-3 w-3" />
        <span>แหล่งอ้างอิง ({ids.length})</span>
      </button>
      {open && (
        <ol className="mt-1 ml-4 list-decimal space-y-0.5">
          {ids.map((id) => {
            const chunk = chunks[id];
            if (!chunk) return null;
            return (
              <li
                key={id}
                className="cursor-pointer text-xs text-gray-600 transition-colors hover:text-blue-600"
                onClick={() => onRequestTooltip(idMap[id])}
              >
                <span className="font-medium">{chunk.document_name}</span>
                <span className="ml-1 text-gray-400">({Math.round(chunk.similarity * 100)}%)</span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

// ── File helpers ──────────────────────────────────────────────────

interface Doc {
  id?: string;
  name: string;
  status: string; // "0"=UNSTART, "1"=DONE, "2"=PARSING, "6"=ERROR
  run: string; // UNSTART | RUNNING | DONE | CANCEL | FAIL
  progress: number | { source?: string; parsedValue?: number }; // 0.0 → 1.0 or object
  progress_msg?: string;
  chunk_count: number;
  size: number;
  create_time: number;
  token_count?: number;
  process_begin_at?: string;
}

function fileIcon(name: string) {
  const s = name.toLowerCase().split(".").pop();
  if (s === "pdf") return "📄";
  if (s === "md") return "📝";
  if (s === "docx" || s === "doc") return "📃";
  if (s === "csv") return "📊";
  if (s === "txt") return "📝";
  return "📎";
}

function statusBadge(doc: Doc) {
  const { run, status, progress_msg } = doc;
  if (run === "DONE")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
        ✅ เสร็จสิ้น
      </span>
    );
  if (run === "RUNNING")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
        ⏳{" "}
        {progress_msg ? progress_msg.split("\n").pop()?.trim() || "กำลังดำเนินการ" : "กำลังดำเนินการ"}
      </span>
    );
  if (run === "FAIL" || status === "6")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
        ❌ ผิดพลาด
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
      ยังไม่ย่อย
    </span>
  );
}

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

function formatDate(ts: string | number) {
  try {
    return new Date(ts).toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return String(ts);
  }
}

// ── Sidebar content (shared between desktop & mobile sheet) ──────

interface SidebarProps {
  cases: Case[];
  caseSessions: Record<string, Session[]>;
  activeCaseId: string | null;
  activeSessionId: string | null;
  expandedCases: Set<string>;
  onToggleCase: (agentId: string) => void;
  onSelectCase: (c: Case) => void;
  onSelectSession: (id: string) => void;
  onNewCase: () => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
}

function SidebarContent({
  cases,
  caseSessions,
  activeCaseId,
  activeSessionId,
  expandedCases,
  onToggleCase,
  onSelectCase,
  onSelectSession,
  onNewCase,
  onNewSession,
  onDeleteSession,
}: SidebarProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="space-y-2 px-3 py-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            คดี
          </span>
          <button
            onClick={onNewCase}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-blue-600"
          >
            <FolderPlus className="h-3.5 w-3.5" />
            สร้างใหม่
          </button>
        </div>
      </div>
      <Separator />
      {/* Cases tree */}
      <div className="flex-1 overflow-y-auto">
        {cases.length === 0 && (
          <p className="px-3 py-4 text-xs text-muted-foreground">กำลังโหลดคดี...</p>
        )}
        {cases.map((c) => {
          const sessions = caseSessions[c.agentId] || [];
          const isExpanded = expandedCases.has(c.agentId);
          const isActive = activeCaseId === c.agentId;
          return (
            <Collapsible key={c.agentId} open={isExpanded}>
              <div className="group flex items-center">
                <CollapsibleTrigger
                  className="flex flex-1 cursor-pointer items-center gap-1.5 px-3 py-2 text-sm transition-colors hover:bg-accent"
                  onClick={() => {
                    onToggleCase(c.agentId);
                    if (!isActive) onSelectCase(c);
                  }}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  )}
                  <span
                    className={`truncate ${isActive ? "font-semibold text-foreground" : "text-muted-foreground"}`}
                  >
                    {c.name}
                  </span>
                </CollapsibleTrigger>
                {c.name !== "default" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm("ต้องการลบคดีนี้และข้อมูลทั้งหมดใช่หรือไม่?")) {
                        fetch(`/api/cases/${c.id}`, { method: "DELETE" })
                          .then((r) => r.json())
                          .then((data) => {
                            if (!data.error) setCases((prev) => prev.filter((x) => x.id !== c.id));
                          });
                      }
                    }}
                    className="shrink-0 rounded p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <CollapsibleContent>
                <div className="ml-3 border-l border-border pl-2">
                  {sessions.map((s) => (
                    <div
                      key={s.id}
                      className={`group relative flex cursor-pointer items-center gap-1.5 rounded-r-md px-2 py-1.5 text-xs transition-colors ${
                        s.id === activeSessionId && isActive
                          ? "bg-primary/10 font-medium text-primary"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                      onClick={() => {
                        if (isActive) onSelectSession(s.id);
                      }}
                    >
                      <MessageSquare className="h-3 w-3 shrink-0" />
                      <span className="flex-1 truncate">{getSessionTitle(s)}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm("ต้องการลบแชทนี้ใช่หรือไม่?")) onDeleteSession(s.id);
                        }}
                        className="shrink-0 rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {sessions.length === 0 && (
                    <p className="px-2 py-1.5 text-xs text-muted-foreground/60">ยังไม่มีแชท</p>
                  )}
                  <button
                    onClick={() => {
                      if (!isActive) onSelectCase(c);
                      onNewSession();
                    }}
                    className="flex items-center gap-1 px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:text-blue-600"
                  >
                    <Plus className="h-3 w-3" />
                    แชทใหม่
                  </button>
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
}

// ── Files Tab ─────────────────────────────────────────────────────

function FilesTab({ datasetId }: { datasetId: string }) {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocs = useCallback(async () => {
    if (!datasetId) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(
        `${RAGFLOW_API}/datasets/${datasetId}/documents?page=1&page_size=50`,
        { headers: { Authorization: `Bearer ${RAGFLOW_TOKEN}` } },
      );
      const data = await res.json();
      if (data.code === 0) {
        setDocs(data.data.docs || []);
        setTotal(data.data.total || 0);
      }
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, [datasetId]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  useEffect(() => {
    const hasParsing = docs.some((d) => d.run === "RUNNING");
    if (!hasParsing) return;
    const id = setInterval(fetchDocs, 5000);
    return () => clearInterval(id);
  }, [docs, fetchDocs]);

  async function handleUpload(files: FileList | null) {
    if (!files || !files.length || !datasetId) return;
    setUploading(true);
    let uploadCount = 0;
    for (const file of Array.from(files)) {
      const form = new FormData();
      form.append("file", file);
      try {
        await fetch(`${RAGFLOW_API}/datasets/${datasetId}/documents`, {
          method: "POST",
          headers: { Authorization: `Bearer ${RAGFLOW_TOKEN}` },
          body: form,
        });
        uploadCount++;
      } catch {
        /* ignore */
      }
    }
    if (uploadCount > 0) {
      // Wait for docs to register, then parse all UNSTART docs
      await new Promise((r) => setTimeout(r, 3000));
      const listRes = await fetch(
        `${RAGFLOW_API}/datasets/${datasetId}/documents?page=1&page_size=100`,
        { headers: { Authorization: `Bearer ${RAGFLOW_TOKEN}` } },
      );
      const listData = await listRes.json();
      if (listData.code === 0) {
        const unstartIds = (listData.data.docs || [])
          .filter((d: any) => d.run === "UNSTART")
          .map((d: any) => d.id);
        if (unstartIds.length > 0) {
          await fetch(`${RAGFLOW_API}/datasets/${datasetId}/chunks`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${RAGFLOW_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ document_ids: unstartIds }),
          });
        }
      }
    }
    setUploading(false);
    fetchDocs();
  }

  async function handleParseAll() {
    if (!datasetId) return;
    setParsing(true);
    try {
      const listRes = await fetch(
        `${RAGFLOW_API}/datasets/${datasetId}/documents?page=1&page_size=100`,
        { headers: { Authorization: `Bearer ${RAGFLOW_TOKEN}` } },
      );
      const listData = await listRes.json();
      if (listData.code === 0) {
        const allIds = (listData.data.docs || []).map((d: any) => d.id);
        if (allIds.length > 0) {
          console.log(
            `[FilesTab] POST /api/v1/datasets/${datasetId}/chunks →`,
            JSON.stringify({ document_ids: allIds }),
          );
          await fetch(`${RAGFLOW_API}/datasets/${datasetId}/chunks`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${RAGFLOW_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ document_ids: allIds }),
          });
          await new Promise((r) => setTimeout(r, 2000));
          fetchDocs();
        }
      }
    } catch {
      /* ignore */
    }
    setParsing(false);
  }

  if (!datasetId) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        เลือกคดีเพื่อดูไฟล์
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.md,.docx,.txt,.csv"
        multiple
        className="hidden"
        onChange={(e) => handleUpload(e.target.files)}
      />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-3 py-4 md:px-4">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">📁 เอกสาร</h2>
              <p className="mt-0.5 text-sm text-gray-500">{total} เอกสาร</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleParseAll}
                disabled={parsing}
                className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
              >
                <Play className="h-4 w-4" />
                {parsing ? "กำลัง parse..." : "ย่อยทั้งหมด"}
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                {uploading ? "กำลังอัปโหลด..." : "อัปโหลด"}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-lg border border-gray-200 bg-white p-3"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded bg-gray-200" />
                    <div className="h-4 w-48 rounded bg-gray-200" />
                  </div>
                  <div className="mt-2 flex gap-3">
                    <div className="h-3 w-20 rounded bg-gray-200" />
                    <div className="h-3 w-14 rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : docs.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">ยังไม่มีเอกสาร</p>
          ) : (
            <div className="space-y-2">
              {docs.map((doc, i) => (
                <div
                  key={doc.id || i}
                  className="group rounded-lg border border-gray-200 bg-white p-3 transition-shadow hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="shrink-0 text-lg">{fileIcon(doc.name)}</span>
                      <span className="truncate text-sm font-medium text-gray-900">{doc.name}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {statusBadge(doc)}
                      <button
                        onClick={() => {
                          if (window.confirm("ต้องการลบเอกสารนี้ใช่หรือไม่?")) {
                            fetch(`${RAGFLOW_API}/datasets/${datasetId}/documents`, {
                              method: "DELETE",
                              headers: {
                                Authorization: `Bearer ${RAGFLOW_TOKEN}`,
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({ ids: [doc.id] }),
                            }).then(() => {
                              setDocs((prev) => prev.filter((d) => d.id !== doc.id));
                              setTotal((prev) => prev - 1);
                            });
                          }
                        }}
                        className="rounded p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-gray-400" />
                      </button>
                    </div>
                  </div>
                  {doc.run === "RUNNING" && (
                    <div className="mt-2">
                      <div className="mb-0.5 flex justify-end">
                        <span className="text-xs font-medium text-yellow-600">
                          {Math.round(
                            (typeof doc.progress === "number"
                              ? doc.progress
                              : Number(doc.progress?.source || 0)) * 100,
                          )}
                          %
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-yellow-500 transition-all duration-500"
                          style={{
                            width: `${Math.round((typeof doc.progress === "number" ? doc.progress : Number(doc.progress?.source || 0)) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                  <div className="mt-1.5 flex items-center gap-3 text-xs text-gray-500">
                    {doc.chunk_count != null && <span>{doc.chunk_count} chunks</span>}
                    <span>{formatSize(doc.size)}</span>
                    <span>{formatDate(doc.create_time)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Info Tab ──────────────────────────────────────────────────────

function InfoTab({ activeCase }: { activeCase: Case | null }) {
  if (!activeCase) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        เลือกคดีเพื่อดูข้อมูล
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl px-3 py-4 md:px-4">
        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Info className="h-5 w-5 text-blue-600" />
              {activeCase.name}
            </h2>
          </div>
          <Separator />
          <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div>
              <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                ชื่อคดี
              </span>
              <p className="mt-1 text-gray-900">{activeCase.name}</p>
            </div>
            <div>
              <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                วันที่สร้าง
              </span>
              <p className="mt-1 text-gray-900">{formatDate(activeCase.createdAt)}</p>
            </div>
            <div>
              <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Agent ID
              </span>
              <p className="mt-1 font-mono text-xs break-all text-gray-500">{activeCase.agentId}</p>
            </div>
            <div>
              <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Dataset ID
              </span>
              <p className="mt-1 font-mono text-xs break-all text-gray-500">
                {activeCase.datasetId}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Chat Page ────────────────────────────────────────────────

function ChatPage() {
  // Cases
  const [cases, setCases] = useState<Case[]>([]);
  const [activeCase, setActiveCase] = useState<Case | null>(null);
  const [expandedCases, setExpandedCases] = useState<Set<string>>(new Set());
  const [caseSessions, setCaseSessions] = useState<Record<string, Session[]>>({});

  // Sessions (for active case)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>({});
  const [refsMap, setRefsMap] = useState<RefsMap>({});
  const [initLoading, setInitLoading] = useState(true);

  // Chat input
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const typingMessages = [
    "กำลังวิเคราะห์เอกสาร...",
    "กำลังตรวจสอบหลักฐาน...",
    "กำลังเรียบเรียงข้อมูล...",
    "กำลังสืบสวน...",
    "กำลังจัดทำรายงาน...",
    "กำลังวิเคราะห์คดี...",
    "กำลังเปรียบเทียบเอกสาร...",
    "กำลังสรุปข้อเท็จจริง...",
  ];
  const [typingMsg, setTypingMsg] = useState("");

  // Tooltip
  const [tooltip, setTooltip] = useState<{ chunk: Chunk; rect: DOMRect } | null>(null);

  // Create case modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCaseName, setNewCaseName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // Upload
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mobile sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeAgentId = activeCase?.agentId || DSI_AGENT_ID;
  const activeDatasetId = activeCase?.datasetId || "";
  const sessions = caseSessions[activeAgentId] || [];
  const messages = activeSessionId ? messagesMap[activeSessionId] || [] : [];

  // Load cases
  const loadCases = useCallback(async () => {
    try {
      const res = await fetch("/api/cases");
      const data = await res.json();
      if (Array.isArray(data)) {
        setCases(data);
        // If no active case, pick first or default
        return data;
      }
    } catch {
      /* ignore */
    }
    return [];
  }, []);

  // Load sessions for a given agent
  const loadSessions = useCallback(async (agentId: string) => {
    const { sessions: s, messagesMap: m } = await fetchSessions(agentId);
    setCaseSessions((prev) => ({ ...prev, [agentId]: s }));
    setMessagesMap((prev) => ({ ...prev, ...m }));
    setRefsMap(loadSessionRefs());
  }, []);

  // Init
  useEffect(() => {
    (async () => {
      const data = await loadCases();
      if (data.length > 0 && !activeCase) {
        setActiveCase(data[0]);
        setExpandedCases(new Set([data[0].agentId]));
        await loadSessions(data[0].agentId);
      }
      setInitLoading(false);
    })();
  }, []);

  // Load sessions when active case changes
  useEffect(() => {
    if (activeCase) {
      setInitLoading(true);
      setActiveSessionId(null);
      loadSessions(activeCase.agentId).then(() => setInitLoading(false));
    }
  }, [activeCase?.agentId]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function autoResize(e: ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 80) + "px";
  }

  async function handleNewSession() {
    const session = await createSession(activeAgentId);
    if (session) {
      setCaseSessions((prev) => ({
        ...prev,
        [activeAgentId]: [session, ...(prev[activeAgentId] || [])],
      }));
      setActiveSessionId(session.id);
      setMessagesMap((prev) => ({ ...prev, [session.id]: [] }));
      setRefsMap((prev) => ({ ...prev, [session.id]: {} }));
      setInput("");
      setSidebarOpen(false);
    }
  }

  async function handleDeleteSession(id: string) {
    const ok = await deleteSession(activeAgentId, id);
    if (ok) {
      removeSessionName(id);
      removeSessionRefs(id);
      setCaseSessions((prev) => ({
        ...prev,
        [activeAgentId]: (prev[activeAgentId] || []).filter((s) => s.id !== id),
      }));
      setMessagesMap((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setRefsMap((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      if (activeSessionId === id) setActiveSessionId(null);
    }
  }

  function handleSelectCase(c: Case) {
    if (c.agentId === activeCase?.agentId) return;
    setActiveCase(c);
    setExpandedCases((prev) => new Set([...prev, c.agentId]));
    setSidebarOpen(false);
  }

  function handleToggleCase(agentId: string) {
    setExpandedCases((prev) => {
      const next = new Set(prev);
      if (next.has(agentId)) next.delete(agentId);
      else next.add(agentId);
      return next;
    });
  }

  function showTooltipForBadge(badgeNum: number) {
    if (!activeSessionId) return;
    const sessionRefs = refsMap[activeSessionId] || {};
    const { idMap } = parseCitations(
      messages
        .filter((m) => m.role === "assistant")
        .map((m) => m.content)
        .join(" "),
    );
    const chunkId = Object.entries(idMap).find(([, num]) => num === badgeNum)?.[0];
    if (!chunkId || !sessionRefs[chunkId]) return;
    const chunk = sessionRefs[chunkId];
    const allSup = document.querySelectorAll("sup");
    let targetEl: Element | null = null;
    for (const el of allSup) {
      if (el.textContent?.trim() === String(badgeNum)) {
        targetEl = el;
        break;
      }
    }
    if (targetEl) {
      const rect = targetEl.getBoundingClientRect();
      setTooltip({ chunk, rect });
    }
  }

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    const question = input.trim();
    if (!question || loading || !activeSessionId) return;

    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const isFirst = !(messagesMap[activeSessionId] || []).length;
    if (isFirst) {
      const title = question.slice(0, 30) + (question.length > 30 ? "..." : "");
      saveSessionName(activeSessionId, title);
      setCaseSessions((prev) => ({
        ...prev,
        [activeAgentId]: (prev[activeAgentId] || []).map((s) =>
          s.id === activeSessionId && !s.title ? { ...s, title } : s,
        ),
      }));
    }

    const userMsg: Message = { role: "user", content: question };
    const placeholderMsg: Message = { role: "assistant", content: "" };

    setMessagesMap((prev) => ({
      ...prev,
      [activeSessionId]: [...(prev[activeSessionId] || []), userMsg, placeholderMsg],
    }));
    setLoading(true);
    setTypingMsg(typingMessages[Math.floor(Math.random() * typingMessages.length)]);

    try {
      const res = await fetch(`${RAGFLOW_API}/agents/${activeAgentId}/completions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${RAGFLOW_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: activeSessionId, question, stream: false }),
      });

      const json = await res.json();
      const content =
        json?.data?.data?.content ||
        json?.data?.content ||
        json?.data?.answer ||
        "ไม่สามารถดึงข้อมูลได้";

      setMessagesMap((prev) => {
        const msgs = [...(prev[activeSessionId] || [])];
        msgs[msgs.length - 1] = { role: "assistant", content };
        return { ...prev, [activeSessionId]: msgs };
      });

      // Save reference chunks
      const refChunks = json?.data?.data?.reference?.chunks || json?.data?.reference?.chunks;
      if (refChunks) {
        const parsed = refChunks as Record<string, Chunk>;
        setRefsMap((prev) => ({
          ...prev,
          [activeSessionId]: { ...(prev[activeSessionId] || {}), ...parsed },
        }));
        saveSessionRefs(activeSessionId, parsed);
      }
    } catch {
      setMessagesMap((prev) => {
        const msgs = [...(prev[activeSessionId] || [])];
        msgs[msgs.length - 1] = { role: "assistant", content: "เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่" };
        return { ...prev, [activeSessionId]: msgs };
      });
    }
    setLoading(false);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e as unknown as FormEvent);
    }
  }

  async function handleCreateCase() {
    const name = newCaseName.trim();
    if (!name) return;
    setCreating(true);
    setCreateError("");
    try {
      const res = await fetch("/api/cases/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (data && data.agentId) {
        setCases((prev) => [...prev, data]);
        handleSelectCase(data);
        setShowCreateModal(false);
        setNewCaseName("");
      } else {
        setCreateError(data.error || "ไม่สามารถสร้างคดีได้");
      }
    } catch {
      setCreateError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
    setCreating(false);
  }

  async function handleSidebarUpload(files: FileList | null) {
    if (!files || !files.length || !activeDatasetId) return;
    setUploading(true);
    let uploadCount = 0;
    for (const file of Array.from(files)) {
      const form = new FormData();
      form.append("file", file);
      try {
        await fetch(`${RAGFLOW_API}/datasets/${activeDatasetId}/documents`, {
          method: "POST",
          headers: { Authorization: `Bearer ${RAGFLOW_TOKEN}` },
          body: form,
        });
        uploadCount++;
      } catch {
        /* ignore */
      }
    }
    if (uploadCount > 0) {
      // Wait for docs to register, then parse all UNSTART docs
      await new Promise((r) => setTimeout(r, 3000));
      const listRes = await fetch(
        `${RAGFLOW_API}/datasets/${activeDatasetId}/documents?page=1&page_size=100`,
        { headers: { Authorization: `Bearer ${RAGFLOW_TOKEN}` } },
      );
      const listData = await listRes.json();
      if (listData.code === 0) {
        const unstartIds = (listData.data.docs || [])
          .filter((d: any) => d.run === "UNSTART")
          .map((d: any) => d.id);
        if (unstartIds.length > 0) {
          await fetch(`${RAGFLOW_API}/datasets/${activeDatasetId}/chunks`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${RAGFLOW_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ document_ids: unstartIds }),
          });
        }
      }
    }
    setUploading(false);
  }

  const sidebarProps: SidebarProps = {
    cases,
    caseSessions,
    activeCaseId: activeCase?.agentId || null,
    activeSessionId,
    expandedCases,
    onToggleCase: handleToggleCase,
    onSelectCase: handleSelectCase,
    onSelectSession: setActiveSessionId,
    onNewCase: () => setShowCreateModal(true),
    onNewSession: handleNewSession,
    onDeleteSession: handleDeleteSession,
  };

  return (
    <div className="flex h-full bg-white">
      {/* Desktop sidebar */}
      <div className="hidden w-64 shrink-0 flex-col border-r border-border bg-card md:flex">
        <SidebarContent {...sidebarProps} />
      </div>

      {/* Mobile sidebar sheet */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader>
            <SheetTitle className="px-3 pt-3 text-sm font-semibold">
              {activeCase?.name ?? "ประจักษ์ AI"}
            </SheetTitle>
            <SheetDescription className="sr-only">Cases and chat sessions</SheetDescription>
          </SheetHeader>
          <SidebarContent {...sidebarProps} />
        </SheetContent>
      </Sheet>

      {/* Hidden file input for sidebar upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.md,.docx,.txt,.csv"
        multiple
        className="hidden"
        onChange={(e) => handleSidebarUpload(e.target.files)}
      />

      {/* Main panel */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2">
          <button
            onClick={() => setSidebarOpen(true)}
            className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-accent md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-semibold">{activeCase?.name ?? "ประจักษ์ AI"}</span>
          {activeCase && (
            <Badge variant="secondary" className="ml-auto hidden text-xs sm:inline-flex">
              {activeCase.name}
            </Badge>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="chat" className="flex min-h-0 flex-1 flex-col">
          <TabsList className="mx-3 mt-2 shrink-0" variant="line">
            <TabsTrigger value="chat">
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">สนทนา</span>
            </TabsTrigger>
            <TabsTrigger value="files">
              <FileText className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">ไฟล์</span>
            </TabsTrigger>
            <TabsTrigger value="info">
              <Info className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">ข้อมูล</span>
            </TabsTrigger>
          </TabsList>

          {/* Chat tab */}
          <TabsContent value="chat" className="flex min-h-0 flex-col">
            {initLoading ? (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-sm text-muted-foreground">กำลังโหลด...</p>
              </div>
            ) : !activeSessionId ? (
              <div className="flex flex-1 items-center justify-center py-20">
                <div className="text-center">
                  <p className="mb-3 text-sm text-gray-400">เลือกแชทหรือสร้างแชทใหม่</p>
                  <button
                    onClick={handleNewSession}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    แชทใหม่
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-3 pb-2 md:px-4">
                  <div className="mx-auto max-w-3xl space-y-4">
                    {messages.length === 0 && (
                      <div className="flex h-full items-center justify-center py-20 text-gray-400">
                        <p className="text-sm">สวัสดี ถามอะไรก็ได้เกี่ยวกับคดี</p>
                      </div>
                    )}
                    {messages.map((msg, i) => {
                      const isAssistant = msg.role === "assistant";
                      const sessionRefs = activeSessionId ? refsMap[activeSessionId] || {} : {};
                      const { idMap } = parseCitations(msg.content);
                      const hasCitations =
                        Object.keys(idMap).length > 0 && Object.keys(sessionRefs).length > 0;
                      return (
                        <div
                          key={i}
                          className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-lg px-3 py-2 text-sm md:max-w-[70%] ${
                              msg.role === "user"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-900"
                            }`}
                          >
                            {isAssistant ? (
                              <div className="prose prose-sm max-w-none">
                                {!msg.content.trim() && loading ? (
                                  <span className="flex items-center gap-1 text-gray-400">
                                    <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-gray-400" />
                                    <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-gray-300 [animation-delay:150ms]" />
                                    <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-gray-200 [animation-delay:300ms]" />
                                    <span className="ml-1">{typingMsg}</span>
                                  </span>
                                ) : hasCitations ? (
                                  renderCitedText(msg.content, idMap, (badgeNum, el) => {
                                    const chunkId = Object.entries(idMap).find(
                                      ([, n]) => n === badgeNum,
                                    )?.[0];
                                    if (!chunkId || !sessionRefs[chunkId]) return;
                                    setTooltip({
                                      chunk: sessionRefs[chunkId],
                                      rect: el.getBoundingClientRect(),
                                    });
                                  })
                                ) : (
                                  <Markdown>{msg.content}</Markdown>
                                )}
                                {hasCitations && (
                                  <ReferencePanel
                                    chunks={sessionRefs}
                                    idMap={idMap}
                                    onRequestTooltip={showTooltipForBadge}
                                  />
                                )}
                              </div>
                            ) : (
                              msg.content
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={bottomRef} />
                  </div>
                </div>

                {tooltip && (
                  <CitationTooltip
                    chunk={tooltip.chunk}
                    anchorRect={tooltip.rect}
                    onClose={() => setTooltip(null)}
                  />
                )}

                <div
                  className="shrink-0 border-t border-gray-200 px-3 py-3 md:px-4"
                  style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
                >
                  <form onSubmit={handleSend} className="mx-auto flex max-w-3xl gap-2">
                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={autoResize}
                      onKeyDown={handleKeyDown}
                      placeholder="พิมพ์ข้อความ..."
                      className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      rows={1}
                      disabled={loading}
                    />
                    <button
                      type="submit"
                      disabled={loading || !input.trim()}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? "..." : "ส่ง"}
                    </button>
                  </form>
                </div>
              </>
            )}
          </TabsContent>

          {/* Files tab */}
          <TabsContent value="files" className="min-h-0">
            <FilesTab datasetId={activeDatasetId} />
          </TabsContent>

          {/* Info tab */}
          <TabsContent value="info" className="min-h-0">
            <InfoTab activeCase={activeCase} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Case Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              setShowCreateModal(false);
              setNewCaseName("");
              setCreateError("");
            }}
          />
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">สร้างคดีใหม่</h3>
            <input
              value={newCaseName}
              onChange={(e) => setNewCaseName(e.target.value)}
              placeholder="เช่น คดีฉ้อโกงที่ดินชลบุรี"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateCase();
              }}
            />
            {createError && <p className="mt-2 text-sm text-red-600">{createError}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewCaseName("");
                  setCreateError("");
                }}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleCreateCase}
                disabled={creating || !newCaseName.trim()}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {creating ? "กำลังสร้าง..." : "สร้าง"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
