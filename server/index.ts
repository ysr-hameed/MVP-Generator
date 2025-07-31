// Load environment variables first
import "../env-setup.js";

import express, { Application } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { initializeDatabase } from "./db";
import { cronJobService } from "./services/cronJobs";
import { ApiKeyManager } from "./services/apiKeyManager";
import http from "http";

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || "5000", 10);

// CORS configuration
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? [process.env.SITE_URL, process.env.FRONTEND_URL].filter(Boolean)
        : ["http://localhost:3000", "http://localhost:5173", "http://localhost:5000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

async function main() {
  try {
    console.log("🔌 Initializing database...");
    await initializeDatabase();
    console.log("✅ Database initialized");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    process.exit(1);
  }

  const server: http.Server = await registerRoutes(app);

  // Serve frontend via Vite (dev) or static (prod)
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  server.listen(PORT, "0.0.0.0", () => {
    const mode = process.env.NODE_ENV === "development" ? " (dev mode + Vite)" : "";
    console.log(`🚀 Server listening on port ${PORT}${mode}`);

    // Delay service startup
    setTimeout(async () => {
      try {
        console.log("⚙️ Starting background services...");
        await ApiKeyManager.initialize();
        await ApiKeyManager.resetDailyUsage();
        cronJobService.start();
        console.log("✅ Background services running");
      } catch (error) {
        console.error("❌ Service initialization error:", error);
      }
    }, 2000);
  });
}

main().catch((err) => {
  console.error("❌ Fatal startup error:", err);
  process.exit(1);
});