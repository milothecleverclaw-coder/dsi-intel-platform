import { describe, it, expect, vi } from 'vitest';
import { GET, PUT } from './route';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local manually
function loadEnv() {
    const envPath = path.resolve(__dirname, '../../../../../.env.local');
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

describe('Cases ID API', () => {
    const caseId = '123';
    const params = Promise.resolve({ id: caseId });

    describe('GET', () => {
        it('should return 200 and the case when found', async () => {
            const mockCase = { case_id: caseId, title: 'Test Case' };
            vi.mocked(pool.query).mockResolvedValueOnce({ rows: [mockCase] } as any);

            const response = await GET(new Request(`http://localhost/api/cases/${caseId}`), { params });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(mockCase);
            expect(pool.query).toHaveBeenCalledWith('SELECT * FROM cases WHERE case_id = $1', [caseId]);
        });

        it('should return 404 when case is not found', async () => {
            vi.mocked(pool.query).mockResolvedValueOnce({ rows: [] } as any);

            const response = await GET(new Request(`http://localhost/api/cases/${caseId}`), { params });
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.message).toBe('Case not found');
        });

        it('should return 500 when a database error occurs', async () => {
            vi.mocked(pool.query).mockRejectedValueOnce(new Error('DB Error'));

            const response = await GET(new Request(`http://localhost/api/cases/${caseId}`), { params });
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.message).toBe('Error fetching case');
        });
    });

    describe('PUT', () => {
        it('should return 200 and updated case when successful', async () => {
            const updateData = { title: 'Updated Title', status: 'closed' };
            const updatedCase = { case_id: caseId, ...updateData };
            vi.mocked(pool.query).mockResolvedValueOnce({ rows: [updatedCase] } as any);

            const request = new Request(`http://localhost/api/cases/${caseId}`, {
                method: 'PUT',
                body: JSON.stringify(updateData),
            });

            const response = await PUT(request, { params });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(updatedCase);
            // Verify dynamic query construction
            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE cases SET title = $1, status = $2, updated_at = NOW() WHERE case_id = $3'),
                ['Updated Title', 'closed', caseId]
            );
        });

        it('should return 400 when no fields are provided to update', async () => {
            const request = new Request(`http://localhost/api/cases/${caseId}`, {
                method: 'PUT',
                body: JSON.stringify({}),
            });

            const response = await PUT(request, { params });
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.message).toBe('No fields to update');
        });

        it('should return 404 when case to update is not found', async () => {
            vi.mocked(pool.query).mockResolvedValueOnce({ rows: [] } as any);

            const request = new Request(`http://localhost/api/cases/${caseId}`, {
                method: 'PUT',
                body: JSON.stringify({ title: 'New Title' }),
            });

            const response = await PUT(request, { params });
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.message).toBe('Case not found');
        });

        it('should return 500 when a database error occurs', async () => {
            vi.mocked(pool.query).mockRejectedValueOnce(new Error('DB Error'));

            const request = new Request(`http://localhost/api/cases/${caseId}`, {
                method: 'PUT',
                body: JSON.stringify({ title: 'New Title' }),
            });

            const response = await PUT(request, { params });
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.message).toBe('Error updating case');
        });
    });
});
