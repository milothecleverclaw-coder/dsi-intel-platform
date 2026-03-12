import pool from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { rows } = await pool.query('SELECT * FROM cases WHERE case_id = $1', [id]);
    if (rows.length === 0) {
      return new Response(JSON.stringify({ message: 'Case not found' }), { status: 404 });
    }
    return new Response(JSON.stringify(rows[0]), { status: 200 });
  } catch (error) {
    console.error('Error fetching case:', error);
    return new Response(JSON.stringify({ message: 'Error fetching case' }), { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { narrative_report } = await request.json();
    if (!narrative_report) {
      return new Response(JSON.stringify({ message: 'Narrative report is required' }), { status: 400 });
    }

    const { rows } = await pool.query(
      'UPDATE cases SET narrative_report = $1, updated_at = NOW() WHERE case_id = $2 RETURNING *',
      [narrative_report, id]
    );

    if (rows.length === 0) {
      return new Response(JSON.stringify({ message: 'Case not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(rows[0]), { status: 200 });
  } catch (error) {
    console.error('Error updating case:', error);
    return new Response(JSON.stringify({ message: 'Error updating case' }), { status: 500 });
  }
}
