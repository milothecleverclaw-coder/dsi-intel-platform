import { desc } from "drizzle-orm";
import { defineEventHandler } from "h3";

import { db } from "@/lib/db";
import { cases } from "@/lib/db/schema";

export default defineEventHandler(async () => {
  const allCases = db.select().from(cases).orderBy(desc(cases.createdAt)).all();
  return allCases;
});
