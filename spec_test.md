# DSI Intelligence Platform — Build Specification

> Pass this file to Claude Code to guide implementation

-----

## Project Overview

A self-hosted, air-gapped AI-powered intelligence platform for DSI Thailand (Department of Special Investigation). Allows analysts to chat with historical case reports, detect pre-incident patterns, and visualize entity networks across cases.

**Core constraints:**

- All data stays on-premise (no external API calls in production)
- Thai language first (Typhoon2 LLM)
- Role-based access control
- Full audit trail on all actions
- Docker Compose deployment

-----

## Repository Structure

```
dsi-platform/
├── docker-compose.yml
├── docker-compose.dev.yml
├── .env.example
├── services/
│   ├── api/                    # FastAPI backend
│   │   ├── Dockerfile
│   │   ├── main.py
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── documents.py
│   │   │   ├── chat.py
│   │   │   ├── alerts.py
│   │   │   ├── patterns.py
│   │   │   └── graph.py
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── document.py
│   │   │   ├── alert.py
│   │   │   └── pattern.py
│   │   ├── services/
│   │   │   ├── ragflow.py      # RAGFlow API client
│   │   │   ├── langgraph.py    # Pattern detection trigger
│   │   │   └── graphiti.py     # Graph queries (Phase 3)
│   │   └── middleware/
│   │       ├── auth.py
│   │       └── audit.py
│   ├── pattern-engine/         # LangGraph service
│   │   ├── Dockerfile
│   │   ├── main.py
│   │   ├── graph/
│   │   │   ├── workflow.py     # LangGraph pipeline
│   │   │   ├── nodes/
│   │   │   │   ├── extractor.py
│   │   │   │   ├── matcher.py
│   │   │   │   ├── scorer.py
│   │   │   │   └── alerter.py
│   │   │   └── state.py
│   │   └── skills/
│   │       ├── extract_entities.md
│   │       ├── score_pattern.md
│   │       └── generate_alert.md
│   └── frontend/               # Next.js app
│       ├── Dockerfile
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   ├── (auth)/
│       │   │   └── login/
│       │   └── (dashboard)/
│       │       ├── chat/
│       │       ├── documents/
│       │       ├── alerts/
│       │       ├── patterns/
│       │       └── graph/
│       └── components/
│           ├── chat/
│           ├── alerts/
│           ├── graph/
│           └── ui/
├── migrations/                 # PostgreSQL migrations
└── scripts/
    ├── seed_patterns.py        # Seed initial incident patterns
    └── healthcheck.sh
```

-----

## Phase 1 — “Find It Fast”

### Goal

Replace manual report searching with instant Thai-language RAG chat over historical documents.

### Timeline

6-8 weeks

### Features to Build

#### 1. Authentication & Users

- JWT-based login/logout
- Two roles: `admin`, `analyst`
- Admin creates/manages user accounts
- Password hashing (bcrypt)
- Session expiry (8 hours)
- Failed login attempt limiting

#### 2. Document Management

- Upload single or batch files (PDF, Word, Excel)
- Files stored in Minio, metadata in PostgreSQL
- Auto-trigger RAGFlow ingestion on upload
- Tag documents on upload:
  - `location` (province/district)
  - `date` (incident date)
  - `incident_type` (explosive/surveillance/other)
  - `source` (officer_report/checkpoint/arrest)
- Document list view with filters
- Delete document (removes from RAGFlow + Minio)
- Upload status indicator (processing/ready/failed)

#### 3. Chat Interface

- Ask questions in Thai or English
- Answers include source citations
- Click citation → highlight in source document
- Session-based chat history
- Filter chat scope:
  - By location (province)
  - By date range
  - By incident type
- Clear chat button
- Copy answer to clipboard
- Export chat as PDF

#### 4. Search

- Full-text keyword search
- Semantic search (via RAGFlow)
- Combined filter + semantic search
- Results show document excerpt + relevance score
- Click result → open document

#### 5. Basic Audit Log

- Log: login, logout, document upload, document delete, search queries
- Admin can view audit log
- Filter audit log by user, date, action type

### API Endpoints (Phase 1)

```
POST   /auth/login
POST   /auth/logout
GET    /auth/me

GET    /users                   (admin only)
POST   /users                   (admin only)
PUT    /users/{id}              (admin only)
DELETE /users/{id}              (admin only)

POST   /documents/upload
GET    /documents
GET    /documents/{id}
DELETE /documents/{id}
GET    /documents/{id}/status

POST   /chat/query
GET    /chat/history
DELETE /chat/history

GET    /search?q=...&location=...&date_from=...&date_to=...

GET    /audit-logs              (admin only)
```

### Stack (Phase 1)

|Component   |Service             |Version|
|------------|--------------------|-------|
|RAG Engine  |RAGFlow             |latest |
|LLM         |Ollama + Typhoon2-7B|latest |
|Database    |PostgreSQL          |16     |
|File Storage|Minio               |latest |
|Backend API |FastAPI             |0.110+ |
|Frontend    |Next.js             |14     |
|Auth        |JWT (python-jose)   |-      |
|Container   |Docker Compose      |-      |

### Docker Compose Services (Phase 1)

```yaml
services:
  ragflow:
    image: infiniflow/ragflow:latest
    ports: ["80:80"]
    volumes:
      - ragflow_data:/ragflow/data
    environment:
      - OLLAMA_BASE_URL=http://ollama:11434

  ollama:
    image: ollama/ollama:latest
    ports: ["11434:11434"]
    volumes:
      - ollama_models:/root/.ollama
    deploy:
      resources:
        reservations:
          devices:
            - capabilities: [gpu]   # remove if no GPU

  postgresql:
    image: postgres:16
    environment:
      POSTGRES_DB: dsi_platform
      POSTGRES_USER: dsi
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_PASSWORD}
    volumes:
      - minio_data:/data

  api:
    build: ./services/api
    environment:
      - DATABASE_URL=postgresql://dsi:${DB_PASSWORD}@postgresql/dsi_platform
      - RAGFLOW_URL=http://ragflow
      - RAGFLOW_API_KEY=${RAGFLOW_API_KEY}
      - MINIO_URL=http://minio:9000
      - JWT_SECRET=${JWT_SECRET}
    depends_on: [ragflow, postgresql, minio]

  frontend:
    build: ./services/frontend
    environment:
      - NEXT_PUBLIC_API_URL=http://api:8000
    ports: ["3000:3000"]
    depends_on: [api]
```

### Environment Variables (.env.example)

```env
# Database
DB_PASSWORD=changeme

# Minio
MINIO_USER=admin
MINIO_PASSWORD=changeme

# JWT
JWT_SECRET=changeme_long_random_string

# RAGFlow
RAGFLOW_API_KEY=changeme

# Ollama model to use
OLLAMA_MODEL=typhoon2

# App
APP_ENV=production
CORS_ORIGINS=http://localhost:3000
```

### Database Schema (Phase 1)

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name_th VARCHAR(255),
  name_en VARCHAR(255),
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'analyst',
  region VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename VARCHAR(500) NOT NULL,
  minio_path VARCHAR(1000) NOT NULL,
  ragflow_doc_id VARCHAR(255),
  location VARCHAR(255),
  incident_date DATE,
  incident_type VARCHAR(100),
  source_type VARCHAR(100),
  status VARCHAR(50) DEFAULT 'processing',
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Sessions
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Messages
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_sessions(id),
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  sources JSONB,
  filters_applied JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Log
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100),
  resource_id VARCHAR(255),
  metadata JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Phase 1 Acceptance Criteria

```
✅ Analyst can log in with email/password
✅ Analyst can upload PDF, Word, Excel files
✅ Upload triggers automatic RAGFlow indexing
✅ Analyst can chat with documents in Thai
✅ Chat responses include clickable source citations
✅ Analyst can filter chat by province and date range
✅ Admin can create/deactivate user accounts
✅ All actions logged to audit table
✅ App runs fully offline (no external API calls)
✅ UI labels in Thai language
```

-----

## Phase 2 — “Warn Me Early”

### Goal

Proactively detect pre-incident signal patterns in new reports and alert analysts before incidents occur.

### Timeline

6-8 weeks (after Phase 1 stable)

### Prerequisites

- Phase 1 in production
- Minimum 50 confirmed historical incidents indexed
- DSI analysts have defined at least 5 incident signal patterns
- Standard report template enforced for new submissions

### Additional Features

#### 6. Pattern Library

- Create incident fingerprint (name, description, signal list)
- Each signal has: name, weight (1-5), keywords list
- Edit / delete patterns
- Pattern active/inactive toggle
- View pattern match history
- Pattern performance stats (how often triggered, false positive rate)

#### 7. Pattern Detection Engine (LangGraph)

- Auto-runs when new document uploaded
- Extracts entities from document via Ollama/Typhoon2
- Compares extracted entities against all active patterns
- Scores similarity (0.0 - 1.0) per pattern
- Creates alert if score > threshold (default: 0.7)
- Runs as background worker (not blocking upload)
- Retry on failure (3 attempts)

#### 8. LangGraph Nodes

```python
# Node 1: Entity Extraction
# Reads skill from: skills/extract_entities.md
# Input: raw document text (Thai/English)
# Output: {
#   locations: [],
#   persons: [],
#   vehicles: [],    # plates
#   items: [],       # goods, materials
#   activities: [],  # suspicious behaviors
#   dates: []
# }

# Node 2: Pattern Matching
# Input: extracted entities
# Output: list of matching patterns with scores

# Node 3: Similarity Scoring
# Input: matched patterns
# Output: {
#   top_pattern: pattern_id,
#   score: 0.82,
#   matching_signals: [],
#   similar_past_case: case_id
# }

# Node 4: Alert Generation
# Reads skill from: skills/generate_alert.md
# Input: score + matching signals
# Output: bilingual alert (Thai + English)
# Only runs if score > threshold

# Node 5: Human Pause
# Saves alert to DB with status=pending
# Waits for analyst action (confirm/dismiss)
```

#### 9. Alert System

- Alert feed in sidebar (real-time polling every 60s)
- Unread alert count badge
- Alert detail view:
  - Risk level badge (🔴 HIGH / 🟡 MEDIUM)
  - Location
  - Match score percentage
  - Matched signals list (which ones triggered)
  - Most similar confirmed past case (link to it)
  - Source report link
  - Generated alert text (Thai + English)
- Confirm alert → escalate (status = confirmed)
- Dismiss alert → log reason (status = dismissed)
- Alert history with filter by status, region, date

#### 10. Observability (Admin Only)

- LangFuse self-hosted trace viewer
- View every pattern detection run
- See each LangGraph node execution
- Input/output per node
- Latency per step
- Flag false positive → feeds back to pattern tuning

#### 11. Enhanced Roles

- Three roles: `admin`, `senior_analyst`, `analyst`
- `senior_analyst`: can confirm/dismiss alerts, create patterns
- `analyst`: can view alerts, cannot confirm
- `admin`: full access + user management
- Region-based data isolation:
  - Analyst assigned to region(s)
  - Can only see documents + alerts for their region

### Additional API Endpoints (Phase 2)

```
GET    /patterns
POST   /patterns
GET    /patterns/{id}
PUT    /patterns/{id}
DELETE /patterns/{id}
GET    /patterns/{id}/history

GET    /alerts
GET    /alerts/{id}
POST   /alerts/{id}/confirm
POST   /alerts/{id}/dismiss
GET    /alerts/stats

GET    /pattern-engine/runs        (admin only)
GET    /pattern-engine/runs/{id}   (admin only)
```

### Additional Stack (Phase 2)

|Component     |Service                    |Notes              |
|--------------|---------------------------|-------------------|
|Pattern Engine|LangGraph 0.2+             |Python service     |
|Observability |LangFuse (self-hosted)     |Trace viewer       |
|Queue         |PostgreSQL (simple polling)|No Redis needed yet|
|Skill prompts |Markdown files             |In /skills/ folder |

### Additional Docker Services (Phase 2)

```yaml
  pattern-engine:
    build: ./services/pattern-engine
    environment:
      - DATABASE_URL=postgresql://dsi:${DB_PASSWORD}@postgresql/dsi_platform
      - OLLAMA_URL=http://ollama:11434
      - OLLAMA_MODEL=typhoon2
      - LANGFUSE_URL=http://langfuse:3000
      - LANGFUSE_PUBLIC_KEY=${LANGFUSE_PUBLIC_KEY}
      - LANGFUSE_SECRET_KEY=${LANGFUSE_SECRET_KEY}
      - ALERT_THRESHOLD=0.7
    depends_on: [postgresql, ollama]

  langfuse:
    image: langfuse/langfuse:latest
    environment:
      - DATABASE_URL=postgresql://dsi:${DB_PASSWORD}@postgresql/dsi_platform
      - NEXTAUTH_SECRET=${LANGFUSE_SECRET}
      - NEXTAUTH_URL=http://langfuse:3000
    ports: ["3001:3000"]
    depends_on: [postgresql]
```

### Additional Database Schema (Phase 2)

```sql
-- Incident Patterns
CREATE TABLE patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  incident_type VARCHAR(100),
  signals JSONB NOT NULL,
  threshold FLOAT DEFAULT 0.7,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pattern Signals (stored in JSONB above, schema reference)
-- {
--   "signal_id": "uuid",
--   "name": "fertilizer_purchase",
--   "name_th": "การซื้อปุ๋ย",
--   "weight": 3,
--   "keywords": ["fertilizer", "ammonium", "ปุ๋ย"]
-- }

-- Alerts
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id),
  pattern_id UUID REFERENCES patterns(id),
  score FLOAT NOT NULL,
  risk_level VARCHAR(20) NOT NULL,
  matched_signals JSONB,
  similar_case_id UUID REFERENCES documents(id),
  alert_text_th TEXT,
  alert_text_en TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  confirmed_by UUID REFERENCES users(id),
  confirmed_at TIMESTAMPTZ,
  dismiss_reason TEXT,
  langfuse_trace_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pattern Engine Runs
CREATE TABLE pattern_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id),
  status VARCHAR(50) DEFAULT 'running',
  extracted_entities JSONB,
  patterns_checked INT,
  alerts_created INT,
  duration_ms INT,
  error TEXT,
  langfuse_trace_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Skill Files (Plain Markdown for Ollama)

#### skills/extract_entities.md

```markdown
# Entity Extraction Skill

Extract structured entities from the following Thai/English police report.

Return ONLY valid JSON, no other text.

Extract these fields:
- locations: list of place names (province, district, specific location)
- persons: list of names mentioned (include Thai script if present)
- vehicles: list of vehicle plates or descriptions
- items: list of goods, materials, or objects mentioned
- activities: list of suspicious or notable activities
- dates: list of dates or time references mentioned

If a field has no data, return empty list [].
Do not invent data. Only extract what is explicitly stated.

Report:
{report_text}

Return JSON:
```

#### skills/generate_alert.md

```markdown
# Alert Generation Skill

Generate a concise security alert in both Thai and English.

Use this data:
- Location: {location}
- Match Score: {score}%
- Matched Signals: {signals}
- Similar Past Case: {similar_case}
- Report Date: {date}

Format the alert as JSON:
{
  "risk_level": "HIGH or MEDIUM",
  "alert_th": "Thai language alert text (3-4 sentences)",
  "alert_en": "English alert text (3-4 sentences)",
  "recommended_action_th": "Recommended next step in Thai",
  "recommended_action_en": "Recommended next step in English"
}

Be concise. Be factual. Do not speculate beyond the matched signals.
Return ONLY valid JSON.
```

### Phase 2 Acceptance Criteria

```
✅ New document upload triggers pattern check automatically
✅ Pattern check runs within 2 minutes of upload
✅ Alert created when score > 0.7
✅ Alert shows matched signals and score
✅ Alert text generated in Thai and English
✅ Senior analyst can confirm or dismiss alert
✅ Confirmation logged to audit trail
✅ Admin can view LangFuse traces for each run
✅ False positive rate < 30% after tuning
✅ Pattern library CRUD works correctly
✅ Region-based access control works
```

-----

## Phase 3 — “Connect the Dots”

### Goal

Reveal hidden entity networks and temporal connections across all cases.

### Timeline

8-10 weeks (after Phase 2 stable)

### Prerequisites

- Phase 2 in production for 3+ months
- Minimum 200 indexed documents
- Standard report template enforced (6+ months)
- GPU server upgrade for Typhoon2-70B
- DSI has committed dedicated analyst for graph validation

### Additional Features

#### 12. Entity Graph (Graphiti)

- Auto-extract entities from all documents
- Build temporal knowledge graph in FalkorDB
- Entity types: Person, Vehicle, Location, Incident, Item
- Relationship types: drove, spotted_at, associated_with, purchased, involved_in
- Auto-deduplicate entities (plates = hard ID, names = soft ID)
- Analyst validation workflow:
  - Review extracted entities queue
  - Merge duplicate nodes
  - Confirm or reject relationships
  - Add confidence score
- Confidence score on every edge
- Evidence list per relationship (which reports)

#### 13. Graph Visualization

- Interactive force-directed graph (D3.js or Cytoscape.js)
- Click node → see all related reports
- Click edge → see relationship evidence
- Filter by entity type
- Filter by date range
- Expand node → show connected nodes
- Collapse subgraph
- Export graph as PNG or PDF

#### 14. Timeline View

- Select entity → see full timeline
- Events ordered chronologically
- Show proximity to confirmed incidents
- “Vehicle spotted 14 days before incident”
- Export timeline as PDF report

#### 15. Network Analysis Queries

- “Who appears in most cases?” (top suspects by frequency)
- “Which locations repeat?” (hotspot identification)
- “Show all connections to entity X” (network traversal)
- “What activity occurred 30 days before case Y?”
- Multi-hop: “Friends of friends of suspect A”

#### 16. Graph-Aware Chat

- Chat now queries Graphiti in addition to RAGFlow
- “Who else is connected to this case?” → uses graph
- Inline graph snippet returned in chat
- Entity mentions in chat are clickable → opens graph view

#### 17. Case Management

- Create case from alert or manually
- Link documents to case
- Link entities to case
- Case status: open, investigating, closed
- Assign analyst to case
- Case notes (timeline of analyst actions)
- Export case report as PDF

#### 18. Commander Dashboard

- Regional risk heatmap (last 30 days)
- Active alerts by region
- Case status overview
- Monthly trend charts
- Top recurring entities
- No raw document access (summary only)
- Export dashboard as PDF

### Additional API Endpoints (Phase 3)

```
GET    /graph/entities
GET    /graph/entities/{id}
POST   /graph/entities/{id}/validate
POST   /graph/entities/merge
GET    /graph/network/{entity_id}
GET    /graph/timeline/{entity_id}
GET    /graph/analysis/hotspots
GET    /graph/analysis/top-entities

GET    /cases
POST   /cases
GET    /cases/{id}
PUT    /cases/{id}
POST   /cases/{id}/documents
POST   /cases/{id}/entities
POST   /cases/{id}/notes
GET    /cases/{id}/export

GET    /dashboard/summary         (commander role)
GET    /dashboard/heatmap         (commander role)
GET    /dashboard/trends          (commander role)
```

### Additional Stack (Phase 3)

|Component     |Service     |Notes           |
|--------------|------------|----------------|
|Temporal Graph|Graphiti    |Python library  |
|Graph DB      |FalkorDB    |Docker          |
|LLM Upgrade   |Typhoon2-70B|Needs 40GB VRAM |
|Graph UI      |Cytoscape.js|Frontend library|
|PDF Export    |WeasyPrint  |Python          |

### Additional Docker Services (Phase 3)

```yaml
  falkordb:
    image: falkordb/falkordb:latest
    ports: ["6379:6379", "3002:3000"]
    volumes:
      - falkordb_data:/data

  graphiti-service:
    build: ./services/graphiti-service
    environment:
      - FALKORDB_URL=redis://falkordb:6379
      - OLLAMA_URL=http://ollama:11434
      - OLLAMA_MODEL=typhoon2-70b
      - DATABASE_URL=postgresql://dsi:${DB_PASSWORD}@postgresql/dsi_platform
    depends_on: [falkordb, ollama]
```

### Additional Database Schema (Phase 3)

```sql
-- Entity Validation Queue
CREATE TABLE entity_validation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  graphiti_node_id VARCHAR(255),
  entity_type VARCHAR(100),
  entity_data JSONB,
  source_documents JSONB,
  status VARCHAR(50) DEFAULT 'pending',
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  action VARCHAR(50),
  merged_into VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cases
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'open',
  risk_level VARCHAR(20),
  region VARCHAR(255),
  assigned_to UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Case Documents
CREATE TABLE case_documents (
  case_id UUID REFERENCES cases(id),
  document_id UUID REFERENCES documents(id),
  added_by UUID REFERENCES users(id),
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (case_id, document_id)
);

-- Case Notes
CREATE TABLE case_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id),
  content TEXT NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Phase 3 Acceptance Criteria

```
✅ Entities auto-extracted from all documents
✅ Graph visualized in browser (interactive)
✅ Click node → see linked reports
✅ Timeline view works for persons and vehicles
✅ Analyst can validate/reject extracted entities
✅ Duplicate entities can be merged
✅ Chat answers reference graph when relevant
✅ Case management CRUD works
✅ Commander dashboard shows regional summary
✅ Case export generates readable PDF
✅ Entity validation queue works end-to-end
```

-----

## Development Notes for Claude Code

### Start Here

1. Set up Docker Compose with all Phase 1 services
1. Pull Typhoon2 model: `ollama pull typhoon2`
1. Configure RAGFlow to use Ollama endpoint
1. Build FastAPI with JWT auth first
1. Build document upload → RAGFlow pipeline
1. Build chat proxy to RAGFlow API
1. Build Next.js frontend last

### Key Integration Points

#### RAGFlow API (Phase 1)

```python
# RAGFlow REST API base URL
RAGFLOW_URL = "http://ragflow"

# Upload document to knowledge base
POST /v1/document/upload
# Chat with knowledge base
POST /v1/completion
# List documents
GET  /v1/document/list
```

#### LangGraph Pattern Engine (Phase 2)

```python
# Trigger from FastAPI webhook after document indexed
POST /internal/pattern-check
{
  "document_id": "uuid",
  "document_text": "...",
  "metadata": {
    "location": "Yala",
    "date": "2024-01-15"
  }
}

# LangGraph runs async, writes alert to DB
# Frontend polls GET /alerts for new alerts
```

#### Graphiti (Phase 3)

```python
from graphiti_core import Graphiti
from graphiti_core.driver.falkordb_driver import FalkorDriver

driver = FalkorDriver(host="falkordb", port=6379)
graphiti = Graphiti(graph_driver=driver, llm_client=ollama_client)

# Add episode from document
await graphiti.add_episode(
    name=document_id,
    episode_body=document_text,
    source_description="DSI Officer Report",
    reference_time=incident_date
)

# Search entities
results = await graphiti.search("Ahmad Yala vehicle")
```

### Important Implementation Rules

```
1. NEVER call external APIs in production
   → all LLM calls go to local Ollama
   → no OpenAI, no Anthropic, no Google

2. ALWAYS log to audit_logs table
   → every user action
   → every alert confirmation/dismissal
   → every document upload/delete

3. ALWAYS check user role before action
   → use FastAPI dependency injection
   → raise 403 if unauthorized

4. ALWAYS filter by user region
   → analyst cannot see other regions
   → apply filter at DB query level
   → never rely on frontend filtering

5. Thai language first
   → all UI labels in Thai
   → all alert text in Thai (+ English secondary)
   → error messages in Thai

6. Pattern engine failures must not block uploads
   → upload succeeds even if pattern engine fails
   → retry pattern check independently
   → notify admin of repeated failures
```

### Hardware Requirements

```
Phase 1-2 (Typhoon2-7B):
  RAM: 16GB minimum
  GPU: 8GB VRAM (NVIDIA RTX 3070 or better)
  Storage: 500GB SSD
  CPU: 8 cores

Phase 3 (Typhoon2-70B):
  RAM: 64GB
  GPU: 40GB+ VRAM (A100 or 2x A40)
  Storage: 1TB NVMe
  CPU: 16 cores
```

### Quick Start Commands

```bash
# Clone and setup
git clone <repo>
cd dsi-platform
cp .env.example .env
# Edit .env with your values

# Start Phase 1 services
docker compose up -d

# Pull Thai LLM
docker exec ollama ollama pull typhoon2

# Run database migrations
docker exec api python migrations/run.py

# Create first admin user
docker exec api python scripts/create_admin.py

# Access services
# Platform:  http://localhost:3000
# RAGFlow:   http://localhost:80
# LangFuse:  http://localhost:3001  (Phase 2)
# FalkorDB:  http://localhost:3002  (Phase 3)
```

-----

## MVP Scope (Validation Build)

> Build this FIRST before full Phase 1
> Goal: validate with DSI analysts in 2 weeks

```
✅ Docker Compose with RAGFlow + Ollama + Typhoon2
✅ Upload PDF/Excel to RAGFlow via UI
✅ Chat with documents in Thai
✅ Single hardcoded admin user (no user management yet)
✅ No RBAC
✅ No audit logging
✅ No fancy UI — RAGFlow UI as-is

Time to build: 3-5 days
Cost: $50/month server
Purpose: validate "is RAG useful for DSI?"
         before building anything else
```

-----

*Last updated: March 2026*
*Version: 1.0*
*For: DSI Thailand Intelligence Platform*