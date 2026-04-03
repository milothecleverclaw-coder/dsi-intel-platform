# DSI Intelligence Platform

> Case management and intelligence tools for the Department of Special Investigation (DSI), Thailand.

**Live:** [https://dsi.hotserver.uk/app](https://dsi.hotserver.uk/app)

---

## 📁 Repository Structure

```
dsi-intel-platform/
├── src/                          # Application source code
│   ├── routes/                   # TanStack Router pages
│   │   ├── index.tsx             # Landing page
│   │   ├── app/                  # Main app (sidebar layout)
│   │   │   ├── route.tsx         # App shell (sidebar + header)
│   │   │   ├── index.tsx         # Dashboard
│   │   │   ├── chat.tsx          # AI Chat (RAGFlow integration)
│   │   │   ├── cases.tsx         # Case management
│   │   │   ├── reports.tsx       # Report generation (ตร.1, ตร.2, ส.ป.อ.)
│   │   │   └── settings.tsx      # Settings
│   │   ├── __root.tsx            # Root layout
│   │   └── api/                  # API routes
│   ├── components/               # React components
│   │   └── ui/                   # shadcn/ui components
│   └── lib/                      # Utilities and shared code
│
├── mock-case-data/               # Mock case files for development & RAGFlow
│   └── mock-case-dsi-2026-sb-042/
│       ├── 00_CASE_OVERVIEW.md
│       ├── 01_GROUND_TRUTH.md
│       ├── 02_PERSONAS/          # 7 persona files (suspects, witnesses)
│       ├── 03_EVIDENCE/          # Evidence documents
│       │   ├── cctv/             # CCTV footage logs
│       │   ├── phone/            # Phone intercept logs
│       │   └── receipts/         # Financial records
│       ├── 04_POLICE/            # Police reports
│       └── README.md
│
├── public/                       # Static assets
├── package.json                  # Dependencies
├── vite.config.ts                # Vite configuration
├── drizzle.config.ts             # Database schema (Drizzle ORM)
├── DEV-PLAN.md                   # Development roadmap
└── docker-compose.yml            # Local development services
```

---

## 🛠 Tech Stack

| Layer      | Technology                                                                                                       |
| ---------- | ---------------------------------------------------------------------------------------------------------------- |
| Framework  | [TanStack Start](https://tanstack.com/start) (React 19 + React Compiler)                                         |
| Routing    | [TanStack Router](https://tanstack.com/router)                                                                   |
| UI         | [shadcn/ui](https://ui.shadcn.com/) + [Base UI](https://base-ui.com/) + [Tailwind CSS](https://tailwindcss.com/) |
| Database   | [Drizzle ORM](https://orm.drizzle.team/) + PostgreSQL                                                            |
| AI Backend | [RAGFlow](https://ragflow.io/) (Qwen3 8B via OpenRouter)                                                         |
| Hosting    | DigitalOcean sgp1 + Cloudflare Tunnel                                                                            |

---

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start dev server (port 3000)
pnpm dev
```

---

## 📋 Features (Current)

- ✅ Dashboard with case stats and activity feed
- ✅ Chat interface (RAGFlow integration pending)
- ✅ Case management (mock data)
- ✅ Report generation stubs
- ✅ Settings page
- ✅ Responsive sidebar layout
- ✅ Dark/light theme toggle

## 📋 Roadmap

- [ ] RAGFlow chat integration (embedding model + knowledge base)
- [ ] Thai police report automation (ตร.1, ตร.2, ส.ป.อ.)
- [ ] Better Auth integration for user management
- [ ] Production build and deployment
- [ ] Thai font optimization (Sarabun)

---

## 📊 Mock Case Data

The `mock-case-data/` directory contains a simulated DSI investigation case (DSI-2026-SB-042) with:

- **7 personas** — suspects, witnesses, and officers
- **13+ evidence files** — CCTV logs, phone intercepts, financial records
- **6 police reports** — raid, arrest, interrogation, closure
- **Case overview and ground truth** — for testing AI analysis accuracy

This data is used for development and as the initial RAGFlow knowledge base.

---

_Built on [TanStarter](https://github.com/mugnavo/tanstarter) by the DSI/Oboon team._
