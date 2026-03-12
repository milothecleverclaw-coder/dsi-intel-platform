import { describe, it, expect, beforeAll } from 'vitest';
import { POST } from './route';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local manually
function loadEnv() {
    const envPath = path.resolve(__dirname, '../../../../.env.local');
    console.log('Loading env from:', envPath);
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

loadEnv();

const FormData = globalThis.FormData;
const File = globalThis.File;

describe('Evidence Preview API', () => {
    beforeAll(() => {
        console.log('ENV check:', {
            hasEndpoint: !!process.env.AZURE_DI_ENDPOINT,
            hasApiKey: !!process.env.AZURE_DI_API_KEY,
            hasConnString: !!process.env.AZURE_STORAGE_CONNECTION_STRING,
        });
        console.log('FormData available:', !!FormData, 'File available:', !!File);
    });

    it('should return 400 when no file is provided', async () => {
        const formData = new FormData();
        
        const request = new Request('http://localhost:3000/api/evidence/preview', {
            method: 'POST',
            body: formData,
        });

        const response = await POST(request);
        const data = await response.json();
        console.log('No file response:', response.status, data);
        
        expect(response.status).toBe(400);
        expect(data.message).toBe('file is required');
    });

    it('should return 400 when file type is not supported', async () => {
        const file = new File(['dummy content'], 'test.mp4', { type: 'video/mp4' });
        const formData = new FormData();
        formData.append('file', file);
        
        const request = new Request('http://localhost:3000/api/evidence/preview', {
            method: 'POST',
            body: formData,
        });

        const response = await POST(request);
        const data = await response.json();
        console.log('Unsupported type response:', response.status, data);
        
        expect(response.status).toBe(400);
        expect(data.message).toBe('File type not supported for preview');
    });

    it('should successfully analyze a real image document', async () => {
        // Use a real PNG from node_modules for testing
        const testImagePath = path.resolve(__dirname, '../../../../node_modules/@pm2/io/pres/io-white.png');
        const imageBuffer = fs.readFileSync(testImagePath);
        
        const file = new File([imageBuffer], 'test-document.png', { type: 'image/png' });
        const formData = new FormData();
        formData.append('file', file);

        const request = new Request('http://localhost:3000/api/evidence/preview', {
            method: 'POST',
            body: formData,
        });

        const response = await POST(request);
        const data = await response.json();
        console.log('Success response:', response.status, JSON.stringify(data).slice(0, 200));
        
        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.filename).toBe('test-document.png');
        expect(data.fileType).toBe('image/png');
        expect(data.pages).toBeDefined();
        expect(Array.isArray(data.pages)).toBe(true);
    }, 60000);
});
