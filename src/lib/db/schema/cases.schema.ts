import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const cases = sqliteTable("cases", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  datasetId: text("dataset_id").notNull(),
  agentId: text("agent_id").notNull(),
  createdById: text("created_by_id").notNull(),
  createdAt: text("created_at").notNull(),
  details: text("details"),
});
