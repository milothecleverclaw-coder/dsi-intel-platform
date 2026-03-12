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

// Hoist mocks
const { mockUploadData, mockGetContainerClient } = vi.hoisted(() => ({
    mockUploadData: vi.fn(),
    mockGetContainerClient: vi.fn().mockReturnValue({
        getBlockBlobClient: vi.fn().mockReturnValue({
            uploadData: vi.fn()
        })
    })
}));

vi.mock('@/lib/db', () => ({
    default: {
        query: vi.fn()
    }
}));

vi.mock('@azure/storage-blob', () => ({
    BlobServiceClient: {
        fromConnectionString: vi.fn().mockReturnValue({
            getContainerClient: mockGetContainerClient
        })
    }
}));

import pool from '@/lib/db';
import { BlobServiceClient } from '@azure/storage-blob';

const FormData = globalThis.FormData;
const File = globalThis.File;

describe('Evidence API', () => {
    describe('GET', () => {
        it('should return 200 and evidence list for a caseId', async () => {
            const mockEvidence = [
                { id: 1, case_id: 'case-123', filename: 'test.png', display_name: 'Test Image' },
                { id: 2, case_id: 'case-123', filename: 'doc.pdf', display_name: 'Doc' }
            ];
            
            vi.mocked(pool.query).mockResolvedValueOnce({ rows: mockEvidence } as any);

            const request = new Request('http://localhost:3000/api/evidence?caseId=case-123');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(Array.isArray(data)).toBe(true);
            expect(data).toHaveLength(2);
            expect(pool.query).toHaveBeenCalledWith(
                'SELECT * FROM evidence WHERE case_id = $1 ORDER BY uploaded_at DESC',
                ['case-123']
            );
        });

        it('should return 400 when caseId is missing', async () => {
            const request = new Request('http://localhost:3000/api/evidence');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.message).toBe('caseId required');
        });

        it('should return 500 when database error occurs', async () => {
            vi.mocked(pool.query).mockRejectedValueOnce(new Error('DB Error'));

            const request = new Request('http://localhost:3000/api/evidence?caseId=error-case');
            const response = await GET(request);
            const data = await response.json();
            expect(response.status).toBe(500);
            expect(data.message).toBe('Fetch failed');
        });
    });

    describe('POST', () => {
        it('should upload evidence and return 201', async () => {
            const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
            const formData = new FormData();
            formData.append('file', file);
            formData.append('caseId', 'case-123');
            formData.append('displayName', 'My Evidence');

            const insertedEvidence = { 
                id: 1, 
                case_id: 'case-123', 
                filename: 'test.png', 
                display_name: 'My Evidence', 
                file_type: 'image',
                blob_path: 'case-123/timestamp-test.png'
            };
            vi.mocked(pool.query).mockResolvedValueOnce({ rows: [insertedEvidence] } as any);
            
            const mockBlockBlobClient = { uploadData: vi.fn().mockResolvedValue({}) };
            mockGetContainerClient.mockReturnValue({
                getBlockBlobClient: vi.fn().mockReturnValue(mockBlockBlobClient)
            });

            const request = new Request('http://localhost:3000/api/evidence', {
                method: 'POST',
                body: formData,
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.display_name).toBe('My Evidence');
            expect(mockBlockBlobClient.uploadData).toHaveBeenCalled();
            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO evidence'),
                expect.arrayContaining(['case-123', 'test.png', 'My Evidence', 'image'])
            );
        });

        it('should return 400 when file or caseId is missing', async () => {
            const formData = new FormData();
            formData.append('caseId', 'case-123');

            const request = new Request('http://localhost:3000/api/evidence', {
                method: 'POST',
                body: formData,
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.message).toBe('file and caseId required');
        });

        it('should return 500 when upload fails', async () => {
            const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
            const formData = new FormData();
            formData.append('file', file);
            formData.append('caseId', 'case-123');

            mockGetContainerClient.mockReturnValue({
                getBlockBlobClient: vi.fn().mockReturnValue({
                    uploadData: vi.fn().mockRejectedValue(new Error('Azure Error'))
                })
            });

            const request = new Request('http://localhost:3000/api/evidence', {
                method: 'POST',
                body: formData,
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.message).toBe('Upload failed');
        });
    });
});
