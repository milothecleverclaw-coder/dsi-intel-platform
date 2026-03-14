import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';

// Set env vars BEFORE any imports
process.env.AZURE_STORAGE_CONNECTION_STRING = 'DefaultEndpointsProtocol=https;AccountName=testaccount;AccountKey=dGVzdGtleQ==;EndpointSuffix=core.windows.net';
process.env.AZURE_STORAGE_CONTAINER = 'evidence';

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
    },
    StorageSharedKeyCredential: class MockStorageSharedKeyCredential {
      accountName: string;
      accountKey: string;
      constructor(accountName: string, accountKey: string) {
        this.accountName = accountName;
        this.accountKey = accountKey;
      }
    },
    BlobSASPermissions: {
      parse: vi.fn().mockReturnValue('r')
    },
    generateBlobSASQueryParameters: vi.fn().mockReturnValue({
      toString: vi.fn().mockReturnValue('se=2024-01-01&sp=r&sig=testsignature')
    })
  };
});

// Import pool after mocks
import pool from '@/lib/db';

// Type for the route handlers
interface RouteHandlers {
  GET: (request: Request, context: { params: Promise<{ id: string }> }) => Promise<Response>;
  POST: (request: Request, context: { params: Promise<{ id: string }> }) => Promise<Response>;
  PATCH: (request: Request, context: { params: Promise<{ id: string }> }) => Promise<Response>;
  DELETE: (request: Request, context: { params: Promise<{ id: string }> }) => Promise<Response>;
}

// Use dynamic import to ensure env vars are set before route module loads
let GET: RouteHandlers['GET'];
let POST: RouteHandlers['POST'];
let PATCH: RouteHandlers['PATCH'];
let DELETE: RouteHandlers['DELETE'];

beforeAll(async () => {
  const route = await import('./route.js');
  GET = route.GET;
  POST = route.POST;
  PATCH = route.PATCH;
  DELETE = route.DELETE;
});

describe('Persona Photos API', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('GET', () => {
        it('should return 200 and photos for a valid persona ID', async () => {
            const mockPhotos = [{ photo_id: 'p1', image_url: 'https://test.blob.core.windows.net/evidence/personas/pers-123/photos/1234567890-test.jpg' }];
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
                .mockResolvedValueOnce({ rows: [{ photo_id: 'new-p1', image_url: 'https://test.blob.core.windows.net/evidence/personas/pers-123/photos/1234567890-test.jpg' }] } as any); // insert

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
            const mockPhoto = { photo_id: 'p1', image_url: 'https://test.blob.core.windows.net/evidence/personas/pers-123/photos/1234567890-test.jpg' };
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
