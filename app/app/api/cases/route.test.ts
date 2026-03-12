import { describe, it, expect, beforeAll, vi } from 'vitest';
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

describe('Cases API', () => {
    it('GET should return 200 and a list of cases', async () => {
        const mockCases = [
            { id: 1, case_number: 'DSI-2024-001', title: 'Test Case 1' },
            { id: 2, case_number: 'DSI-2024-002', title: 'Test Case 2' }
        ];
        
        vi.mocked(pool.query).mockResolvedValueOnce({ rows: mockCases } as any);

        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(Array.isArray(data)).toBe(true);
        expect(data).toHaveLength(2);
        expect(data[0].title).toBe('Test Case 1');
        expect(pool.query).toHaveBeenCalledWith('SELECT * FROM cases');
    });

    it('GET should return 500 when database error occurs', async () => {
        vi.mocked(pool.query).mockRejectedValueOnce(new Error('DB Error'));

        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.message).toBe('Error fetching cases');
    });

    it('POST should create a new case and return 201', async () => {
        const newCase = { title: 'New Case', narrative_report: 'Some report' };
        
        // First query for count (case number generation)
        vi.mocked(pool.query).mockResolvedValueOnce({ rows: [{ count: '5' }] } as any);
        
        // Second query for insert
        const year = new Date().getFullYear();
        const expectedCaseNumber = `DSI-${year}-006`;
        const insertedCase = { id: 6, case_number: expectedCaseNumber, ...newCase };
        vi.mocked(pool.query).mockResolvedValueOnce({ rows: [insertedCase] } as any);

        const request = new Request('http://localhost:3000/api/cases', {
            method: 'POST',
            body: JSON.stringify(newCase),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.case_number).toBe(expectedCaseNumber);
        expect(data.title).toBe(newCase.title);
        
        // Verify case number generation query
        expect(pool.query).toHaveBeenCalledWith(
            'SELECT COUNT(*) FROM cases WHERE case_number LIKE $1',
            [`DSI-${year}-%`]
        );
    });

    it('POST should return 400 when title is missing', async () => {
        const request = new Request('http://localhost:3000/api/cases', {
            method: 'POST',
            body: JSON.stringify({ narrative_report: 'No title' }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.message).toBe('Title is required');
    });

    it('POST should return 500 when database error occurs', async () => {
        vi.mocked(pool.query).mockRejectedValueOnce(new Error('DB Error'));

        const request = new Request('http://localhost:3000/api/cases', {
            method: 'POST',
            body: JSON.stringify({ title: 'Error case' }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.message).toBe('Error creating case');
    });
});
