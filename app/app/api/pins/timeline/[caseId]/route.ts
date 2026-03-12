import pool from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ caseId: string }> }) {
    const { caseId } = await params;

    if (!caseId) {
        return new Response(JSON.stringify({ message: 'caseId is required in path parameters' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const query = `
            SELECT 
                p.*,
                e.filename as evidence_filename,
                e.display_name as evidence_display_name
            FROM pins p
            LEFT JOIN evidence e ON p.evidence_id = e.evidence_id
            WHERE p.case_id = $1
            ORDER BY p.incident_time ASC NULLS LAST, p.pinned_at ASC
        `;
        const { rows } = await pool.query(query, [caseId]);
        return new Response(JSON.stringify(rows), { status: 200 });
    } catch (error) {
        console.error('Error fetching timeline for case:', error);
        return new Response(JSON.stringify({ message: 'Error fetching timeline' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
