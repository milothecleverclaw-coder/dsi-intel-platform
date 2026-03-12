import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, PUT, DELETE } from './route';
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

describe('Personas ID API', () => {
    const personaId = 'persona-123';
    const params = Promise.resolve({ id: personaId });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('GET', () => {
        it('should return 200 and the persona when found', async () => {
            const mockPersona = { persona_id: personaId, first_name_th: 'สมชาย' };
            vi.mocked(pool.query).mockResolvedValueOnce({ rows: [mockPersona] } as any);

            const response = await GET(new Request(`http://localhost/api/personas/${personaId}`), { params });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(mockPersona);
            expect(pool.query).toHaveBeenCalledWith('SELECT * FROM personas WHERE persona_id = $1', [personaId]);
        });

        it('should return 404 when persona is not found', async () => {
            vi.mocked(pool.query).mockResolvedValueOnce({ rows: [] } as any);

            const response = await GET(new Request(`http://localhost/api/personas/${personaId}`), { params });
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.message).toBe('Persona not found');
        });

        it('should return 500 when a database error occurs', async () => {
            vi.mocked(pool.query).mockRejectedValueOnce(new Error('DB Error'));

            const response = await GET(new Request(`http://localhost/api/personas/${personaId}`), { params });
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.message).toBe('Error fetching persona');
        });
    });

    describe('PUT', () => {
        it('should return 200 and updated persona when successful', async () => {
            const updateData = { first_name_th: 'สมชาย (ใหม่)', role: 'witness' };
            const updatedPersona = { persona_id: personaId, ...updateData };
            vi.mocked(pool.query).mockResolvedValueOnce({ rows: [updatedPersona] } as any);

            const request = new Request(`http://localhost/api/personas/${personaId}`, {
                method: 'PUT',
                body: JSON.stringify(updateData),
            });

            const response = await PUT(request, { params });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(updatedPersona);
            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE personas SET first_name_th = $1, role = $2 WHERE persona_id = $3'),
                ['สมชาย (ใหม่)', 'witness', personaId]
            );
        });

        it('should handle JSONB fields (aliases, phones)', async () => {
            const updateData = { aliases: ['test'], phones: ['0812345678'] };
            vi.mocked(pool.query).mockResolvedValueOnce({ rows: [{ persona_id: personaId, ...updateData }] } as any);

            const request = new Request(`http://localhost/api/personas/${personaId}`, {
                method: 'PUT',
                body: JSON.stringify(updateData),
            });

            const response = await PUT(request, { params });
            expect(response.status).toBe(200);
            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE personas SET aliases = $1::jsonb, phones = $2::jsonb WHERE persona_id = $3'),
                [JSON.stringify(['test']), JSON.stringify(['0812345678']), personaId]
            );
        });

        it('should return 400 when no fields are provided to update', async () => {
            const request = new Request(`http://localhost/api/personas/${personaId}`, {
                method: 'PUT',
                body: JSON.stringify({}),
            });

            const response = await PUT(request, { params });
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.message).toBe('No fields to update');
        });

        it('should return 404 when persona to update is not found', async () => {
            vi.mocked(pool.query).mockResolvedValueOnce({ rows: [] } as any);

            const request = new Request(`http://localhost/api/personas/${personaId}`, {
                method: 'PUT',
                body: JSON.stringify({ first_name_th: 'New Name' }),
            });

            const response = await PUT(request, { params });
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.message).toBe('Persona not found');
        });

        it('should return 500 when a database error occurs', async () => {
            vi.mocked(pool.query).mockRejectedValueOnce(new Error('DB Error'));

            const request = new Request(`http://localhost/api/personas/${personaId}`, {
                method: 'PUT',
                body: JSON.stringify({ first_name_th: 'New Name' }),
            });

            const response = await PUT(request, { params });
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.message).toBe('Error updating persona');
        });
    });

    describe('DELETE', () => {
        it('should return 200 when persona is deleted', async () => {
            vi.mocked(pool.query).mockResolvedValueOnce({ rows: [{ persona_id: personaId }] } as any);

            const response = await DELETE(new Request(`http://localhost/api/personas/${personaId}`, { method: 'DELETE' }), { params });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.message).toBe('Persona deleted');
            expect(pool.query).toHaveBeenCalledWith('DELETE FROM personas WHERE persona_id = $1 RETURNING *', [personaId]);
        });

        it('should return 404 when persona to delete is not found', async () => {
            vi.mocked(pool.query).mockResolvedValueOnce({ rows: [] } as any);

            const response = await DELETE(new Request(`http://localhost/api/personas/${personaId}`, { method: 'DELETE' }), { params });
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.message).toBe('Persona not found');
        });

        it('should return 500 when a database error occurs', async () => {
            vi.mocked(pool.query).mockRejectedValueOnce(new Error('DB Error'));

            const response = await DELETE(new Request(`http://localhost/api/personas/${personaId}`, { method: 'DELETE' }), { params });
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.message).toBe('Error deleting persona');
        });
    });
});
