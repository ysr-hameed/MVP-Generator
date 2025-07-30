import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Database connection setup - will be initialized when needed
let db: any = null;
let pool: Pool | null = null;

function initializeDatabase() {
  if (db) return db; // Already initialized
  
  if (process.env.DATABASE_URL) {
    try {
      pool = new Pool({ connectionString: process.env.DATABASE_URL });
      db = drizzle({ client: pool, schema });
      console.log('Database connection established');
      return db;
    } catch (error) {
      console.warn('Database connection failed, using memory storage:', error);
      db = null;
    }
  } else {
    console.log('No DATABASE_URL provided, using memory storage');
  }
  return null;
}

// Database will be initialized when needed
// Don't initialize on import to allow environment variables to be set first

export { pool, db, initializeDatabase };