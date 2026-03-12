const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    const migrationQueries = [
        'ALTER TABLE pins ADD COLUMN IF NOT EXISTS incident_date TIMESTAMPTZ;',
        'ALTER TABLE personas ADD COLUMN IF NOT EXISTS notes TEXT;'
    ];

    try {
        for (const query of migrationQueries) {
            await pool.query(query);
            console.log(`Executed: ${query}`);
        }
        console.log('Database migration successful!');
    } catch (err) {
        console.error('Database migration failed:', err.stack);
    } finally {
        await pool.end();
    }
}

migrate();
