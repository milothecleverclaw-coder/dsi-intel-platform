import { describe, it, expect, beforeAll } from 'vitest';
import { GET } from './route';
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
import { vi } from 'vitest';
vi.mock('@/lib/db', () => ({
    default: {
        query: vi.fn()
    }
}));

import pool from '@/lib/db';

describe('Pins Timeline API', () => {
    it('should return 400 when caseId is missing', async () => {
        const params = Promise.resolve({ caseId: '' });
        const response = await GET(new Request('http://localhost'), { params });

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.message).toBe('caseId is required in path parameters');
    });

    it('should return timeline pins for a valid caseId', async () => {
        const mockPins = [
            {
                pin_id: 'pin-1',
                case_id: 'case-123',
                evidence_id: 'evidence-1',
                incident_time: '2024-01-15T10:30:00Z',
                pinned_at: '2024-01-15T11:00:00Z',
                evidence_filename: 'video.mp4',
                evidence_display_name: 'Security Camera Footage',
            }
        ];

        vi.mocked(pool.query).mockResolvedValueOnce({ rows: mockPins } as any);

        const params = Promise.resolve({ caseId: 'case-123' });
        const response = await GET(new Request('http://localhost'), { params });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data).toEqual(mockPins);
    });

    it('should return 500 on database error', async () => {
        vi.mocked(pool.query).mockRejectedValueOnce(new Error('Database connection failed'));

        const params = Promise.resolve({ caseId: 'case-123' });
        const response = await GET(new Request('http://localhost'), { params });

        expect(response.status).toBe(500);
        const data = await response.json();
        expect(data.message).toBe('Error fetching timeline');
    });
});
