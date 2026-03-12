import pool from '@/lib/db';

export async function GET() {
  try {
    const { rows } = await pool.query('SELECT * FROM cases');
    return new Response(JSON.stringify(rows), { status: 200 });
  } catch (error) {
    console.error('Error fetching cases:', error);
    return new Response(JSON.stringify({ message: 'Error fetching cases' }), { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, narrative_report } = await request.json();
    if (!title) {
      return new Response(JSON.stringify({ message: 'Title is required' }), { status: 400 });
    }

    // Generate DSI-YYYY-NNN case number
    const year = new Date().getFullYear();
    const result = await pool.query('SELECT COUNT(*) FROM cases WHERE case_number LIKE $1', [`DSI-${year}-%`]);
    const count = parseInt(result.rows[0].count, 10);
    const case_number = `DSI-${year}-${(count + 1).toString().padStart(3, '0')}`;

    const { rows } = await pool.query(
      'INSERT INTO cases (case_number, title, narrative_report) VALUES ($1, $2, $3) RETURNING *',
      [case_number, title, narrative_report]
    );
    return new Response(JSON.stringify(rows[0]), { status: 201 });
  } catch (error) {
    console.error('Error creating case:', error);
    return new Response(JSON.stringify({ message: 'Error creating case' }), { status: 500 });
  }
}
