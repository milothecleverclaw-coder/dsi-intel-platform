const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    const queryText = `
ALTER TABLE cases ADD COLUMN IF NOT EXISTS case_narrative TEXT;
`;

    try {
        await pool.query(queryText);
        console.log('Migration successful: Added case_narrative column');
    } catch (err) {
        console.error('Migration failed:', err.stack);
    } finally {
        pool.end();
    }
}

migrate();
