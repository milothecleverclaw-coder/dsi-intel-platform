import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { GET, POST, PATCH, DELETE } from './route';
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

// Mock Azure Storage
vi.mock('@azure/storage-blob', () => {
  return {
    BlobServiceClient: {
      fromConnectionString: vi.fn().mockReturnValue({
        getContainerClient: vi.fn().mockReturnValue({
          getBlockBlobClient: vi.fn().mockReturnValue({
            uploadData: vi.fn().mockResolvedValue({}),
            delete: vi.fn().mockResolvedValue({}),
            url: 'https://test.blob.core.windows.net/evidence/test.jpg'
          })
        })
      })
    }
  };
});

import pool from '@/lib/db';

describe('Persona Photos API', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('GET', () => {
        it('should return 200 and photos for a valid persona ID', async () => {
            const mockPhotos = [{ photo_id: 'p1', image_url: 'url1' }];
            vi.mocked(pool.query).mockResolvedValueOnce({ rows: mockPhotos } as any);

            const params = Promise.resolve({ id: 'pers-123' });
            const response = await GET(new Request('http://localhost'), { params });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toHaveLength(1);
        });
    });

    describe('POST', () => {
        it('should return 400 when maximum photos reached', async () => {
            vi.mocked(pool.query).mockResolvedValueOnce({ rows: [{ count: '5' }] } as any);

            const params = Promise.resolve({ id: 'pers-123' });
            const response = await POST(new Request('http://localhost'), { params });
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.message).toBe('Maximum 5 photos allowed per persona');
        });

        it('should return 201 when photo is uploaded successfully', async () => {
            vi.mocked(pool.query)
                .mockResolvedValueOnce({ rows: [{ count: '0' }] } as any) // count check
                .mockResolvedValueOnce({ rows: [{ photo_id: 'new-p1', image_url: 'url' }] } as any); // insert

            const formData = new FormData();
            const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
            formData.append('file', file);

            const params = Promise.resolve({ id: 'pers-123' });
            const request = new Request('http://localhost', {
                method: 'POST',
                body: formData,
            });

            const response = await POST(request, { params });
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.photo_id).toBe('new-p1');
        });
    });

    describe('PATCH', () => {
        it('should return 200 and update entity ID', async () => {
            vi.mocked(pool.query).mockResolvedValue({ rows: [] } as any);

            const params = Promise.resolve({ id: 'pers-123' });
            const request = new Request('http://localhost', {
                method: 'PATCH',
                body: JSON.stringify({ entityId: 'ent-123' }),
            });

            const response = await PATCH(request, { params });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.message).toBe('Entity ID updated');
        });
    });

    describe('DELETE', () => {
        it('should return 200 and delete photo', async () => {
            const mockPhoto = { photo_id: 'p1', image_url: 'https://test.com/evidence/p1.jpg' };
            vi.mocked(pool.query)
                .mockResolvedValueOnce({ rows: [mockPhoto] } as any) // select check
                .mockResolvedValueOnce({ rows: [] } as any); // delete

            const params = Promise.resolve({ id: 'pers-123' });
            const request = new Request('http://localhost?photoId=p1', {
                method: 'DELETE',
            });

            const response = await DELETE(request, { params });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.message).toBe('Photo deleted');
        });

        it('should return 404 when photo not found', async () => {
            vi.mocked(pool.query).mockResolvedValueOnce({ rows: [] } as any);

            const params = Promise.resolve({ id: 'pers-123' });
            const request = new Request('http://localhost?photoId=p99', {
                method: 'DELETE',
            });

            const response = await DELETE(request, { params });
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.message).toBe('Photo not found');
        });
    });
});
