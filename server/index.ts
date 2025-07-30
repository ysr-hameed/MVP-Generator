// Set database URL directly for development
process.env.DATABASE_URL = "postgresql://startnet_owner:npg_p9tQNLovjW0w@ep-still-sun-a87eo2bi-pooler.eastus2.azure.neon.tech/startnet?sslmode=require&channel_binding=require";
console.log("DATABASE_URL set for PostgreSQL connection");

// Load environment variables first
import "../env-setup.js";

import express from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { initializeDatabase } from "./db";
import { cronJobService } from "./services/cronJobs";

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

  // Setup Vite middleware for development or static serving for production
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const PORT = Number(process.env.PORT) || 5000;
  server.listen(PORT, "0.0.0.0", () => {
    const mode = process.env.NODE_ENV === "development" ? " (development mode with Vite)" : "";
    console.log(`Server running on port ${PORT}${mode}`);

    // Start cron jobs after server is running
    setTimeout(() => {
      cronJobService.start();
      console.log("Cron job service started");
    }, 2000);
  });
}

main().catch(console.error);