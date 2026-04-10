/**
 * Run this once to create all tables in your Supabase database.
 * Usage: npx tsx scripts/migrate.ts
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set in .env');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function migrate() {
  console.log('🚀 Running database migration...');
  const sql = readFileSync(join(__dirname, '../src/db/schema.sql'), 'utf-8');

  try {
    await pool.query(sql);
    console.log('✅ Schema applied successfully!');
    console.log('\nTables created:');
    console.log('  • users');
    console.log('  • refresh_tokens');
    console.log('  • medicines');
    console.log('  • reminders');
    console.log('  • vitals');
    console.log('  • share_tokens');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
