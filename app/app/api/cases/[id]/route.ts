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
    const body = await request.json();
    
    // Build dynamic update query based on provided fields
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (body.narrative_report !== undefined) {
      updates.push(`narrative_report = $${paramIndex}`);
      values.push(body.narrative_report);
      paramIndex++;
    }

    if (body.case_narrative !== undefined) {
      updates.push(`case_narrative = $${paramIndex}`);
      values.push(body.case_narrative);
      paramIndex++;
    }

    if (body.title !== undefined) {
      updates.push(`title = $${paramIndex}`);
      values.push(body.title);
      paramIndex++;
    }

    if (body.status !== undefined) {
      updates.push(`status = $${paramIndex}`);
      values.push(body.status);
      paramIndex++;
    }

    if (updates.length === 0) {
      return new Response(JSON.stringify({ message: 'No fields to update' }), { status: 400 });
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `UPDATE cases SET ${updates.join(', ')} WHERE case_id = $${paramIndex} RETURNING *`;
    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return new Response(JSON.stringify({ message: 'Case not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(rows[0]), { status: 200 });
  } catch (error) {
    console.error('Error updating case:', error);
    return new Response(JSON.stringify({ message: 'Error updating case' }), { status: 500 });
  }
}
