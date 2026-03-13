import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const sql = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS cases (
  case_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_number VARCHAR(50),
  title VARCHAR(200) NOT NULL,
  narrative_report TEXT,
  case_narrative TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS evidence (
  evidence_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(case_id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  display_name VARCHAR(200),
  file_type VARCHAR(20),
  blob_path TEXT,
  metadata JSONB DEFAULT '{}',
  azure_analysis JSONB,
  twelve_labs_index_id TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS personas (
  persona_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(case_id) ON DELETE CASCADE,
  first_name_th VARCHAR(100),
  last_name_th VARCHAR(100),
  first_name_en VARCHAR(100),
  last_name_en VARCHAR(100),
  aliases JSONB DEFAULT '[]',
  phones JSONB DEFAULT '[]',
  role VARCHAR(50) DEFAULT 'suspect',
  distinctive_features TEXT,
  metadata JSONB DEFAULT '{}',
  photos JSONB DEFAULT '[]',
  twelve_labs_collection_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS persona_photos (
  photo_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  persona_id UUID REFERENCES personas(persona_id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  twelve_labs_entity_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pins (
  pin_id VARCHAR(10) PRIMARY KEY,
  case_id UUID REFERENCES cases(case_id) ON DELETE CASCADE,
  evidence_id UUID REFERENCES evidence(evidence_id),
  pin_type VARCHAR(20),
  timestamp_start VARCHAR(20),
  timestamp_end VARCHAR(20),
  incident_time TIMESTAMPTZ,
  context TEXT,
  importance VARCHAR(10) DEFAULT 'medium',
  tagged_personas UUID[] DEFAULT '{}',
  ai_context_data JSONB DEFAULT '{}',
  pinned_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE SEQUENCE IF NOT EXISTS pin_sequence START 1;
`;

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Running migrations...');
    await client.query(sql);
    console.log('✅ Migrations complete.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
