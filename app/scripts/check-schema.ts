import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkSchema() {
  const client = await pool.connect();
  try {
    // Check pins table
    console.log('=== PINS TABLE ===');
    const pinsResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'pins'
      ORDER BY ordinal_position
    `);
    pinsResult.rows.forEach(r => console.log(`  - ${r.column_name}: ${r.data_type} (${r.is_nullable === 'YES' ? 'nullable' : 'required'})`));
    
    // Check cases table
    console.log('\n=== CASES TABLE ===');
    const casesResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'cases'
      ORDER BY ordinal_position
    `);
    casesResult.rows.forEach(r => console.log(`  - ${r.column_name}: ${r.data_type} (${r.is_nullable === 'YES' ? 'nullable' : 'required'})`));
    
    // Check evidence table
    console.log('\n=== EVIDENCE TABLE ===');
    const evidenceResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'evidence'
      ORDER BY ordinal_position
    `);
    evidenceResult.rows.forEach(r => console.log(`  - ${r.column_name}: ${r.data_type} (${r.is_nullable === 'YES' ? 'nullable' : 'required'})`));
    
    // Check personas table
    console.log('\n=== PERSONAS TABLE ===');
    const personasResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'personas'
      ORDER BY ordinal_position
    `);
    personasResult.rows.forEach(r => console.log(`  - ${r.column_name}: ${r.data_type} (${r.is_nullable === 'YES' ? 'nullable' : 'required'})`));
    
    // Check persona_photos table
    console.log('\n=== PERSONA_PHOTOS TABLE ===');
    const photosResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'persona_photos'
      ORDER BY ordinal_position
    `);
    photosResult.rows.forEach(r => console.log(`  - ${r.column_name}: ${r.data_type} (${r.is_nullable === 'YES' ? 'nullable' : 'required'})`));
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

checkSchema();
