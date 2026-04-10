import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const sql = `
CREATE TABLE IF NOT EXISTS medical_records (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  doctor_name         VARCHAR(100) NOT NULL,
  hospital_name       VARCHAR(150) NOT NULL,
  visit_date          DATE NOT NULL,
  diagnosis           VARCHAR(300),
  notes               TEXT,
  prescription_url    TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_medical_records_user_id ON medical_records(user_id);

CREATE TRIGGER medical_records_updated_at
  BEFORE UPDATE ON medical_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
`;

async function migrate() {
  console.log('🚀 Running medical history migration...');
  try {
    await pool.query(sql);
    console.log('✅ medical_records table created!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
