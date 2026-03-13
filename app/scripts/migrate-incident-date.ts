import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function addIncidentDateColumn() {
  const client = await pool.connect();
  try {
    console.log('Checking if incident_date column exists in pins table...');
    
    // Check if column exists
    const checkResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'pins' AND column_name = 'incident_date'
    `);
    
    if (checkResult.rows.length === 0) {
      console.log('Adding incident_date column to pins table...');
      await client.query(`
        ALTER TABLE pins 
        ADD COLUMN incident_date TIMESTAMP WITH TIME ZONE
      `);
      console.log('✅ incident_date column added successfully');
    } else {
      console.log('✅ incident_date column already exists');
    }
    
    // Also verify notes column exists
    const notesCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'pins' AND column_name = 'notes'
    `);
    
    if (notesCheck.rows.length === 0) {
      console.log('Adding notes column to pins table...');
      await client.query(`
        ALTER TABLE pins 
        ADD COLUMN notes TEXT
      `);
      console.log('✅ notes column added successfully');
    } else {
      console.log('✅ notes column already exists');
    }
    
    console.log('\n✅ Database migration complete');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

addIncidentDateColumn();
