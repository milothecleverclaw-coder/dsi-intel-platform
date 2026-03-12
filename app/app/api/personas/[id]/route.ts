import pool from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { rows } = await pool.query('SELECT * FROM personas WHERE persona_id = $1', [id]);
    if (rows.length === 0) {
      return new Response(JSON.stringify({ message: 'Persona not found' }), { status: 404 });
    }
    return new Response(JSON.stringify(rows[0]), { status: 200 });
  } catch (error) {
    console.error('Error fetching persona:', error);
    return new Response(JSON.stringify({ message: 'Error fetching persona' }), { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (body.first_name_th !== undefined) {
      updates.push(`first_name_th = $${paramIndex}`);
      values.push(body.first_name_th);
      paramIndex++;
    }

    if (body.last_name_th !== undefined) {
      updates.push(`last_name_th = $${paramIndex}`);
      values.push(body.last_name_th);
      paramIndex++;
    }

    if (body.first_name_en !== undefined) {
      updates.push(`first_name_en = $${paramIndex}`);
      values.push(body.first_name_en);
      paramIndex++;
    }

    if (body.last_name_en !== undefined) {
      updates.push(`last_name_en = $${paramIndex}`);
      values.push(body.last_name_en);
      paramIndex++;
    }

    if (body.aliases !== undefined) {
      updates.push(`aliases = $${paramIndex}::jsonb`);
      const aliasesJson = typeof body.aliases === 'string' ? body.aliases : JSON.stringify(body.aliases || []);
      values.push(aliasesJson);
      paramIndex++;
    }

    if (body.phones !== undefined) {
      updates.push(`phones = $${paramIndex}::jsonb`);
      const phonesJson = typeof body.phones === 'string' ? body.phones : JSON.stringify(body.phones || []);
      values.push(phonesJson);
      paramIndex++;
    }

    if (body.role !== undefined) {
      updates.push(`role = $${paramIndex}`);
      values.push(body.role);
      paramIndex++;
    }

    if (body.distinctive_features !== undefined) {
      updates.push(`distinctive_features = $${paramIndex}`);
      values.push(body.distinctive_features);
      paramIndex++;
    }

    if (body.notes !== undefined) {
      updates.push(`notes = $${paramIndex}`);
      values.push(body.notes);
      paramIndex++;
    }

    if (updates.length === 0) {
      return new Response(JSON.stringify({ message: 'No fields to update' }), { status: 400 });
    }

    values.push(id);

    const query = `UPDATE personas SET ${updates.join(', ')} WHERE persona_id = $${paramIndex} RETURNING *`;
    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return new Response(JSON.stringify({ message: 'Persona not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(rows[0]), { status: 200 });
  } catch (error) {
    console.error('Error updating persona:', error);
    return new Response(JSON.stringify({ message: 'Error updating persona' }), { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { rows } = await pool.query('DELETE FROM personas WHERE persona_id = $1 RETURNING *', [id]);
    if (rows.length === 0) {
      return new Response(JSON.stringify({ message: 'Persona not found' }), { status: 404 });
    }
    return new Response(JSON.stringify({ message: 'Persona deleted' }), { status: 200 });
  } catch (error) {
    console.error('Error deleting persona:', error);
    return new Response(JSON.stringify({ message: 'Error deleting persona' }), { status: 500 });
  }
}
