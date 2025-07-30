// Set database URL directly for development
process.env.DATABASE_URL = "postgresql://startnet_owner:npg_p9tQNLovjW0w@ep-still-sun-a87eo2bi-pooler.eastus2.azure.neon.tech/startnet?sslmode=require&channel_binding=require";
console.log("DATABASE_URL set for PostgreSQL connection");

import express from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite } from "./vite";

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// CORS configuration for separate backend hosting
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] // Replace with actual frontend domain
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

async function main() {
  const server = await registerRoutes(app);

  // In development, setup Vite
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  }

  server.listen(PORT, "0.0.0.0", () => {
    const logMessage = `Server running on port ${PORT}`;
    
    if (process.env.NODE_ENV === "development") {
      console.log(`${logMessage} (development mode with Vite)`);
    } else {
      console.log(`${logMessage} (production mode)`);
    }
  });
}

main().catch(console.error);