
// Load environment variables from .env file if it exists
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try to load .env from multiple locations
const envPaths = [
  join(__dirname, '.env'),          // Root directory
  join(__dirname, 'server', '.env'), // Server directory
  join(process.cwd(), '.env')       // Current working directory
];

let envLoaded = false;
for (const envPath of envPaths) {
  try {
    const result = config({ path: envPath });
    if (result.parsed) {
      console.log(`✓ Environment variables loaded from: ${envPath}`);
      envLoaded = true;
      break;
    }
  } catch (error) {
    // Continue to next path
  }
}

if (!envLoaded) {
  console.warn("⚠️ No .env file found in expected locations");
}

// Set fallback database URL if not provided
if (!process.env.DATABASE_URL || process.env.DATABASE_URL === 'your-postgresql-connection-string-here') {
  console.warn("DATABASE_URL not found or using placeholder value");
  // Set fallback database URL
  process.env.DATABASE_URL = "postgresql://startnet_owner:npg_p9tQNLovjW0w@ep-still-sun-a87eo2bi-pooler.eastus2.azure.neon.tech/startnet?sslmode=require&channel_binding=require";
  console.log("Using fallback DATABASE_URL");
}

console.log("Environment variables loaded");
