// Set required environment variable before any imports
process.env.OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || 'test-api-key-for-testing';

import { describe, it, expect, vi, afterEach, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local manually (will override if file exists)
function loadEnv() {
    const envPath = path.resolve(__dirname, '../../../../.env.local');
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf-8');
        for (const line of content.split('\n')) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const [key, ...valueParts] = trimmed.split('=');
                const value = valueParts.join('=');
                if (key && value !== undefined) {
                    process.env[key] = value;
                }
            }
        }
    }
}

loadEnv();

// Mock OpenAI
const mockCreate = vi.fn();
vi.mock('openai', () => {
    return {
        default: vi.fn().mockImplementation(function(this: any) {
            this.chat = {
                completions: {
                    create: mockCreate
                }
            };
        })
    };
});

// Store POST function reference
let POST: any;

describe('Chat API', () => {
    beforeAll(async () => {
        // Import route dynamically after mocks are set up
        const route = await import('./route');
        POST = route.POST;
    });
    afterEach(() => {
        vi.clearAllMocks();
    });

    it('POST should return 200 with AI response', async () => {
        const mockResponse = {
            choices: [
                {
                    message: {
                        content: 'นี่คือการวิเคราะห์คดีของคุณ'
                    }
                }
            ],
            model: 'anthropic/claude-3.5-sonnet'
        };

        mockCreate.mockResolvedValueOnce(mockResponse);

        const requestBody = {
            messages: [
                { role: 'user', content: 'วิเคราะห์คดีนี้ให้หน่อย' }
            ],
            caseContext: 'คดีฆาตกรรม',
            caseNarrative: 'สำนวนคดี...',
            personas: [{ name: 'ผู้ต้องหา', role: 'suspect' }],
            pins: [{ id: 1, text: 'หลักฐานสำคัญ' }]
        };

        const request = new Request('http://localhost:3000/api/chat', {
            method: 'POST',
            body: JSON.stringify(requestBody),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.response).toBe('นี่คือการวิเคราะห์คดีของคุณ');
        expect(data.model).toBe('anthropic/claude-3.5-sonnet');
        
        // Verify OpenAI was called with correct parameters
        expect(mockCreate).toHaveBeenCalledWith({
            model: 'anthropic/claude-3.5-sonnet',
            messages: expect.arrayContaining([
                expect.objectContaining({ role: 'system' }),
                { role: 'user', content: 'วิเคราะห์คดีนี้ให้หน่อย' }
            ]),
            temperature: 0.7,
            max_tokens: 2000,
        });
    });

    it('POST should work with minimal request body', async () => {
        const mockResponse = {
            choices: [
                {
                    message: {
                        content: 'กรุณาให้ข้อมูลเพิ่มเติม'
                    }
                }
            ],
            model: 'anthropic/claude-3.5-sonnet'
        };

        mockCreate.mockResolvedValueOnce(mockResponse);

        const requestBody = {
            messages: [
                { role: 'user', content: 'สวัสดี' }
            ]
        };

        const request = new Request('http://localhost:3000/api/chat', {
            method: 'POST',
            body: JSON.stringify(requestBody),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.response).toBe('กรุณาให้ข้อมูลเพิ่มเติม');
        
        // Verify system prompt contains default values for missing fields
        const callArgs = mockCreate.mock.calls[0][0];
        const systemMessage = callArgs.messages[0].content;
        expect(systemMessage).toContain('ไม่มีข้อมูลคดี');
        expect(systemMessage).toContain('ยังไม่มีสำนวนคดี');
    });

    it('POST should handle multiple messages in conversation', async () => {
        const mockResponse = {
            choices: [
                {
                    message: {
                        content: 'ตอบกลับในบทสนทนา'
                    }
                }
            ],
            model: 'anthropic/claude-3.5-sonnet'
        };

        mockCreate.mockResolvedValueOnce(mockResponse);

        const requestBody = {
            messages: [
                { role: 'user', content: 'คำถามแรก' },
                { role: 'assistant', content: 'คำตอบแรก' },
                { role: 'user', content: 'คำถามที่สอง' }
            ]
        };

        const request = new Request('http://localhost:3000/api/chat', {
            method: 'POST',
            body: JSON.stringify(requestBody),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.response).toBe('ตอบกลับในบทสนทนา');
        
        // Verify all messages were passed to OpenAI
        const callArgs = mockCreate.mock.calls[0][0];
        expect(callArgs.messages).toHaveLength(4); // system + 3 messages
    });

    it('POST should return 500 when OpenAI API fails', async () => {
        mockCreate.mockRejectedValueOnce(new Error('API Error'));

        const requestBody = {
            messages: [
                { role: 'user', content: 'ทดสอบ' }
            ]
        };

        const request = new Request('http://localhost:3000/api/chat', {
            method: 'POST',
            body: JSON.stringify(requestBody),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.message).toBe('AI chat failed');
    });

    it('POST should handle invalid JSON body', async () => {
        const request = new Request('http://localhost:3000/api/chat', {
            method: 'POST',
            body: 'invalid json',
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.message).toBe('AI chat failed');
    });

    it('POST should include case context in system prompt', async () => {
        const mockResponse = {
            choices: [
                {
                    message: {
                        content: 'วิเคราะห์แล้ว'
                    }
                }
            ],
            model: 'anthropic/claude-3.5-sonnet'
        };

        mockCreate.mockResolvedValueOnce(mockResponse);

        const requestBody = {
            messages: [{ role: 'user', content: 'ทดสอบ' }],
            caseContext: 'คดีทุจริตภาครัฐ',
            caseNarrative: 'ผู้ต้องหาได้รับเงินสินบน 5 ล้านบาท'
        };

        const request = new Request('http://localhost:3000/api/chat', {
            method: 'POST',
            body: JSON.stringify(requestBody),
        });

        await POST(request);

        const callArgs = mockCreate.mock.calls[0][0];
        const systemMessage = callArgs.messages[0].content;
        expect(systemMessage).toContain('คดีทุจริตภาครัฐ');
        expect(systemMessage).toContain('ผู้ต้องหาได้รับเงินสินบน 5 ล้านบาท');
    });

    it('POST should include personas and pins in system prompt', async () => {
        const mockResponse = {
            choices: [
                {
                    message: {
                        content: 'วิเคราะห์ persona และ pins'
                    }
                }
            ],
            model: 'anthropic/claude-3.5-sonnet'
        };

        mockCreate.mockResolvedValueOnce(mockResponse);

        const requestBody = {
            messages: [{ role: 'user', content: 'ทดสอบ' }],
            personas: [
                { name: 'นาย ก', role: 'ผู้ต้องหา' },
                { name: 'นาง ข', role: 'พยาน' }
            ],
            pins: [
                { id: 1, text: 'CCTV บริเวณเกิดเหตุ' },
                { id: 2, text: 'ประวัติการโทรศัพท์' }
            ]
        };

        const request = new Request('http://localhost:3000/api/chat', {
            method: 'POST',
            body: JSON.stringify(requestBody),
        });

        await POST(request);

        const callArgs = mockCreate.mock.calls[0][0];
        const systemMessage = callArgs.messages[0].content;
        expect(systemMessage).toContain('นาย ก');
        expect(systemMessage).toContain('นาง ข');
        expect(systemMessage).toContain('CCTV บริเวณเกิดเหตุ');
        expect(systemMessage).toContain('ประวัติการโทรศัพท์');
    });
});
