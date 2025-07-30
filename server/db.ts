import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Optional database setup - will fallback to memory storage if not available
let db: any = null;
let pool: Pool | null = null;

if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle({ client: pool, schema });
    console.log('Database connection established');
  } catch (error) {
    console.warn('Database connection failed, using memory storage:', error);
    db = null;
  }
} else {
  console.log('No DATABASE_URL provided, using memory storage');
}

export { pool, db };