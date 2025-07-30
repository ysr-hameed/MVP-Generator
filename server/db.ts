import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Database connection setup - will be initialized when needed
let db: any = null;
let pool: Pool | null = null;

async function initializeDatabase() {
  if (db) return db; // Already initialized
  
  if (process.env.DATABASE_URL) {
    try {
      pool = new Pool({ connectionString: process.env.DATABASE_URL });
      db = drizzle({ client: pool, schema });
      console.log('Database connection established');
      
      // Auto-create required tables if they don't exist
      await createTablesIfNotExist(db);
      
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

async function createTablesIfNotExist(database: any) {
  try {
    console.log("Creating database tables if they don't exist...");
    
    // Create all required tables with proper schema
    const tableQueries = [
      `CREATE TABLE IF NOT EXISTS analytics (
        id SERIAL PRIMARY KEY,
        page VARCHAR(255) NOT NULL,
        session_id VARCHAR(255),
        ip VARCHAR(45),
        user_agent TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metadata JSONB
      );`,
      
      `CREATE TABLE IF NOT EXISTS mvp_generations (
        id SERIAL PRIMARY KEY,
        idea TEXT NOT NULL,
        industry VARCHAR(255),
        target_audience TEXT,
        budget_range VARCHAR(100),
        plan JSONB NOT NULL,
        ip VARCHAR(45),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      
      `CREATE TABLE IF NOT EXISTS blog_posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        slug VARCHAR(500) UNIQUE NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        featured BOOLEAN DEFAULT false,
        published BOOLEAN DEFAULT true,
        published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      
      `CREATE TABLE IF NOT EXISTS auto_blog_queue (
        id SERIAL PRIMARY KEY,
        topic VARCHAR(500) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        generated_content JSONB,
        published_post_id VARCHAR(255),
        error TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processed_at TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      
      `CREATE TABLE IF NOT EXISTS site_settings (
        id SERIAL PRIMARY KEY,
        site_name VARCHAR(255) DEFAULT 'MVP Generator AI',
        site_description TEXT DEFAULT 'Generate comprehensive MVP plans using AI',
        contact_email VARCHAR(255),
        maintenance_mode BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`
    ];

    for (const query of tableQueries) {
      await database.execute(query);
    }

    console.log("Database tables created successfully");
  } catch (error) {
    console.error("Error creating database tables:", error);
  }
}

// Database will be initialized when needed
// Don't initialize on import to allow environment variables to be set first

export { pool, db, initializeDatabase };