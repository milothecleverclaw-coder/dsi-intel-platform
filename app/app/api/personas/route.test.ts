import { describe, it, expect, vi } from 'vitest';
import { GET, POST } from './route';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local manually
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

// Mock the database pool
vi.mock('@/lib/db', () => ({
    default: {
        query: vi.fn()
    }
}));

import pool from '@/lib/db';

describe('Personas API', () => {
    describe('GET', () => {
        it('should return 400 when caseId is missing', async () => {
            const request = new Request('http://localhost:3000/api/personas');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.message).toBe('caseId query parameter is required');
        });

        it('should return 200 and a list of personas for a valid caseId', async () => {
            const mockPersonas = [
                { id: 1, case_id: 'case-123', first_name_th: 'John', last_name_th: 'Doe' },
                { id: 2, case_id: 'case-123', first_name_th: 'Jane', last_name_th: 'Smith' }
            ];
            
            vi.mocked(pool.query).mockResolvedValueOnce({ rows: mockPersonas } as any);

            const request = new Request('http://localhost:3000/api/personas?caseId=case-123');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(Array.isArray(data)).toBe(true);
            expect(data).toHaveLength(2);
            expect(pool.query).toHaveBeenCalledWith('SELECT DISTINCT ON (persona_id) * FROM personas WHERE case_id = $1 ORDER BY persona_id, created_at DESC', ['case-123']);
        });

        it('should return 500 when database error occurs', async () => {
            vi.mocked(pool.query).mockRejectedValueOnce(new Error('DB Error'));

            const request = new Request('http://localhost:3000/api/personas?caseId=case-123');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.message).toBe('Error fetching personas');
        });
    });

    describe('POST', () => {
        it('should create a new persona and return 201', async () => {
            const newPersona = {
                case_id: 'case-123',
                first_name_th: 'John',
                last_name_th: 'Doe',
                aliases: ['JD', 'Johnny'],
                phones: ['123456789'],
                role: 'Suspect'
            };
            
            const insertedPersona = { id: 1, ...newPersona };
            vi.mocked(pool.query).mockResolvedValueOnce({ rows: [insertedPersona] } as any);

            const request = new Request('http://localhost:3000/api/personas', {
                method: 'POST',
                body: JSON.stringify(newPersona),
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.case_id).toBe(newPersona.case_id);
            expect(data.first_name_th).toBe(newPersona.first_name_th);
            
            // Verify query arguments
            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO personas'),
                expect.arrayContaining([
                    newPersona.case_id,
                    newPersona.first_name_th,
                    newPersona.last_name_th,
                    JSON.stringify(newPersona.aliases),
                    JSON.stringify(newPersona.phones)
                ])
            );
        });

        it('should return 400 when case_id is missing', async () => {
            const request = new Request('http://localhost:3000/api/personas', {
                method: 'POST',
                body: JSON.stringify({ first_name_th: 'John' }),
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.message).toBe('case_id is required');
        });

        it('should return 500 when database error occurs', async () => {
            vi.mocked(pool.query).mockRejectedValueOnce(new Error('DB Error'));

            const request = new Request('http://localhost:3000/api/personas', {
                method: 'POST',
                body: JSON.stringify({ case_id: 'case-123' }),
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.message).toBe('Error creating persona');
        });
    });
});
