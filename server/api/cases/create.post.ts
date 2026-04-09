import { randomUUID } from "node:crypto";

import { defineEventHandler, readBody } from "h3";

import { db } from "@/lib/db";
import { cases } from "@/lib/db/schema";

const RAGFLOW_API = "https://ragflow.hotserver.uk/api/v1";
const RAGFLOW_TOKEN = "ragflow-OlzPV-jhtT7tQ6SVTtsXHIuxhIWwqVQ1F6dzHXh7yQk";
const USER_ID = "4e804422250811f19e73b999782d6f14";

function randomId() {
  return Math.random().toString(36).substring(2, 10);
}

function buildCanvasDSL(caseName: string, datasetId: string) {
  const AGENT_ID = `Agent:${randomId()}`;
  const MESSAGE_ID = `Message:${randomId()}`;
  const TOOL_ID = `Tool:${randomId()}`;

  const agentSysPrompt = `คุณเป็นผู้ช่วย AI ของ DSI (สำนักงานสอบสวนคดีพิเศษ) ชื่อ "DSI Smart Assistant"

<role>
คุณช่วยเหลือเจ้าหน้าที่ DSI ในการค้นหาและสรุปข้อมูลจากฐานข้อมูลคดี "${caseName}" รวมถึงตอบคำถามทั่วไป
</role>

<visualization>
- เมื่อผู้ใช้ขอให้แสดงข้อมูลเป็นแผนภูมิ ไดอะแกรม ความสัมพันธ์ หรือโครงสร้าง → สร้างไดอะแกรมโดยใช้ Mermaid
- ใช้ \`\`\`mermaid code block เสมอ และต้องปิด code block ด้วย \`\`\` เสมอ
- ตัวอย่างประเภทที่รองรับ: graph TD, sequenceDiagram, flowchart LR, classDiagram, erDiagram, gantt, timeline, mindmap, pie
- เลือกประเภท diagram ให้เหมาะกับข้อมูล เช่น ใช้ flowchart สำหรับขั้นตอน, erDiagram สำหรับความสัมพันธ์, timeline สำหรับเหตุการณ์ตามลำดับเวลา
- อย่าใช้อักขระวาดกล่อง (┌ ┐ └ ┘) ใช้ Mermaid เท่านั้น
- กฎสำคัญ: เขียน mermaid code เสร็จแล้ว ต้องปิดด้วย \`\`\` ทันที ก่อนที่จะเขียนคำอธิบายเพิ่มเติม อย่าเขียนคำอธิบายภายใน code block
- ตัวอย่างที่ถูกต้อง:
\`\`\`mermaid
graph TD
    A[เริ่มต้น] --> B[สิ้นสุด]
\`\`\`
คำอธิบายของแผนภูมิอยู่นอก code block แบบนี้
</visualization>

<format>
- ขึ้นบรรทัดใหม่แต่ละย่อหน้า ต้องขึ้นบรรทัดว่าง 1 บรรทัด (กด Enter 2 ครั้ง)
- ใช้รายการ (- หรือ 1.) เพื่อแสดงข้อมูลหลายจุด
- อย่าเขียนทุกอย่างในบรรทัดเดียวยาวๆ
</format>

<tool_usage>
- เรียกใช้เครื่องมือ Retrieval เฉพาะเมื่อคำถามเกี่ยวข้องกับ: คดี, เอกสาร, พยาน, หลักฐาน, ข้อมูลคดี, รายชื่อ, วันที่ของคดี, หมายเลขคดี หรือข้อมูลเฉพาะเรื่องที่อาจมีในฐานข้อมูล
- อย่าเรียก Retrieval สำหรับ: การทักทาย, สนทนาทั่วไป, คำถามเกี่ยวกับหน้าที่ของคุณ, หรือคำถามที่ไม่ต้องการข้อมูลจากเอกสาร
- หาก Retrieval ไม่พบข้อมูลที่เกี่ยวข้อย ให้ตอบตรงๆ ว่าไม่พบข้อมูลในฐานข้อมูล
</tool_usage>

<rules>
- ตอบเป็นภาษาไทยเสมอ เว้นแต่ผู้ใช้ถามเป็นภาษาอังกฤษ
- อ้างอิงข้อมูลจากเอกสารในฐานข้อมูลเท่านั้น อย่าสร้างข้อมูลหรือสมมติขึ้นมาเอง
- ใช้รูปแบบ [ID:x] เพื่ออ้างอิงแหล่งข้อมูลเมื่อมีการอ้างถึง
- สรุปคำตอบให้กระชับ เข้าใจง่าย และเน้นข้อมูลที่สำคัญ
- หากผู้ใช้ถามหลายคำถาม ให้ตอบทีละข้ออย่างเป็นระเบียบ
</rules>`;

  return {
    title: caseName,
    canvas_category: "Agent",
    dsl: {
      graph: {
        nodes: [
          {
            data: {
              form: { mode: "conversational", prologue: `สวัสดี! ฉันผู้ช่วยสำหรับคดี "${caseName}"` },
              label: "Begin",
              name: "begin",
            },
            id: "begin",
            measured: { height: 82, width: 200 },
            position: { x: 50, y: 200 },
            selected: false,
            sourcePosition: "left",
            targetPosition: "right",
            type: "beginNode",
          },
          {
            data: {
              form: {
                cite: true,
                delay_after_error: 1,
                description: "",
                exception_default_value: "",
                exception_goto: [],
                exception_method: "",
                frequencyPenaltyEnabled: true,
                frequency_penalty: 0.5,
                llm_id: "llama-3.3-70b-versatile@Groq",
                maxTokensEnabled: false,
                max_retries: 3,
                max_rounds: 1,
                max_tokens: 4096,
                mcp: [],
                message_history_window_size: 12,
                outputs: { content: { type: "string", value: "" } },
                parameter: "Precise",
                presencePenaltyEnabled: true,
                presence_penalty: 0.5,
                prompts: [{ content: "{sys.query}", role: "user" }],
                showStructuredOutput: false,
                sys_prompt: agentSysPrompt,
                temperature: 0.2,
                temperatureEnabled: true,
                tools: [
                  {
                    component_name: "Retrieval",
                    name: "Retrieval",
                    params: {
                      cross_languages: [],
                      description: "",
                      empty_response: "",
                      kb_ids: [datasetId],
                      keywords_similarity_weight: 0.7,
                      meta_data_filter: {},
                      outputs: {
                        formalized_content: { type: "string", value: "" },
                        json: { type: "Array<Object>", value: [] },
                      },
                      rerank_id: "",
                      retrieval_from: "dataset",
                      similarity_threshold: 0.1,
                      toc_enhance: true,
                      top_k: 1024,
                      top_n: 10,
                      use_kg: false,
                    },
                  },
                ],
                topPEnabled: true,
                top_p: 0.75,
                user_prompt: "",
                visual_files_var: "",
              },
              label: "Agent",
              name: "Agent_0",
            },
            id: AGENT_ID,
            measured: { height: 90, width: 200 },
            position: { x: 361.4048833094207, y: 238.3401302421477 },
            selected: false,
            sourcePosition: "right",
            targetPosition: "left",
            type: "agentNode",
          },
          {
            data: {
              form: { content: [`{${AGENT_ID}@content}\n`] },
              label: "Message",
              name: "Message_0",
            },
            dragging: false,
            id: MESSAGE_ID,
            measured: { height: 86, width: 200 },
            position: { x: 736.7706821995397, y: 307.3221403641306 },
            selected: false,
            sourcePosition: "right",
            targetPosition: "left",
            type: "messageNode",
            width: 200,
          },
          {
            data: {
              form: {
                description: "This is an agent for a specific task.",
                user_prompt: "This is the order you need to send to the agent.",
              },
              label: "Tool",
              name: "flow.tool_0",
            },
            dragging: false,
            id: TOOL_ID,
            measured: { height: 50, width: 200 },
            position: { x: 327.41201875523393, y: 469.2696580234296 },
            selected: false,
            sourcePosition: "right",
            targetPosition: "left",
            type: "toolNode",
            width: 200,
          },
        ],
        edges: [
          {
            data: { isHovered: false },
            id: `xy-edge__beginstart-${AGENT_ID}end`,
            source: "begin",
            sourceHandle: "start",
            target: AGENT_ID,
            targetHandle: "end",
          },
          {
            data: { isHovered: false },
            id: `xy-edge__${AGENT_ID}start-${MESSAGE_ID}end`,
            source: AGENT_ID,
            sourceHandle: "start",
            target: MESSAGE_ID,
            targetHandle: "end",
          },
          {
            data: { isHovered: false },
            id: `xy-edge__${AGENT_ID}tool-${TOOL_ID}end`,
            source: AGENT_ID,
            sourceHandle: "tool",
            target: TOOL_ID,
            targetHandle: "end",
          },
        ],
      },
      globals: {
        "sys.conversation_turns": 0,
        "sys.files": [],
        "sys.history": [],
        "sys.query": "",
        "sys.user_id": "",
      },
      components: {
        begin: {
          downstream: [AGENT_ID],
          upstream: [],
          obj: {
            component_name: "Begin",
            params: {
              enablePrologue: true,
              inputs: {},
              outputs: {},
              prologue: `สวัสดี! ฉันผู้ช่วยสำหรับคดี "${caseName}"`,
              mode: "conversational",
            },
          },
        },
        [AGENT_ID]: {
          downstream: [MESSAGE_ID],
          upstream: ["begin"],
          obj: {
            component_name: "Agent",
            params: {
              cite: true,
              delay_after_error: 1,
              description: "",
              exception_comment: "",
              exception_default_value: "",
              exception_goto: [],
              exception_method: null,
              frequencyPenaltyEnabled: true,
              frequency_penalty: 0.5,
              llm_id: "llama-3.3-70b-versatile@Groq",
              maxTokensEnabled: false,
              max_retries: 3,
              max_rounds: 1,
              max_tokens: 4096,
              mcp: [],
              message_history_window_size: 12,
              outputs: { content: { type: "string", value: "" } },
              parameter: "Precise",
              presencePenaltyEnabled: true,
              presence_penalty: 0.5,
              prompts: [{ content: "{sys.query}", role: "user" }],
              showStructuredOutput: false,
              sys_prompt: agentSysPrompt,
              temperature: 0.2,
              temperatureEnabled: true,
              tools: [
                {
                  component_name: "Retrieval",
                  name: "Retrieval",
                  params: {
                    kb_ids: [datasetId],
                    cross_languages: [],
                    description: "",
                    empty_response: "",
                    keywords_similarity_weight: 0.7,
                    meta_data_filter: {},
                    outputs: {
                      formalized_content: { type: "string", value: "" },
                      json: { type: "Array<Object>", value: [] },
                    },
                    rerank_id: "",
                    retrieval_from: "dataset",
                    similarity_threshold: 0.1,
                    toc_enhance: true,
                    top_k: 1024,
                    top_n: 10,
                    use_kg: false,
                  },
                },
              ],
              topPEnabled: true,
              top_p: 0.75,
              user_prompt: "",
              visual_files_var: "",
            },
          },
        },
        [MESSAGE_ID]: {
          downstream: [],
          upstream: [AGENT_ID],
          obj: {
            component_name: "Message",
            params: { content: [`{${AGENT_ID}@content}\n`] },
          },
        },
      },
      history: [],
      messages: [],
      path: [],
      retrieval: [],
      variables: [],
    },
  };
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const caseName = body?.name?.trim();
  if (!caseName) return { error: "Name is required" };

  try {
    // Pre-clean duplicates: RAGFlow's soft-delete marks resources as "deleted" but they still
    // appear in list queries. Creating a new resource with the same name returns success (code=0,
    // data=true) but subsequent title-based lookups grab the stale/deleted resource's ID instead
    // of the newly created one. We avoid this by explicitly deleting any pre-existing resources
    // with the same name before creating new ones.

    // Check for existing dataset and delete it
    const existingDatasets = await fetch(`${RAGFLOW_API}/datasets?page=1&page_size=100`, {
      headers: { Authorization: `Bearer ${RAGFLOW_TOKEN}` },
    });
    const dsList = await existingDatasets.json();
    const existingDs = dsList.data?.find((d: any) => d.name === caseName);
    if (existingDs) {
      await fetch(`${RAGFLOW_API}/datasets/${existingDs.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${RAGFLOW_TOKEN}` },
      });
    }

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

    // Pre-clean any existing agent with the same title (see comment above)
    const existingAgents = await fetch(`${RAGFLOW_API}/agents?page=1&page_size=100`, {
      headers: { Authorization: `Bearer ${RAGFLOW_TOKEN}` },
    });
    const agentList = await existingAgents.json();
    const existingAgent = agentList.data?.find((a: any) => a.title === caseName);
    if (existingAgent) {
      await fetch(`${RAGFLOW_API}/agents/${existingAgent.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${RAGFLOW_TOKEN}` },
      });
    }

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
