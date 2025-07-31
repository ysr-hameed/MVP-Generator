// Load environment variables first
import "../env-setup.js";

import express from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { initializeDatabase } from "./db";
import { cronJobService } from "./services/cronJobs";
import { ApiKeyManager } from "./services/apiKeyManager";

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

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
  // Initialize database first
  try {
    console.log("Initializing database...");
    await initializeDatabase();
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Database initialization failed:", error);
    process.exit(1);
  }

  const server = await registerRoutes(app);

  // Setup Vite middleware for development or static serving for production
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  server.listen(PORT, "0.0.0.0", () => {
    const mode = process.env.NODE_ENV === "development" ? " (development mode with Vite)" : "";
    console.log(`Server running on port ${PORT}${mode}`);

    // Initialize API keys and start cron jobs after server is running
    setTimeout(async () => {
      try {
        console.log("Starting cron job service...");
        await ApiKeyManager.initialize();
        await ApiKeyManager.resetDailyUsage();
        cronJobService.start();
        console.log("Cron job service started");
      } catch (error) {
        console.error("Failed to initialize services:", error);
      }
    }, 2000);
  });
}

main().catch(console.error);