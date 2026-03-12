import OpenAI from 'openai';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1';

if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key is missing.');
}

const openai = new OpenAI({
    baseURL: OPENROUTER_API_URL,
    apiKey: OPENROUTER_API_KEY,
    defaultHeaders: {
        'HTTP-Referer': 'https://csi.hotserver.uk',
        'X-Title': 'DSI Intel Platform',
    },
});

export async function POST(request: Request) {
    try {
        const { messages, caseContext, caseNarrative, personas, pins } = await request.json();

        // Thai CSI Assistant system prompt
        const systemPrompt = `คุณเป็นผู้ช่วยวิเคราะห์คดีอาชญากรรม (CSI Case Assistant) ของกรมสอบสวนคดีพิเศษ (DSI)
เป้าหมายคือ "ชนะคดี" — ช่วยระบุช่องโหว่ หลักฐานที่ขาด จุดอ่อนที่ทนายฝ่ายตรงข้ามอาจโจมตี
ตอบเป็นภาษาไทยเสมอ ใช้คำศัพท์ทางกฎหมายที่เหมาะสม

## ข้อมูลคดีปัจจุบัน:
${caseContext || 'ไม่มีข้อมูลคดี'}

## สำนวนคดี (เอกสารสำคัญ):
${caseNarrative || 'ยังไม่มีสำนวนคดี'}

## Persona ที่เกี่ยวข้อง:
${personas ? JSON.stringify(personas, null, 2) : 'ไม่มี persona'}

## Pins (จุดสำคัญที่พบ):
${pins ? JSON.stringify(pins, null, 2) : 'ไม่มี pins'}

## คำแนะนำในการตอบ:
- อ้างอิงสำนวนคดีเมื่อตอบคำถามเกี่ยวกับข้อเท็จจริง
- เมื่อวิเคราะห์ timeline ให้ระบุช่องว่างที่อาจถูกทนายฝ่ายตรงข้ามโจมตี
- เมื่อดู pins ให้สังเกตว่ามีการ tag persona ครบหรือยัง
- เสนอหลักฐานที่ควรหาเพิ่ม (เช่น CCTV ระหว่างทาง, พยานบุคคล, บันทึกการโทรเพิ่มเติม)`;

        const response = await openai.chat.completions.create({
            model: 'anthropic/claude-3.5-sonnet',
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages,
            ],
            temperature: 0.7,
            max_tokens: 2000,
        });

        return new Response(JSON.stringify({ 
            response: response.choices[0].message.content,
            model: response.model,
        }), { status: 200 });
    } catch (error) {
        console.error('AI Chat Error:', error);
        return new Response(JSON.stringify({ message: 'AI chat failed' }), { status: 500 });
    }
}
