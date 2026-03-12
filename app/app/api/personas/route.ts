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
    // Use DISTINCT ON to prevent duplicates
    const { rows } = await pool.query(
      'SELECT DISTINCT ON (persona_id) * FROM personas WHERE case_id = $1 ORDER BY persona_id, created_at DESC',
      [caseId]
    );
    return new Response(JSON.stringify(rows), { status: 200 });
  } catch (error) {
    console.error('Error fetching personas:', error);
    return new Response(JSON.stringify({ message: 'Error fetching personas' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request: Request) {
  try {
    const { 
      case_id, 
      first_name_th, 
      last_name_th, 
      first_name_en, 
      last_name_en, 
      aliases, 
      phones, 
      role, 
      distinctive_features, 
      metadata, 
      photos 
    } = await request.json();

    if (!case_id) {
      return new Response(JSON.stringify({ message: 'case_id is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Handle both pre-stringified JSON and regular arrays/objects
    const aliasesJson = typeof aliases === 'string' ? aliases : JSON.stringify(aliases || []);
    const phonesJson = typeof phones === 'string' ? phones : JSON.stringify(phones || []);
    const metadataJson = typeof metadata === 'string' ? metadata : JSON.stringify(metadata || {});
    const photosJson = typeof photos === 'string' ? photos : JSON.stringify(photos || []);

    const { rows } = await pool.query(
      `INSERT INTO personas (case_id, first_name_th, last_name_th, first_name_en, last_name_en, aliases, phones, role, distinctive_features, metadata, photos) VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8, $9, $10::jsonb, $11::jsonb) RETURNING *`,
      [case_id, first_name_th, last_name_th, first_name_en, last_name_en, aliasesJson, phonesJson, role, distinctive_features, metadataJson, photosJson]
    );

    return new Response(JSON.stringify(rows[0]), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating persona:', error);
    return new Response(JSON.stringify({ message: 'Error creating persona' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
