import "@tanstack/react-start/server-only";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import path from "node:path";
import * as schema from "@/lib/db/schema";

const dbPath = path.join(process.cwd(), "data", "dsi.db");

// Ensure data directory exists
import fs from "node:fs";
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite, { schema });
