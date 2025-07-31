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
  
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }
  
  try {
    console.log('Connecting to database...');
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Test the connection
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    
    db = drizzle({ client: pool, schema });
    console.log('Database connection established');
    
    // Auto-create required tables if they don't exist
    await createTablesIfNotExist(db);
    
    return db;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}

async function createTablesIfNotExist(database: any) {
  try {
    console.log("Creating database tables if they don't exist...");
    
    // Create all required tables with proper schema
    const tableQueries = [
      `CREATE TABLE IF NOT EXISTS analytics (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
        page VARCHAR(255) NOT NULL,
        session_id VARCHAR(255),
        ip VARCHAR(45),
        user_agent TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        referrer TEXT,
        metadata JSONB
      );`,
      
      `CREATE TABLE IF NOT EXISTS mvp_generations (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
        idea TEXT NOT NULL,
        industry VARCHAR(255),
        target_audience VARCHAR(255),
        budget VARCHAR(100),
        result JSONB NOT NULL,
        ip VARCHAR(45),
        session_id VARCHAR(255),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      
      `CREATE TABLE IF NOT EXISTS blog_posts (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        slug VARCHAR(500) UNIQUE NOT NULL,
        excerpt TEXT,
        content TEXT NOT NULL,
        author VARCHAR(255) NOT NULL,
        published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        featured BOOLEAN DEFAULT false,
        meta_title TEXT,
        meta_description TEXT,
        keywords TEXT[],
        image_url TEXT
      );`,
      
      `CREATE TABLE IF NOT EXISTS contacts (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        responded BOOLEAN DEFAULT false
      );`,
      
      `CREATE TABLE IF NOT EXISTS admin_settings (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
        key VARCHAR(255) UNIQUE NOT NULL,
        value JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      
      `CREATE TABLE IF NOT EXISTS api_keys (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
        provider VARCHAR(255) NOT NULL,
        key TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        daily_usage INTEGER DEFAULT 0,
        last_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      
      `CREATE TABLE IF NOT EXISTS advertisements (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        ad_code TEXT NOT NULL,
        width INTEGER NOT NULL,
        height INTEGER NOT NULL,
        position VARCHAR(255) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      
      `CREATE TABLE IF NOT EXISTS ad_settings (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
        ad_count VARCHAR(255) NOT NULL DEFAULT '3',
        enable_ads BOOLEAN DEFAULT false,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      
      `CREATE TABLE IF NOT EXISTS auto_blog_settings (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
        enabled BOOLEAN DEFAULT false,
        frequency VARCHAR(255) NOT NULL DEFAULT 'daily',
        daily_post_count INTEGER DEFAULT 1,
        weekly_post_count INTEGER DEFAULT 1,
        monthly_post_count INTEGER DEFAULT 1,
        last_run TIMESTAMP,
        next_run TIMESTAMP,
        topics TEXT[] DEFAULT ARRAY[]::text[],
        affiliate_links JSONB,
        use_latest_trends BOOLEAN DEFAULT true,
        focus_on_my_app BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      
      `CREATE TABLE IF NOT EXISTS auto_blog_queue (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
        topic TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        generated_content JSONB,
        published_post_id VARCHAR(255),
        error TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processed_at TIMESTAMP
      );`,
      
      `CREATE TABLE IF NOT EXISTS site_settings (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
        site_name VARCHAR(255) DEFAULT 'MVP Generator AI',
        site_description TEXT DEFAULT 'Generate comprehensive MVP plans using AI',
        contact_email VARCHAR(255) DEFAULT 'admin@mvpgenerator.ai',
        contact_phone VARCHAR(255),
        contact_address TEXT,
        social_links JSONB,
        seo_settings JSONB,
        maintenance_mode BOOLEAN DEFAULT false,
        maintenance_message TEXT,
        enable_registration BOOLEAN DEFAULT false,
        enable_comments BOOLEAN DEFAULT true,
        max_mvp_generations_per_day INTEGER DEFAULT 10,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`
    ];

    // Execute each table creation query
    for (const query of tableQueries) {
      try {
        await database.execute(query);
        console.log(`✓ Table created/verified`);
      } catch (error) {
        console.error(`Error executing query: ${query.substring(0, 50)}...`, error);
        throw error;
      }
    }

    console.log("Database tables created successfully");
  } catch (error) {
    console.error("Error creating database tables:", error);
  }
}

// Database will be initialized when needed
// Don't initialize on import to allow environment variables to be set first

export { pool, db, initializeDatabase };