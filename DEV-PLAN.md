# DSI Intelligence Platform — Development Plan

## Overview

Internal intelligence platform for the Department of Special Investigation (DSI), Thailand. Built on TanStack Start (React 19, React Compiler) with shadcn/ui + Tailwind CSS, Better Auth, and Drizzle ORM.

**Project:** `/home/node/.openclaw/workspace/dsi-intel-platform`
**Domain:** `https://dsi.hotserver.uk/app`
**Tunnel:** `dsi-tunnel` (ID: `a305fa21-0fc4-4dc3-8878-5ab358aa02cd`)
**Infra:** DigitalOcean sgp1 → Cloudflare Tunnel → Cloudflare Access (3 whitelisted emails)

---

## Phase 1 — Core UI & Navigation ✅ (Done)

### Layout

- Landing page (`/`) with branding + 3 feature cards
- App shell (`/app`) with sidebar navigation
- Responsive sidebar: 256px fixed left, collapsible on mobile
- Pages: AI Chat, Cases, Settings

### Components

- Sidebar: Shield logo + "DSI Intel" branding, nav links, sign out
- Page header bar with title + description
- Card-based layouts (Cases page)
- Placeholder content for unimplemented features

### Design System

- shadcn/ui component library (Button, Card, Badge, Input, etc.)
- CSS variable-based theming (`bg-background`, `text-foreground`, `bg-card`, `border`)
- Monochrome base, extensible to dark mode
- Sarabun Thai font support (pending)

---

## Phase 2 — Dark Mode & Thai Font

### Dark Mode

- Implement monochrome grayscale dark theme (strict, no color)
- CSS variable toggle: `data-theme="dark"` on `<html>`
- Persist preference in localStorage
- shadcn/ui dark mode support via Tailwind `dark:` variants
- All components must pass contrast checks in both themes

### Sarabun Thai Font

- Add Google Font: Sarabun (weights: 300, 400, 600, 700)
- Fallback: `'Sarabun', sans-serif`
- Apply globally in Tailwind config
- Test rendering of Thai text: ตร.1, ตร.2, ส.ป.อ., case descriptions

---

## Phase 3 — Case Management

### Case List (`/app/cases`)

- Replace mock data with Drizzle ORM + database
- Case schema: id, caseNumber, title, description, priority (high/medium/low), status (open/investigating/closed), createdAt, updatedAt, assignedOfficer
- Filter by priority, status, search by title/case number
- Pagination (20 per page)
- Sort by date, priority, status

### Case Detail (`/app/cases/:id`)

- Full case view: all fields + timeline
- Case notes (add/edit/delete)
- Document attachments (upload/view)
- Status change workflow (open → investigating → closed)
- Per-case AI chat (see Phase 4)

### Database Schema (Drizzle ORM)

```sql
cases (id, case_number, title, description, priority, status, assigned_officer, created_at, updated_at)
case_notes (id, case_id, content, author_id, created_at)
case_documents (id, case_id, filename, file_url, uploaded_at)
```

---

## Phase 4 — RAGFlow AI Chat Integration

### RAGFlow Instance

- **Server:** `146.190.92.75` (DigitalOcean sgp1)
- **API Base:** `http://146.190.92.75/api/v1`
- **Chat Model:** Qwen3 8B via OpenRouter (configured)
- **Embedding Model:** TBD (needs configuration in RAGFlow)
- **Language:** Thai + English

### Integration Architecture

```
DSI App UI → API Route (/api/chat) → RAGFlow API → LLM Response
                                     → Vector DB (embeddings)
```

### Features

1. **Global Chat** (`/app`) — Ask questions across all cases
   - Conversational interface with message history
   - Streaming responses via SSE
   - Source citation (which documents/cases were referenced)

2. **Per-Case Chat** (`/app/cases/:id/chat`) — Context scoped to one case
   - Auto-includes case documents in RAG context
   - Suggested questions based on case type
   - Chat history persisted per case

3. **Chat UI Components**
   - Message list with user/assistant bubbles
   - Typing indicator for streaming
   - Source cards (clickable references to case documents)
   - Input bar with send button + Enter to submit
   - Markdown rendering for AI responses

### API Routes

- `POST /api/chat` — Send message, returns streamed response
- `GET /api/chat/history` — Get conversation history
- `POST /api/chat/cases/:id` — Send case-scoped message
- `GET /api/chat/cases/:id/history` — Get case chat history

### RAGFlow Configuration Needed

- [ ] Configure embedding model (recommended: multilingual-e5 or Thai-specific)
- [ ] Create dataset for DSI case documents
- [ ] Create chatbot/assistant with case dataset linked
- [ ] Test Thai language query + retrieval quality

---

## Phase 5 — Authentication (Better Auth)

### Setup

- Better Auth with email/password + OAuth (Google)
- Database-backed sessions (Drizzle)
- Role-based access: admin, officer, viewer

### Auth Schema

```sql
users (id, name, email, role, created_at)
sessions (id, user_id, token, expires_at)
accounts (id, user_id, provider, provider_account_id)
```

### Flows

- Login page (`/login`) — email + password
- Registration (admin-invite only)
- Password reset via email
- Session management in Settings page
- Cloudflare Access remains as outer gate (3 whitelisted emails)

---

## Phase 6 — Report Builder

### Thai Police Forms

- **ตร.1** (Moi Tor 1) — Complaint/Notification Form
- **ตร.2** (Moi Tor 2) — Investigation Report
- **ส.ป.อ.** (Sor Por Or) — Arrest Warrant Request

### Features

- Pre-fill from case data (case number, dates, parties involved)
- AI-assisted drafting (RAGFlow generates draft from case notes)
- Template editor with field mapping
- PDF export (Thai fonts embedded)
- Print-ready layout matching official form format

### Implementation

- PDF generation: `@react-pdf/renderer` or `puppeteer`
- Template data binding from case schema
- Review/approve workflow before export

---

## Phase 7 — Analytics & Intelligence

### Features (Future)

- Case pattern detection (link analysis between cases)
- Timeline visualization
- Geographic mapping of case locations
- Keyword/trend analysis across cases
- Dashboard with KPIs (open cases, avg resolution time, etc.)

---

## Phase 8 — Production Deployment

### Steps

1. Build: `pnpm build` → static + server output
2. Dockerize: Node.js container with `.output/server`
3. Deploy to DigitalOcean sgp1 droplet
4. Replace dev server with production build
5. Set up PM2/systemd for process management
6. Persistent Cloudflare Tunnel (systemd service)
7. SSL handled by Cloudflare (no cert needed on origin)
8. Environment variables: RAGFlow URL, DB connection, auth secrets

### Monitoring

- Uptime check on `dsi.hotserver.uk`
- Cloudflare Tunnel health metrics
- Application error tracking (Sentry or similar)

---

## Current Status Summary

| Phase                    | Status         | Priority             |
| ------------------------ | -------------- | -------------------- |
| 1. Core UI & Navigation  | ✅ Done        | —                    |
| 2. Dark Mode & Thai Font | 🔲 Not started | High                 |
| 3. Case Management       | 🔲 Not started | High                 |
| 4. RAGFlow AI Chat       | 🔲 Not started | High                 |
| 5. Authentication        | 🔲 Not started | Medium               |
| 6. Report Builder        | 🔲 Not started | Medium               |
| 7. Analytics             | 🔲 Not started | Low                  |
| 8. Production Deploy     | 🔲 Not started | High (after Phase 4) |
