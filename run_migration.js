import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../server/.env') });

const migrationFile = path.join(__dirname, 'migrations/001_initial_schema.sql');
const sqlContent = fs.readFileSync(migrationFile, 'utf8');

async function runMigration() {
  const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  
  if (dbUrl) {
    console.log('Connecting to PostgreSQL database using connection string...');
    const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
    try {
      await client.connect();
      console.log('Running SQL Migration...');
      await client.query(sqlContent);
      console.log('Migration executed successfully via pg Client!');
    } catch (err) {
      console.error('Migration failed via pg client:', err.message);
    } finally {
      await client.end();
    }
  } else {
    console.log('DATABASE_URL or SUPABASE_DB_URL not set in server/.env.');
    console.log('To run migrations directly against Supabase Postgres DB, add DATABASE_URL or SUPABASE_DB_URL in server/.env');
    console.log('Migration file path is available at:', migrationFile);
  }
}

runMigration().catch(console.error);
