# RAGFlow v0.24.0 Customization Guide

This document describes all changes made to customize RAGFlow for the DSI Intelligence Platform (ประจักษ์ AI). Apply these changes to a fresh RAGFlow v0.24.0 installation at `/opt/ragflow`.

## Files Modified

### 1. Thai Translation File
**Path:** `web/src/locales/th.ts`

Complete Thai locale file. Replace the default `th.ts` with the provided `ragflow-th.ts` file in this repo.

### 2. i18n Config — Default Language
**Path:** `web/src/locales/config.ts`

**Change:** Set `fallbackLng` to `'th'` (Thai) instead of `'en'`.

```diff
-    fallbackLng: 'en',
+    fallbackLng: 'th',
```

### 3. Login Page — Top Bar Branding
**Path:** `web/src/pages/login-next/index.tsx`

**Change:** Replace "RAGFlow" with "ประจักษ์ AI" in the top navigation bar.

```diff
-            <div className="text-xl font-bold self-center">RAGFlow</div>
+            <div className="text-xl font-bold self-center">ประจักษ์ AI</div>
```

### 4. Login Page — Logo Text & Tagline
**Path:** `web/src/pages/admin/login.tsx`

**Changes:**
- Logo text changed from "RAGFlow" to "ประจักษ์ AI"
- Tagline changed from "A leading RAG engine for LLM context" to "AI-powered intelligence platform — faster analysis, smarter decisions"

```diff
-            <span className="text-xl font-bold">RAGFlow</span>
+            <span className="text-xl font-bold">ประจักษ์ AI</span>
```

(And the tagline/description text updated accordingly in the same file.)

### 5. Home Page Banner
**Path:** `web/src/pages/home/banner.tsx`

**Changes:** Replace hardcoded "DSI Intelligent" with "ประจักษ์ AI".

```diff
-        Welcome to DSI Intelligent
+        Welcome to ประจักษ์ AI
```

```diff
-        DSI Intelligent
+        ประจักษ์ AI
```

### 6. English Locale — Title Override
**Path:** `web/src/locales/en.ts`

**Change:** Update the `header.title` key.

```diff
-      title: 'DSI Intelligent',
+      title: 'ประจักษ์ AI',
```

## Database Changes

### Agent Template Thai Translations
The agent template names and descriptions are stored in the `canvas_template` MySQL table as JSON with per-language keys. Run the SQL in `ragflow-template-th.sql` (in this repo) to inject Thai translations.

**MySQL credentials:** root / `infini_rag_flow`  
**Database:** `rag_flow`

```bash
docker cp ragflow-template-th.sql docker-mysql-1:/tmp/
docker exec docker-mysql-1 mysql -u root -pinfini_rag_flow rag_flow --default-character-set=utf8mb4 -e 'source /tmp/ragflow-template-th.sql'
```

## After Applying Changes

```bash
cd /opt/ragflow/web
npm install
npm run build
cd /opt/ragflow/docker
docker compose --profile cpu up -d ragflow-cpu
```

## Rebranding Summary

| Element | Original | Customized |
|---|---|---|
| App Name | RAGFlow | ประจักษ์ AI |
| Tagline | A leading RAG engine for LLM context | AI-powered intelligence platform — faster analysis, smarter decisions |
| Default Language | English | Thai (ภาษาไทย) |
| Home Banner | Welcome to RAGFlow | ยินดีต้อนรับ ประจักษ์ AI |
| Login Top Bar | RAGFlow | ประจักษ์ AI |
| Agent Templates | English only | English + Thai |
