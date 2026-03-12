import pool from '@/lib/db';

export async function PATCH(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const pinId = searchParams.get('id');

        if (!pinId) {
            return new Response(JSON.stringify({ message: 'id query parameter is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const { 
            context, 
            tagged_personas,
            incident_date
        } = await request.json();

        const { rows } = await pool.query(
            `UPDATE pins SET context = COALESCE($1, context), tagged_personas = COALESCE($2, tagged_personas), incident_date = COALESCE($3, incident_date) WHERE pin_id = $4 RETURNING *`,
            [context, tagged_personas, incident_date, pinId]
        );

        if (rows.length === 0) {
            return new Response(JSON.stringify({ message: 'Pin not found' }), { status: 404 });
        }

        return new Response(JSON.stringify(rows[0]), { status: 200 });
    } catch (error) {
        console.error('Error updating pin:', error);
        return new Response(JSON.stringify({ message: 'Error updating pin' }), { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const pinId = searchParams.get('id');

        if (!pinId) {
            return new Response(JSON.stringify({ message: 'id query parameter is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        await pool.query('DELETE FROM pins WHERE pin_id = $1', [pinId]);

        return new Response(JSON.stringify({ message: 'Pin deleted' }), { status: 200 });
    } catch (error) {
        console.error('Error deleting pin:', error);
        return new Response(JSON.stringify({ message: 'Error deleting pin' }), { status: 500 });
    }
}
