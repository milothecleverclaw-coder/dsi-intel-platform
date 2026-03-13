import pool from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get('caseId');

    if (!caseId) {
        return new Response(JSON.stringify({ message: 'caseId query parameter is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const { rows } = await pool.query('SELECT * FROM pins WHERE case_id = $1 ORDER BY pinned_at DESC', [caseId]);
        return new Response(JSON.stringify(rows), { status: 200 });
    } catch (error) {
        console.error('Error fetching pins:', error);
        return new Response(JSON.stringify({ message: 'Error fetching pins' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

export async function POST(request: Request) {
    try {
        const { 
            case_id, 
            evidence_id, 
            pin_type, 
            timestamp_start, 
            timestamp_end, 
            incident_time,
            context, 
            importance, 
            tagged_personas, 
            ai_context_data,
            notes
        } = await request.json();

        if (!case_id) {
            return new Response(JSON.stringify({ message: 'case_id is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Generate pin_id using the sequence
        const sequenceResult = await pool.query("SELECT nextval('pin_sequence'::regclass) as seq");
        const seqNum = sequenceResult.rows[0].seq;
        const pin_id = `P${seqNum.toString().padStart(3, '0')}`;

        const { rows } = await pool.query(
            `INSERT INTO pins (pin_id, case_id, evidence_id, pin_type, timestamp_start, timestamp_end, incident_time, context, importance, tagged_personas, ai_context_data, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
            [pin_id, case_id, evidence_id, pin_type, timestamp_start, timestamp_end, incident_time, context, importance, tagged_personas, ai_context_data, notes]
        );

        return new Response(JSON.stringify(rows[0]), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error creating pin:', error);
        return new Response(JSON.stringify({ message: 'Error creating pin' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
