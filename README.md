# DSI Intel Platform

Investigation case management and intelligence analysis platform for DSI.

## Repository Structure

```
/app        ← Production Next.js application (start here)
/mock       ← Static prototype/demo (reference only, not runnable in prod)
/docs       ← Feature specs and design documents
```

## Running the App (`/app`)

### Prerequisites

- Node.js 20+
- PM2 (`npm install -g pm2`)
- `.env.local` configured in `/app` (see Environment Variables below)

### First-time setup

```bash
cd app
npm install
npm run build
pm2 start npm --name "dsi" -- start
pm2 save
```

### PM2 Commands

| Action | Command |
|--------|---------|
| Start | `pm2 start npm --name "dsi" -- start` |
| Stop | `pm2 stop dsi` |
| Restart | `pm2 restart dsi` |
| Reload (zero-downtime) | `pm2 reload dsi` |
| View logs | `pm2 logs dsi` |
| Status | `pm2 status` |

### Rebuild & Redeploy

After pulling new changes:

```bash
cd app
npm install          # install any new deps
npm run build        # rebuild Next.js
pm2 reload dsi       # zero-downtime reload
```

Or full restart:

```bash
cd app
npm run build
pm2 stop dsi && pm2 start npm --name "dsi" -- start
```

### Default Port

Runs on **port 3000** by default. Override with:

```bash
PORT=8080 pm2 start npm --name "dsi" -- start
```

## Environment Variables

Create `/app/.env.local`:

```env
# Database
DATABASE_URL=

# Azure Blob Storage
AZURE_STORAGE_CONNECTION_STRING=
AZURE_STORAGE_CONTAINER_NAME=

# Azure Form Recognizer
AZURE_FORM_RECOGNIZER_ENDPOINT=
AZURE_FORM_RECOGNIZER_KEY=

# OpenAI / AI
OPENAI_API_KEY=

# Twelve Labs (video analysis)
TWELVE_LABS_API_KEY=
TWELVE_LABS_INDEX_ID=
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS, shadcn/ui
- **Database**: PostgreSQL (Neon serverless)
- **Storage**: Azure Blob Storage
- **AI**: OpenAI, Twelve Labs (video intelligence)
- **OCR**: Azure Form Recognizer
