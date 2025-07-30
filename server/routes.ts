import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { geminiService } from "./services/gemini";
import { 
  insertAnalyticsSchema,
  insertMvpGenerationSchema,
  insertBlogPostSchema,
  insertContactSchema,
  insertAdminSettingSchema,
  insertApiKeySchema,
  mvpGeneratorSchema,
  contactFormSchema
} from "@shared/schema";

// Simple auth middleware for admin routes
const isAuthenticated = (req: any, res: any, next: any) => {
  const { username, password } = req.session || {};
  
  if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS) {
    return next();
  }
  
  res.status(401).json({ message: "Unauthorized" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Enable sessions for admin auth
  const session = await import('express-session');
  app.use(session.default({
    secret: process.env.SESSION_SECRET || 'mvp-generator-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Analytics tracking
  app.post("/api/analytics/track", async (req, res) => {
    try {
      const data = insertAnalyticsSchema.parse({
        ...req.body,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });
      
      const analytics = await storage.trackPageView(data);
      res.json(analytics);
    } catch (error) {
      console.error("Analytics error:", error);
      res.status(400).json({ message: "Invalid analytics data" });
    }
  });

  // MVP Generation
  app.post("/api/mvp/generate", async (req, res) => {
    try {
      const data = mvpGeneratorSchema.parse(req.body);
      
      // Generate MVP plan using Gemini
      const plan = await geminiService.generateMvpPlan(
        data.idea,
        data.industry,
        data.targetAudience,
        data.budget
      );
      
      // Store the generation
      await storage.createMvpGeneration({
        ...data,
        result: plan,
        ip: req.ip,
        sessionId: req.sessionID,
      });
      
      res.json(plan);
    } catch (error) {
      console.error("MVP generation error:", error);
      res.status(500).json({ 
        message: error.message || "Failed to generate MVP plan" 
      });
    }
  });

  // Contact form
  app.post("/api/contact", async (req, res) => {
    try {
      const data = contactFormSchema.parse(req.body);
      const contact = await storage.createContact(data);
      res.json(contact);
    } catch (error) {
      console.error("Contact error:", error);
      res.status(400).json({ message: "Invalid contact data" });
    }
  });

  // Blog endpoints
  app.get("/api/blog/posts", async (req, res) => {
    try {
      const posts = await storage.getBlogPosts();
      res.json(posts);
    } catch (error) {
      console.error("Blog fetch error:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog/posts/:slug", async (req, res) => {
    try {
      const post = await storage.getBlogPostBySlug(req.params.slug);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Blog post fetch error:", error);
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  // Admin authentication
  app.post("/api/admin/login", async (req: any, res) => {
    try {
      const { username, password } = req.body;
      
      if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS) {
        req.session.username = username;
        req.session.password = password;
        res.json({ success: true });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/admin/logout", async (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/admin/check", isAuthenticated, async (req, res) => {
    res.json({ authenticated: true });
  });

  // Admin analytics
  app.get("/api/admin/analytics", isAuthenticated, async (req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Admin analytics error:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Admin contacts
  app.get("/api/admin/contacts", isAuthenticated, async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (error) {
      console.error("Admin contacts error:", error);
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  app.patch("/api/admin/contacts/:id/respond", isAuthenticated, async (req, res) => {
    try {
      await storage.markContactResponded(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Contact respond error:", error);
      res.status(500).json({ message: "Failed to mark as responded" });
    }
  });

  // Admin blog management
  app.post("/api/admin/blog", isAuthenticated, async (req, res) => {
    try {
      const data = insertBlogPostSchema.parse(req.body);
      const post = await storage.createBlogPost(data);
      res.json(post);
    } catch (error) {
      console.error("Blog create error:", error);
      res.status(400).json({ message: "Invalid blog post data" });
    }
  });

  app.put("/api/admin/blog/:id", isAuthenticated, async (req, res) => {
    try {
      const data = insertBlogPostSchema.partial().parse(req.body);
      const post = await storage.updateBlogPost(req.params.id, data);
      res.json(post);
    } catch (error) {
      console.error("Blog update error:", error);
      res.status(400).json({ message: "Invalid blog post data" });
    }
  });

  app.delete("/api/admin/blog/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteBlogPost(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Blog delete error:", error);
      res.status(500).json({ message: "Failed to delete blog post" });
    }
  });

  // Admin API key management
  app.get("/api/admin/api-keys", isAuthenticated, async (req, res) => {
    try {
      const geminiKeys = await storage.getActiveApiKeys("gemini");
      res.json({ gemini: geminiKeys });
    } catch (error) {
      console.error("API keys fetch error:", error);
      res.status(500).json({ message: "Failed to fetch API keys" });
    }
  });

  app.post("/api/admin/api-keys", isAuthenticated, async (req, res) => {
    try {
      const data = insertApiKeySchema.parse(req.body);
      const key = await storage.createApiKey(data);
      // Return without actual key value for security
      res.json({ ...key, key: '***masked***' });
    } catch (error) {
      console.error("API key create error:", error);
      res.status(400).json({ message: "Invalid API key data" });
    }
  });

  app.patch("/api/admin/api-keys/:id/toggle", isAuthenticated, async (req, res) => {
    try {
      const { isActive } = req.body;
      const key = await storage.toggleApiKey(req.params.id, isActive);
      res.json({ ...key, key: '***masked***' });
    } catch (error) {
      console.error("API key toggle error:", error);
      res.status(500).json({ message: "Failed to toggle API key" });
    }
  });

  app.delete("/api/admin/api-keys/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteApiKey(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("API key delete error:", error);
      res.status(500).json({ message: "Failed to delete API key" });
    }
  });

  // Admin settings
  app.get("/api/admin/settings", isAuthenticated, async (req, res) => {
    try {
      // Get common settings
      const siteTitle = await storage.getSetting("siteTitle");
      const siteDescription = await storage.getSetting("siteDescription");
      const analyticsId = await storage.getSetting("analyticsId");
      
      res.json({
        siteTitle: siteTitle?.value || "MVP Generator AI",
        siteDescription: siteDescription?.value || "Transform your startup ideas into comprehensive MVP plans",
        analyticsId: analyticsId?.value || "",
      });
    } catch (error) {
      console.error("Settings fetch error:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.post("/api/admin/settings", isAuthenticated, async (req, res) => {
    try {
      const { key, value } = req.body;
      const setting = await storage.setSetting(key, value);
      res.json(setting);
    } catch (error) {
      console.error("Settings update error:", error);
      res.status(500).json({ message: "Failed to update setting" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}