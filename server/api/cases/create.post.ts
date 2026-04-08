import { randomUUID } from "node:crypto";

import { defineEventHandler, readBody } from "h3";

import { db } from "@/lib/db";
import { cases } from "@/lib/db/schema";

const RAGFLOW_API = "https://ragflow.hotserver.uk/api/v1";
const RAGFLOW_TOKEN = "ragflow-OlzPV-jhtT7tQ6SVTtsXHIuxhIWwqVQ1F6dzHXh7yQk";
const USER_ID = "4e804422250811f19e73b999782d6f14";
const GROQ_LLM = "llama-3.3-70b-versatile@Groq";

const SYSTEM_PROMPT = `คุณคือผู้ช่วยด้านข่าวกรองของ DSI (กรมสอบสวนคดีพิเศษ) สำหรับคดี "{{CASE_NAME}}"

<role>
คุณช่วยเจ้าหน้าที่ DSI ในการวิเคราะห์เอกสารและข้อมูลคดี ตอบคำถามอย่างเป็นระบบ อ้างอิงจากเอกสารจริง
</role>

<tool_usage>
- ใช้เครื่องมือ Retrieval เมื่อคำถามเกี่ยวกับเอกสาร ข้อมูล หรือรายละเอียดคดีเท่านั้น
- สำหรับคำถามทั่วไป ตอบเลยโดยไม่ต้องใช้เครื่องมือ
</tool_usage>

<rules>
- ตอบเป็นภาษาไทยเสมอ
- อ้างอิงเอกสารด้วย [ID:xxx] เมื่อมีข้อมูลจาก Retrieval
- อย่าแต่งเรื่องที่ไม่มีในเอกสาร
</rules>`;

function buildCanvasDSL(caseName: string, datasetId: string) {
  return {
    title: caseName,
    canvas_category: "Agent",
    dsl: {
      components: {
        begin: {
          obj: {
            componentType: "Begin",
            data: {
              prologue: `สวัสดี! ฉันผู้ช่วยสำหรับคดี "${caseName}" ถามอะไรก็ได้เกี่ยวกับเอกสารในคดีนี้`,
            },
          },
        },
        agent: {
          obj: {
            componentType: "Agent",
            data: {
              maxRounds: 3,
              strategy: "react",
              model: { llmId: GROQ_LLM, enableToolCall: true },
              prompt: {
                system: SYSTEM_PROMPT.replace("{{CASE_NAME}}", caseName),
                tools: [
                  {
                    componentType: "Retrieval",
                    params: {
                      datasetIds: [datasetId],
                      topN: 3,
                      topK: 30,
                      similarityThreshold: 0.5,
                      keywordsWeight: 0.7,
                    },
                  },
                ],
              },
              cite: true,
            },
          },
          downstream: ["reply"],
          upstream: ["begin"],
        },
        reply: {
          obj: { componentType: "Message", data: { content: "" } },
          upstream: ["agent"],
        },
      },
      graph: {
        edges: [
          { id: "begin-agent", source: "begin", target: "agent" },
          { id: "agent-reply", source: "agent", target: "reply" },
        ],
      },
      history: [],
    },
  };
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const caseName = body?.name?.trim();
  if (!caseName) return { error: "Name is required" };

  try {
    // Create dataset
    const dsRes = await fetch(`${RAGFLOW_API}/datasets`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RAGFLOW_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: caseName, chunk_method: "naive", parser_config: {} }),
    });
    const dsData = await dsRes.json();
    if (dsData.code !== 0) return { error: "Failed to create dataset: " + dsData.message };
    const datasetId = dsData.data.id;

    // Create agent via /api/v1/agents
    const canvasDSL = buildCanvasDSL(caseName, datasetId);
    const agentRes = await fetch(`${RAGFLOW_API}/agents`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RAGFLOW_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: canvasDSL.title,
        description: `DSI intelligence agent for case "${caseName}"`,
        dsl: canvasDSL.dsl,
      }),
    });
    const agentData = await agentRes.json();
    if (agentData.code !== undefined && agentData.code !== 0)
      return {
        error: "Failed to create agent: " + (agentData.message || JSON.stringify(agentData)),
      };

    // Create returns data: true, not the agent ID — fetch it from the list
    let agentId: string | null = null;
    if (agentData.data === true) {
      await new Promise((r) => setTimeout(r, 1000));
      const agentsList = await fetch(`${RAGFLOW_API}/agents?page=1&page_size=100`, {
        headers: { Authorization: `Bearer ${RAGFLOW_TOKEN}` },
      });
      const agentsData = await agentsList.json();
      const match = agentsData.data?.find((a: any) => a.title === caseName);
      agentId = match?.id || null;
    } else {
      agentId = agentData.data?.id ?? agentData.data;
    }
    if (!agentId) return { error: "Failed to retrieve agent ID after creation" };

    // Insert into DB
    const created = db
      .insert(cases)
      .values({
        id: randomUUID(),
        name: caseName,
        datasetId,
        agentId,
        createdById: USER_ID,
        createdAt: new Date().toISOString(),
      })
      .returning()
      .get();

    return created;
  } catch (e: any) {
    return { error: e.message };
  }
});
