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
  insertAdvertisementSchema,
  insertAdSettingsSchema,
  insertAutoBlogSettingsSchema,
  insertSiteSettingsSchema,
  mvpGeneratorSchema,
  contactFormSchema
} from "@shared/schema";
import { adminAuth, requireAdmin, verifyToken } from "./middleware/auth";

// Simple auth middleware for admin routes
const isAuthenticated = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.session?.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized - No token" });
  }

  const decoded = verifyToken(token);
  if (!decoded || !decoded.isAdmin) {
    return res.status(401).json({ message: "Unauthorized - Invalid token" });
  }

  req.user = decoded;
  next();
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
  app.post("/api/admin/login", adminAuth);

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
    } catch (error: unknown) {
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
      const allKeys = await storage.getAllApiKeys("gemini");
      res.json({ gemini: allKeys });
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

  // Advertisement management
  app.get("/api/admin/advertisements", isAuthenticated, async (req, res) => {
    try {
      const ads = await storage.getAdvertisements();
      res.json(ads);
    } catch (error) {
      console.error("Ads fetch error:", error);
      res.status(500).json({ message: "Failed to fetch advertisements" });
    }
  });

  app.post("/api/admin/advertisements", isAuthenticated, async (req, res) => {
    try {
      const data = insertAdvertisementSchema.parse(req.body);
      const ad = await storage.createAdvertisement(data);
      res.json(ad);
    } catch (error) {
      console.error("Ad create error:", error);
      res.status(400).json({ message: "Invalid advertisement data" });
    }
  });

  app.put("/api/admin/advertisements/:id", isAuthenticated, async (req, res) => {
    try {
      const data = insertAdvertisementSchema.partial().parse(req.body);
      const ad = await storage.updateAdvertisement(req.params.id, data);
      res.json(ad);
    } catch (error) {
      console.error("Ad update error:", error);
      res.status(400).json({ message: "Invalid advertisement data" });
    }
  });

  app.delete("/api/admin/advertisements/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteAdvertisement(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Ad delete error:", error);
      res.status(500).json({ message: "Failed to delete advertisement" });
    }
  });

  // Ad settings
  app.get("/api/admin/ad-settings", isAuthenticated, async (req, res) => {
    try {
      const settings = await storage.getAdSettings();
      res.json(settings || { adCount: "low", enableAds: false });
    } catch (error) {
      console.error("Ad settings fetch error:", error);
      res.status(500).json({ message: "Failed to fetch ad settings" });
    }
  });

  app.post("/api/admin/ad-settings", isAuthenticated, async (req, res) => {
    try {
      const data = insertAdSettingsSchema.parse(req.body);
      const settings = await storage.updateAdSettings(data);
      res.json(settings);
    } catch (error) {
      console.error("Ad settings update error:", error);
      res.status(400).json({ message: "Invalid ad settings data" });
    }
  });

  // Auto blog management
  app.get("/api/admin/auto-blog", isAuthenticated, async (req, res) => {
    try {
      const settings = await storage.getAutoBlogSettings();
      const queue = await storage.getAutoBlogQueue();
      res.json({ settings, queue });
    } catch (error) {
      console.error("Auto blog fetch error:", error);
      res.status(500).json({ message: "Failed to fetch auto blog data" });
    }
  });

  app.post("/api/admin/auto-blog/settings", isAuthenticated, async (req, res) => {
    try {
      const data = insertAutoBlogSettingsSchema.parse(req.body);
      const settings = await storage.updateAutoBlogSettings(data);
      res.json(settings);
    } catch (error) {
      console.error("Auto blog settings update error:", error);
      res.status(400).json({ message: "Invalid auto blog settings" });
    }
  });

  app.post("/api/admin/auto-blog/generate", isAuthenticated, async (req, res) => {
    try {
      const { topic } = req.body;

      // Import autoBlog service and generate immediately
      const { AutoBlogService } = await import("./services/autoBlog");
      const autoBlogService = new AutoBlogService();

      // Get auto-blog settings for affiliate links
      const settings = await storage.getAutoBlogSettings();
      const affiliateLinks = settings?.affiliateLinks ? 
        Array.isArray(settings.affiliateLinks) ? settings.affiliateLinks : [] : [];

      // Generate the blog post content immediately
      const content = await autoBlogService.generateHumanizedBlogPost(
        topic,
        affiliateLinks,
        settings?.useLatestTrends ?? true,
        settings?.focusOnMyApp ?? true
      );

      // Create slug from title
      const slug = content.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .trim();

      // Save as blog post to database
      const blogPost = await storage.createBlogPost({
        title: content.title,
        slug: slug + `-${Date.now()}`, // Ensure uniqueness
        excerpt: content.excerpt,
        content: content.content,
        author: content.author,
        metaTitle: content.metaTitle,
        metaDescription: content.metaDescription,
        keywords: content.keywords,
        featured: false
      });

      res.json({ 
        success: true, 
        message: "Blog post generated and published successfully",
        blogPost: blogPost,
        generatedContent: content
      });
    } catch (error) {
      console.error("Auto blog generation error:", error);
      res.status(500).json({ 
        message: error.message || "Failed to generate blog post" 
      });
    }
  });

  // Site configuration
  app.get("/api/admin/site-config", isAuthenticated, async (req, res) => {
    try {
      const config = await storage.getSetting("site_config");
      res.json(config?.value || {});
    } catch (error) {
      console.error("Site config fetch error:", error);
      res.status(500).json({ message: "Failed to fetch site configuration" });
    }
  });

  app.post("/api/admin/site-config", isAuthenticated, async (req, res) => {
    try {
      const config = await storage.setSetting("site_config", req.body);
      res.json(config);
    } catch (error) {
      console.error("Site config update error:", error);
      res.status(500).json({ message: "Failed to update site configuration" });
    }
  });

  // SEO settings
  app.get("/api/admin/seo-settings", isAuthenticated, async (req, res) => {
    try {
      const settings = await storage.getSetting("seo_settings");
      res.json(settings?.value || {});
    } catch (error) {
      console.error("SEO settings fetch error:", error);
      res.status(500).json({ message: "Failed to fetch SEO settings" });
    }
  });

  app.post("/api/admin/seo-settings", isAuthenticated, async (req, res) => {
    try {
      const settings = await storage.setSetting("seo_settings", req.body);
      res.json(settings);
    } catch (error) {
      console.error("SEO settings update error:", error);
      res.status(500).json({ message: "Failed to update SEO settings" });
    }
  });

  // Email configuration
  app.get("/api/admin/email-config", isAuthenticated, async (req, res) => {
    try {
      const config = await storage.getSetting("email_config");
      res.json(config?.value || {});
    } catch (error) {
      console.error("Email config fetch error:", error);
      res.status(500).json({ message: "Failed to fetch email configuration" });
    }
  });

  app.post("/api/admin/email-config", isAuthenticated, async (req, res) => {
    try {
      const config = await storage.setSetting("email_config", req.body);
      res.json(config);
    } catch (error) {
      console.error("Email config update error:", error);
      res.status(500).json({ message: "Failed to update email configuration" });
    }
  });

  app.post("/api/admin/email-config/test", isAuthenticated, async (req, res) => {
    try {
      const { email } = req.body;
      // Mock email test - in production this would send a real test email
      res.json({ success: true, message: "Test email would be sent to " + email });
    } catch (error) {
      console.error("Email test error:", error);
      res.status(500).json({ message: "Failed to send test email" });
    }
  });

  // Enhanced Site Settings
  app.get("/api/admin/site-settings", isAuthenticated, async (req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      res.json(settings || {
        siteName: "MVP Generator AI",
        siteDescription: "Generate comprehensive MVP plans using AI",
        contactEmail: "admin@mvpgenerator.ai",
        contactPhone: null,
        contactAddress: null,
        socialLinks: null,
        seoSettings: null,
        maintenanceMode: false,
        maintenanceMessage: null,
        enableRegistration: false,
        enableComments: true,
        maxMvpGenerationsPerDay: 10
      });
    } catch (error) {
      console.error("Site settings fetch error:", error);
      res.status(500).json({ message: "Failed to fetch site settings" });
    }
  });

  app.post("/api/admin/site-settings", isAuthenticated, async (req, res) => {
    try {
      const data = insertSiteSettingsSchema.parse(req.body);
      const settings = await storage.updateSiteSettings(data);
      res.json(settings);
    } catch (error) {
      console.error("Site settings update error:", error);
      res.status(400).json({ message: "Invalid site settings data" });
    }
  });

  // Enhanced Auto Blog with new scheduling options
  app.post("/api/admin/auto-blog/test-generation", isAuthenticated, async (req, res) => {
    try {
      const { topic } = req.body;
      if (!topic) {
        return res.status(400).json({ message: "Topic is required" });
      }

      // Import autoBlog service and generate a test post
      const { AutoBlogService } = await import("./services/autoBlog");
      const autoBlogService = new AutoBlogService();

      const content = await autoBlogService.generateHumanizedBlogPost(topic, [], true, true);
      res.json({ success: true, preview: content });
    } catch (error) {
      console.error("Test generation error:", error);
      res.status(500).json({ message: "Failed to generate test content" });
    }
  });

  app.post("/api/admin/auto-blog/schedule-immediate", isAuthenticated, async (req, res) => {
    try {
      const { count = 1 } = req.body;

      // Import autoBlog service
      const { AutoBlogService } = await import("./services/autoBlog");
      const autoBlogService = new AutoBlogService();

      // Schedule posts immediately
      for (let i = 0; i < Math.min(count, 5); i++) { // Max 5 at once
        const topic = await autoBlogService.getRandomTopic(true, true);
        await storage.createAutoBlogQueueItem({
          topic,
          status: "pending"
        });
      }

      res.json({ success: true, message: `Scheduled ${count} posts for immediate generation` });
    } catch (error) {
      console.error("Immediate schedule error:", error);
      res.status(500).json({ message: "Failed to schedule posts" });
    }
  });

  // Advanced SEO Management
  app.get("/api/seo/meta/:page", async (req, res) => {
    try {
      const { page } = req.params;
      const siteSettings = await storage.getSiteSettings();
      const seoSettings = siteSettings?.seoSettings as any || {};

      let meta = {
        title: siteSettings?.siteName || "MVP Generator AI",
        description: siteSettings?.siteDescription || "Generate comprehensive MVP plans using AI",
        keywords: ["MVP", "startup", "business plan", "AI", "generator"]
      };

      // Page-specific SEO
      switch (page) {
        case "home":
          meta.title = `${siteSettings?.siteName || "MVP Generator AI"} - AI-Powered Startup Planning`;
          meta.description = "Transform your startup ideas into comprehensive MVP plans with our AI-powered generator. Get tech stacks, features, and roadmaps in minutes.";
          break;
        case "generator":
          meta.title = "MVP Generator - Create Your Startup Plan";
          meta.description = "Use our AI MVP generator to create detailed startup plans. Input your idea and get a complete roadmap with tech stack recommendations.";
          break;
        case "blog":
          meta.title = "Startup & MVP Development Blog";
          meta.description = "Expert insights on MVP development, startup strategies, and entrepreneurship. Learn from real-world examples and industry best practices.";
          break;
      }

      // Override with custom SEO settings if available
      if (seoSettings[page]) {
        meta = { ...meta, ...seoSettings[page] };
      }

      res.json(meta);
    } catch (error) {
      console.error("SEO meta fetch error:", error);
      res.json({
        title: "MVP Generator AI",
        description: "Generate comprehensive MVP plans using AI",
        keywords: ["MVP", "startup", "business plan", "AI"]
      });
    }
  });

  // Contact form with site settings integration
  app.post("/api/contact", async (req, res) => {
    try {
      const data = contactFormSchema.parse(req.body);

      const contact = await storage.createContact(data);

      // Track the contact form submission
      await storage.trackPageView({
        page: "/contact",
        sessionId: req.sessionID,
        metadata: { action: "contact_form_submit", subject: data.subject }
      });

      res.json({ 
        success: true, 
        message: "Thank you for your message. We'll get back to you soon!" 
      });
    } catch (error) {
      console.error("Contact form error:", error);
      res.status(400).json({ message: "Please check your form and try again" });
    }
  });

  // Public route to get active ads for display
  app.get("/api/advertisements", async (req, res) => {
    try {
      const adSettings = await storage.getAdSettings();
      if (!adSettings?.enableAds) {
        return res.json([]);
      }

      const ads = await storage.getAdvertisements();
      const activeAds = ads.filter(ad => ad.isActive);

      // Filter by ad count setting
      let maxAds = 2; // low
      if (adSettings.adCount === "medium") maxAds = 4;
      if (adSettings.adCount === "high") maxAds = 6;

      res.json(activeAds.slice(0, maxAds));
    } catch (error) {
      console.error("Public ads fetch error:", error);
      res.json([]);
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

  app.post("/api/mvp-generate", async (req, res) => {
    try {
      const storage = await getStorage();
      await storage.trackPageView({
        page: "/api/mvp-generate",
        userAgent: req.headers["user-agent"],
        ip: req.ip,
        sessionId: req.session?.id,
        metadata: { endpoint: "mvp-generate" },
      });

      const data = insertMvpGenerationSchema.parse(req.body);
      const geminiServiceInstance = new geminiService(storage);
      const mvpPlan = await geminiServiceInstance.generateMvpPlan(
        data.idea,
        data.industry,
        data.targetAudience,
        data.budget
      );

      await storage.createMvpGeneration({
        idea: data.idea,
        industry: data.industry,
        targetAudience: data.targetAudience,
        budget: data.budget,
        result: mvpPlan,
        ip: req.ip,
        sessionId: req.session?.id,
      });

      res.status(200).json({ plan: mvpPlan });
    } catch (error: any) {
      console.error("MVP generation error:", error);
      res
        .status(500)
        .json({ message: error.message || "Failed to generate MVP plan" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}