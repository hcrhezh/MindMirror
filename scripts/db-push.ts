import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from "ws";
import * as schema from "../shared/schema";

// Configure neon to use WebSockets
neonConfig.webSocketConstructor = ws;

async function main() {
  console.log('Pushing schema to database...');
  
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }
  
  // Create a new pool and drizzle instance
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });
  
  try {
    // Push schema directly
    // This isn't a proper migration, but it's the simplest way to get started
    console.log('Creating tables if they do not exist...');
    
    // Create users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL,
        name TEXT NOT NULL,
        language TEXT DEFAULT 'en',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Create journal_entries table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS journal_entries (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        date TEXT NOT NULL,
        text TEXT NOT NULL,
        mood TEXT,
        mood_score INTEGER,
        emotions JSONB,
        language TEXT DEFAULT 'en',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Create mood_history table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS mood_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        date TEXT NOT NULL,
        mood TEXT NOT NULL,
        score INTEGER NOT NULL,
        journal_entry_id INTEGER REFERENCES journal_entries(id),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Create daily_tips table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS daily_tips (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        date TEXT NOT NULL,
        affirmation TEXT NOT NULL,
        meditation TEXT,
        self_care JSONB,
        mood TEXT,
        language TEXT DEFAULT 'en',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    console.log('Schema updated successfully!');
  } catch (error) {
    console.error('Error pushing schema:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Failed to push schema:', err);
  process.exit(1);
});