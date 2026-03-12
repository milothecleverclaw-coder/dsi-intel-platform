import pool from '@/lib/db';

export async function GET(request: Request, { params }: { params: { caseId: string } }) {
    const { caseId } = params;

    if (!caseId) {
        return new Response(JSON.stringify({ message: 'caseId is required in path parameters' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        // Fetch pins and join with evidence and personas for richer timeline data
        const query = `
            SELECT 
                p.*, 
                e.filename as evidence_filename, 
                eui.display_name as evidence_display_name, 
                GROUP_CONCAT(DISTINCT pe.first_name_en || ' ' || pe.last_name_en) as tagged_persona_names
            FROM pins p
            LEFT JOIN evidence e ON p.evidence_id = e.evidence_id
            LEFT JOIN evidence eui ON p.evidence_id = eui.evidence_id -- Alias for display name
            LEFT JOIN pins_tagged_personas ptp ON p.pin_id = ptp.pin_id
            LEFT JOIN personas pe ON ptp.persona_id = pe.persona_id
            WHERE p.case_id = $1
            GROUP BY p.pin_id, e.filename, eui.display_name
            ORDER BY p.incident_time DESC NULLS LAST, p.pinned_at DESC
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
