import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';

vi.hoisted(() => {
  process.env.TWELVE_LABS_API_KEY = 'test-key';
});

import { GET, POST } from './route';

describe('Twelve Labs Entities API', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    describe('POST', () => {
        it('should return 400 when required fields are missing', async () => {
            const request = new Request('http://localhost:3000/api/twelve-labs/entities', {
                method: 'POST',
                body: JSON.stringify({ name: 'test' }),
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.message).toBe('collectionId, name, and photos are required');
        });

        it('should return 200 when entity is created successfully', async () => {
            const mockData = {
                id: 'ent-123',
                name: 'Test Entity',
                collection_id: 'coll-123',
                created_at: '2024-01-15T10:30:00Z'
            };

            const mockFetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                json: async () => mockData
            });
            vi.stubGlobal('fetch', mockFetch);

            const request = new Request('http://localhost:3000/api/twelve-labs/entities', {
                method: 'POST',
                body: JSON.stringify({
                    collectionId: 'coll-123',
                    name: 'Test Entity',
                    photos: ['http://example.com/photo.jpg']
                }),
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.entityId).toBe('ent-123');
        });
    });

    describe('GET', () => {
        it('should return 200 when entity is fetched successfully', async () => {
            const mockData = { id: 'ent-123', name: 'Test Entity' };

            const mockFetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                json: async () => mockData
            });
            vi.stubGlobal('fetch', mockFetch);

            const request = new Request('http://localhost:3000/api/twelve-labs/entities?collectionId=coll-123&entityId=ent-123');
            
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.id).toBe('ent-123');
        });
    });
});
