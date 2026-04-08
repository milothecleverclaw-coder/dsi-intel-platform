import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const cases = sqliteTable("cases", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  datasetId: text("dataset_id").notNull(),
  agentId: text("agent_id").notNull(),
  createdById: text("created_by_id").notNull(),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});
