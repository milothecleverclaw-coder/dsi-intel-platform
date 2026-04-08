import "@tanstack/react-start/server-only";
import path from "node:path";

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import * as schema from "@/lib/db/schema";

const dbPath = path.join(process.cwd(), "data", "dsi.db");

// Ensure data directory exists
import fs from "node:fs";
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");

// Auto-migrate: add columns that may not exist yet
try {
  sqlite.exec(`ALTER TABLE cases ADD COLUMN details TEXT`);
} catch {
  // column already exists
}

export const db = drizzle(sqlite, { schema });
