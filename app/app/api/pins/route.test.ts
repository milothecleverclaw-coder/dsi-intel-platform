import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from './route';

// Hoist mock for pool
vi.mock('@/lib/db', () => ({
    default: {
        query: vi.fn()
    }
}));

import pool from '@/lib/db';

describe('Pins API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('GET', () => {
        it('should return 200 and pins list for a caseId', async () => {
            const mockPins = [
                { pin_id: 'P001', case_id: 'case-123', evidence_id: 'e1', pin_type: 'location', pinned_at: '2024-01-01T00:00:00Z' },
                { pin_id: 'P002', case_id: 'case-123', evidence_id: 'e2', pin_type: 'timestamp', pinned_at: '2024-01-02T00:00:00Z' }
            ];
            
            vi.mocked(pool.query).mockResolvedValueOnce({ rows: mockPins } as any);

            const request = new Request('http://localhost:3000/api/pins?caseId=case-123');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(Array.isArray(data)).toBe(true);
            expect(data).toHaveLength(2);
            expect(pool.query).toHaveBeenCalledWith(
                'SELECT * FROM pins WHERE case_id = $1 ORDER BY pinned_at DESC',
                ['case-123']
            );
        });

        it('should return empty array when no pins found', async () => {
            vi.mocked(pool.query).mockResolvedValueOnce({ rows: [] } as any);

            const request = new Request('http://localhost:3000/api/pins?caseId=empty-case');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(Array.isArray(data)).toBe(true);
            expect(data).toHaveLength(0);
        });

        it('should return 400 when caseId is missing', async () => {
            const request = new Request('http://localhost:3000/api/pins');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.message).toBe('caseId query parameter is required');
        });

        it('should return 400 when caseId is empty string', async () => {
            const request = new Request('http://localhost:3000/api/pins?caseId=');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.message).toBe('caseId query parameter is required');
        });

        it('should return 500 when database error occurs', async () => {
            vi.mocked(pool.query).mockRejectedValueOnce(new Error('DB Connection Error'));

            const request = new Request('http://localhost:3000/api/pins?caseId=error-case');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.message).toBe('Error fetching pins');
        });

        it('should handle special characters in caseId', async () => {
            vi.mocked(pool.query).mockResolvedValueOnce({ rows: [] } as any);

            const request = new Request('http://localhost:3000/api/pins?caseId=case-with-special%20chars');
            const response = await GET(request);

            expect(response.status).toBe(200);
            expect(pool.query).toHaveBeenCalledWith(
                'SELECT * FROM pins WHERE case_id = $1 ORDER BY pinned_at DESC',
                ['case-with-special chars']
            );
        });

        it('should return JSON response for successful GET', async () => {
            vi.mocked(pool.query).mockResolvedValueOnce({ rows: [] } as any);

            const request = new Request('http://localhost:3000/api/pins?caseId=test');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(Array.isArray(data)).toBe(true);
        });
    });

    describe('POST', () => {
        it('should create a pin and return 201 with minimal fields', async () => {
            const mockSequence = { seq: 5 };
            const mockInsertedPin = {
                pin_id: 'P005',
                case_id: 'case-123',
                evidence_id: null,
                pin_type: null,
                timestamp_start: null,
                timestamp_end: null,
                incident_time: null,
                context: null,
                importance: null,
                tagged_personas: null,
                ai_context_data: null
            };

            vi.mocked(pool.query)
                .mockResolvedValueOnce({ rows: [mockSequence] } as any)
                .mockResolvedValueOnce({ rows: [mockInsertedPin] } as any);

            const request = new Request('http://localhost:3000/api/pins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ case_id: 'case-123' })
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.pin_id).toBe('P005');
            expect(data.case_id).toBe('case-123');
        });

        it('should create a pin with all fields', async () => {
            const mockSequence = { seq: 10 };
            const mockInsertedPin = {
                pin_id: 'P010',
                case_id: 'case-456',
                evidence_id: 'ev-789',
                pin_type: 'location',
                timestamp_start: '2024-01-01T10:00:00Z',
                timestamp_end: '2024-01-01T12:00:00Z',
                incident_time: '2024-01-01T11:00:00Z',
                context: 'Suspicious activity near the entrance',
                importance: 'high',
                tagged_personas: ['person-1', 'person-2'],
                ai_context_data: { confidence: 0.95, labels: ['vehicle', 'person'] }
            };

            vi.mocked(pool.query)
                .mockResolvedValueOnce({ rows: [mockSequence] } as any)
                .mockResolvedValueOnce({ rows: [mockInsertedPin] } as any);

            const requestBody = {
                case_id: 'case-456',
                evidence_id: 'ev-789',
                pin_type: 'location',
                timestamp_start: '2024-01-01T10:00:00Z',
                timestamp_end: '2024-01-01T12:00:00Z',
                incident_time: '2024-01-01T11:00:00Z',
                context: 'Suspicious activity near the entrance',
                importance: 'high',
                tagged_personas: ['person-1', 'person-2'],
                ai_context_data: { confidence: 0.95, labels: ['vehicle', 'person'] }
            };

            const request = new Request('http://localhost:3000/api/pins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.pin_id).toBe('P010');
            expect(data.case_id).toBe('case-456');
            expect(data.evidence_id).toBe('ev-789');
            expect(data.pin_type).toBe('location');
            expect(data.context).toBe('Suspicious activity near the entrance');
        });

        it('should return 400 when case_id is missing', async () => {
            const request = new Request('http://localhost:3000/api/pins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ evidence_id: 'ev-123' })
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.message).toBe('case_id is required');
        });

        it('should return 400 when body is empty JSON', async () => {
            const request = new Request('http://localhost:3000/api/pins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.message).toBe('case_id is required');
        });

        it('should return 500 when sequence query fails', async () => {
            vi.mocked(pool.query).mockRejectedValueOnce(new Error('Sequence Error'));

            const request = new Request('http://localhost:3000/api/pins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ case_id: 'case-123' })
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.message).toBe('Error creating pin');
        });

        it('should return 500 when insert query fails', async () => {
            const mockSequence = { seq: 1 };
            vi.mocked(pool.query)
                .mockResolvedValueOnce({ rows: [mockSequence] } as any)
                .mockRejectedValueOnce(new Error('Insert Error'));

            const request = new Request('http://localhost:3000/api/pins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ case_id: 'case-123' })
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.message).toBe('Error creating pin');
        });

        it('should generate pin_id with proper padding (P001 for seq 1)', async () => {
            const mockSequence = { seq: 1 };
            const mockInsertedPin = { pin_id: 'P001', case_id: 'case-123' };

            vi.mocked(pool.query)
                .mockResolvedValueOnce({ rows: [mockSequence] } as any)
                .mockResolvedValueOnce({ rows: [mockInsertedPin] } as any);

            const request = new Request('http://localhost:3000/api/pins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ case_id: 'case-123' })
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.pin_id).toBe('P001');
        });

        it('should generate pin_id with proper padding (P100 for seq 100)', async () => {
            const mockSequence = { seq: 100 };
            const mockInsertedPin = { pin_id: 'P100', case_id: 'case-123' };

            vi.mocked(pool.query)
                .mockResolvedValueOnce({ rows: [mockSequence] } as any)
                .mockResolvedValueOnce({ rows: [mockInsertedPin] } as any);

            const request = new Request('http://localhost:3000/api/pins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ case_id: 'case-123' })
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.pin_id).toBe('P100');
        });

        it('should return JSON response for successful POST', async () => {
            const mockSequence = { seq: 1 };
            const mockInsertedPin = { pin_id: 'P001', case_id: 'case-123' };

            vi.mocked(pool.query)
                .mockResolvedValueOnce({ rows: [mockSequence] } as any)
                .mockResolvedValueOnce({ rows: [mockInsertedPin] } as any);

            const request = new Request('http://localhost:3000/api/pins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ case_id: 'case-123' })
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(typeof data).toBe('object');
            expect(data.pin_id).toBeDefined();
        });

        it('should handle pin_type location', async () => {
            const mockSequence = { seq: 1 };
            const mockInsertedPin = { pin_id: 'P001', case_id: 'case-123', pin_type: 'location' };

            vi.mocked(pool.query)
                .mockResolvedValueOnce({ rows: [mockSequence] } as any)
                .mockResolvedValueOnce({ rows: [mockInsertedPin] } as any);

            const request = new Request('http://localhost:3000/api/pins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ case_id: 'case-123', pin_type: 'location' })
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.pin_type).toBe('location');
        });

        it('should handle pin_type timestamp', async () => {
            const mockSequence = { seq: 2 };
            const mockInsertedPin = { pin_id: 'P002', case_id: 'case-123', pin_type: 'timestamp' };

            vi.mocked(pool.query)
                .mockResolvedValueOnce({ rows: [mockSequence] } as any)
                .mockResolvedValueOnce({ rows: [mockInsertedPin] } as any);

            const request = new Request('http://localhost:3000/api/pins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ case_id: 'case-123', pin_type: 'timestamp' })
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.pin_type).toBe('timestamp');
        });

        it('should handle pin_type person', async () => {
            const mockSequence = { seq: 3 };
            const mockInsertedPin = { pin_id: 'P003', case_id: 'case-123', pin_type: 'person' };

            vi.mocked(pool.query)
                .mockResolvedValueOnce({ rows: [mockSequence] } as any)
                .mockResolvedValueOnce({ rows: [mockInsertedPin] } as any);

            const request = new Request('http://localhost:3000/api/pins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ case_id: 'case-123', pin_type: 'person' })
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.pin_type).toBe('person');
        });

        it('should handle pin_type event', async () => {
            const mockSequence = { seq: 4 };
            const mockInsertedPin = { pin_id: 'P004', case_id: 'case-123', pin_type: 'event' };

            vi.mocked(pool.query)
                .mockResolvedValueOnce({ rows: [mockSequence] } as any)
                .mockResolvedValueOnce({ rows: [mockInsertedPin] } as any);

            const request = new Request('http://localhost:3000/api/pins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ case_id: 'case-123', pin_type: 'event' })
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.pin_type).toBe('event');
        });

        it('should handle pin_type evidence', async () => {
            const mockSequence = { seq: 5 };
            const mockInsertedPin = { pin_id: 'P005', case_id: 'case-123', pin_type: 'evidence' };

            vi.mocked(pool.query)
                .mockResolvedValueOnce({ rows: [mockSequence] } as any)
                .mockResolvedValueOnce({ rows: [mockInsertedPin] } as any);

            const request = new Request('http://localhost:3000/api/pins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ case_id: 'case-123', pin_type: 'evidence' })
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.pin_type).toBe('evidence');
        });

        it('should handle importance low', async () => {
            const mockSequence = { seq: 1 };
            const mockInsertedPin = { pin_id: 'P001', case_id: 'case-123', importance: 'low' };

            vi.mocked(pool.query)
                .mockResolvedValueOnce({ rows: [mockSequence] } as any)
                .mockResolvedValueOnce({ rows: [mockInsertedPin] } as any);

            const request = new Request('http://localhost:3000/api/pins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ case_id: 'case-123', importance: 'low' })
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.importance).toBe('low');
        });

        it('should handle importance medium', async () => {
            const mockSequence = { seq: 2 };
            const mockInsertedPin = { pin_id: 'P002', case_id: 'case-123', importance: 'medium' };

            vi.mocked(pool.query)
                .mockResolvedValueOnce({ rows: [mockSequence] } as any)
                .mockResolvedValueOnce({ rows: [mockInsertedPin] } as any);

            const request = new Request('http://localhost:3000/api/pins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ case_id: 'case-123', importance: 'medium' })
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.importance).toBe('medium');
        });

        it('should handle importance high', async () => {
            const mockSequence = { seq: 3 };
            const mockInsertedPin = { pin_id: 'P003', case_id: 'case-123', importance: 'high' };

            vi.mocked(pool.query)
                .mockResolvedValueOnce({ rows: [mockSequence] } as any)
                .mockResolvedValueOnce({ rows: [mockInsertedPin] } as any);

            const request = new Request('http://localhost:3000/api/pins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ case_id: 'case-123', importance: 'high' })
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.importance).toBe('high');
        });

        it('should handle importance critical', async () => {
            const mockSequence = { seq: 4 };
            const mockInsertedPin = { pin_id: 'P004', case_id: 'case-123', importance: 'critical' };

            vi.mocked(pool.query)
                .mockResolvedValueOnce({ rows: [mockSequence] } as any)
                .mockResolvedValueOnce({ rows: [mockInsertedPin] } as any);

            const request = new Request('http://localhost:3000/api/pins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ case_id: 'case-123', importance: 'critical' })
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.importance).toBe('critical');
        });

        it('should handle null optional fields', async () => {
            const mockSequence = { seq: 1 };
            const mockInsertedPin = {
                pin_id: 'P001',
                case_id: 'case-123',
                evidence_id: null,
                pin_type: null,
                timestamp_start: null,
                timestamp_end: null,
                incident_time: null,
                context: null,
                importance: null,
                tagged_personas: null,
                ai_context_data: null
            };

            vi.mocked(pool.query)
                .mockResolvedValueOnce({ rows: [mockSequence] } as any)
                .mockResolvedValueOnce({ rows: [mockInsertedPin] } as any);

            const request = new Request('http://localhost:3000/api/pins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    case_id: 'case-123',
                    evidence_id: null,
                    pin_type: null,
                    context: null
                })
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.evidence_id).toBeNull();
            expect(data.pin_type).toBeNull();
            expect(data.context).toBeNull();
        });

        it('should handle complex ai_context_data object', async () => {
            const mockSequence = { seq: 1 };
            const complexAiContext = {
                confidence: 0.87,
                labels: ['person', 'vehicle', 'building'],
                boundingBoxes: [{ x: 10, y: 20, width: 100, height: 200 }],
                transcript: 'Sample transcript text',
                metadata: { source: 'rekognition', version: '2.0' }
            };
            const mockInsertedPin = {
                pin_id: 'P001',
                case_id: 'case-123',
                ai_context_data: complexAiContext
            };

            vi.mocked(pool.query)
                .mockResolvedValueOnce({ rows: [mockSequence] } as any)
                .mockResolvedValueOnce({ rows: [mockInsertedPin] } as any);

            const request = new Request('http://localhost:3000/api/pins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    case_id: 'case-123',
                    ai_context_data: complexAiContext
                })
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.ai_context_data).toEqual(complexAiContext);
        });

        it('should handle tagged_personas array', async () => {
            const mockSequence = { seq: 1 };
            const taggedPersonas = ['persona-1', 'persona-2', 'persona-3'];
            const mockInsertedPin = {
                pin_id: 'P001',
                case_id: 'case-123',
                tagged_personas: taggedPersonas
            };

            vi.mocked(pool.query)
                .mockResolvedValueOnce({ rows: [mockSequence] } as any)
                .mockResolvedValueOnce({ rows: [mockInsertedPin] } as any);

            const request = new Request('http://localhost:3000/api/pins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    case_id: 'case-123',
                    tagged_personas: taggedPersonas
                })
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.tagged_personas).toEqual(taggedPersonas);
        });

        it('should call INSERT with correct parameters', async () => {
            const mockSequence = { seq: 42 };
            vi.mocked(pool.query)
                .mockResolvedValueOnce({ rows: [mockSequence] } as any)
                .mockResolvedValueOnce({ rows: [{ pin_id: 'P042' }] } as any);

            const requestBody = {
                case_id: 'case-789',
                evidence_id: 'ev-111',
                pin_type: 'timestamp',
                timestamp_start: '2024-02-01T08:00:00Z',
                timestamp_end: '2024-02-01T09:00:00Z',
                incident_time: '2024-02-01T08:30:00Z',
                context: 'Test context',
                importance: 'medium',
                tagged_personas: ['p1'],
                ai_context_data: { key: 'value' }
            };

            const request = new Request('http://localhost:3000/api/pins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            await POST(request);

            expect(pool.query).toHaveBeenNthCalledWith(
                2,
                expect.stringContaining('INSERT INTO pins'),
                [
                    'P042',
                    'case-789',
                    'ev-111',
                    'timestamp',
                    '2024-02-01T08:00:00Z',
                    '2024-02-01T09:00:00Z',
                    '2024-02-01T08:30:00Z',
                    'Test context',
                    'medium',
                    ['p1'],
                    { key: 'value' },
                    undefined
                ]
            );
        });

        it('should return error JSON for failed POST', async () => {
            vi.mocked(pool.query).mockRejectedValueOnce(new Error('DB Error'));

            const request = new Request('http://localhost:3000/api/pins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ case_id: 'case-123' })
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.message).toBe('Error creating pin');
        });
    });
});
