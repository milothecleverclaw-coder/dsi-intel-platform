import { eq } from "drizzle-orm";
import { defineEventHandler, readBody, getRouterParam } from "h3";

import { db } from "@/lib/db";
import { cases } from "@/lib/db/schema";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) return { error: "ID is required" };

  const body = await readBody(event);
  const updates: Record<string, string> = {};
  if (body?.name !== undefined) updates.name = body.name;
  if (body?.details !== undefined) updates.details = body.details;

  if (Object.keys(updates).length === 0) return { error: "No fields to update" };

  try {
    const updated = db.update(cases).set(updates).where(eq(cases.id, id)).returning().get();
    if (!updated) return { error: "Case not found" };
    return updated;
  } catch (e: any) {
    return { error: e.message };
  }
});
