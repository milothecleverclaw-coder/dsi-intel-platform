import { eq } from "drizzle-orm";
import { defineEventHandler, getRouterParam } from "h3";

import { db } from "@/lib/db";
import { cases } from "@/lib/db/schema";

const RAGFLOW_API = "https://ragflow.hotserver.uk/api/v1";
const RAGFLOW_TOKEN = "ragflow-OlzPV-jhtT7tQ6SVTtsXHIuxhIWwqVQ1F6dzHXh7yQk";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) return { error: "Case ID is required" };

  try {
    // Get case from DB
    const existing = db.select().from(cases).where(eq(cases.id, id)).get();
    if (!existing) return { error: "Case not found" };

    const { agentId, datasetId } = existing;

    // Delete from SQLite
    db.delete(cases).where(eq(cases.id, id)).run();

    // Delete agent from RAGFlow (fire-and-forget)
    if (agentId) {
      fetch(`${RAGFLOW_API}/agents/${agentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${RAGFLOW_TOKEN}` },
      }).catch(() => {});
    }

    // Delete dataset from RAGFlow (fire-and-forget)
    if (datasetId) {
      fetch(`${RAGFLOW_API}/datasets/${datasetId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${RAGFLOW_TOKEN}` },
      }).catch(() => {});
    }

    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
});
