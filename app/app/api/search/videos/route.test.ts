import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { POST } from './route';

describe('Search Videos API', () => {
    beforeAll(() => {
        process.env.TWELVE_LABS_API_KEY = 'test-key';
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should return 400 when query or indexId is missing', async () => {
        const request = new Request('http://localhost:3000/api/search/videos', {
            method: 'POST',
            body: JSON.stringify({ query: 'test' }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.message).toBe('query and indexId required');
    });

    it('should return 200 and search results for a valid request', async () => {
        const mockData = {
            data: [
                {
                    video_id: 'vid-1',
                    start: 10,
                    end: 20,
                    confidence: 'high'
                }
            ]
        };

        const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => mockData
        } as Response);

        const request = new Request('http://localhost:3000/api/search/videos', {
            method: 'POST',
            body: JSON.stringify({ query: 'person', indexId: 'idx-123' }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.data).toHaveLength(1);
        expect(fetchSpy).toHaveBeenCalled();
    });

    it('should handle Twelve Labs API errors correctly', async () => {
        const mockError = { message: 'API limit reached' };

        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: false,
            status: 429,
            json: async () => mockError
        } as Response);

        const request = new Request('http://localhost:3000/api/search/videos', {
            method: 'POST',
            body: JSON.stringify({ query: 'person', indexId: 'idx-123' }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(429);
        expect(data.message).toBe('Search failed');
        expect(data.error).toEqual(mockError);
    });

    it('should handle network errors correctly', async () => {
        vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));

        const request = new Request('http://localhost:3000/api/search/videos', {
            method: 'POST',
            body: JSON.stringify({ query: 'person', indexId: 'idx-123' }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.message).toBe('Network error');
    });
});
