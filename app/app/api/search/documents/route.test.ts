import { describe, it, expect, beforeAll, vi } from 'vitest';
import { POST } from './route';
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

describe('Search Documents API', () => {
    it('should return 400 when caseId or query is missing', async () => {
        const request = new Request('http://localhost:3000/api/search/documents', {
            method: 'POST',
            body: JSON.stringify({ query: 'test' }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.message).toBe('caseId and query are required');
    });

    it('should return 200 and search results for a valid request', async () => {
        const mockRows = [
            {
                evidence_id: 'ev-1',
                filename: 'doc1.txt',
                display_name: 'Document 1',
                file_type: 'document',
                matching_text: 'This is a test document with some content'
            }
        ];

        vi.mocked(pool.query).mockResolvedValueOnce({ rows: mockRows } as any);

        const request = new Request('http://localhost:3000/api/search/documents', {
            method: 'POST',
            body: JSON.stringify({ caseId: 'case-123', query: 'test' }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.count).toBe(1);
        expect(data.results[0].filename).toBe('doc1.txt');
    });

    it('should handle database error correctly', async () => {
        vi.mocked(pool.query).mockRejectedValueOnce(new Error('DB Error'));

        const request = new Request('http://localhost:3000/api/search/documents', {
            method: 'POST',
            body: JSON.stringify({ caseId: 'case-123', query: 'test' }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.message).toBe('DB Error');
    });

    it('should handle missing column error by returning empty results', async () => {
        const error = new Error('Column not found');
        (error as any).code = '42703';
        vi.mocked(pool.query).mockRejectedValueOnce(error);

        const request = new Request('http://localhost:3000/api/search/documents', {
            method: 'POST',
            body: JSON.stringify({ caseId: 'case-123', query: 'test' }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.count).toBe(0);
        expect(data.message).toContain('extraction pending');
    });
});
