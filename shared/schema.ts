import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Analytics table for tracking page views and user interactions
export const analytics = pgTable("analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  page: varchar("page").notNull(),
  userAgent: text("user_agent"),
  ip: varchar("ip"),
  timestamp: timestamp("timestamp").defaultNow(),
  sessionId: varchar("session_id"),
  referrer: text("referrer"),
  metadata: jsonb("metadata"),
});

// MVP generations table for storing AI-generated plans
export const mvpGenerations = pgTable("mvp_generations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  idea: text("idea").notNull(),
  industry: varchar("industry"),
  targetAudience: varchar("target_audience"),
  budget: varchar("budget"),
  result: jsonb("result").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  ip: varchar("ip"),
  sessionId: varchar("session_id"),
});

// Blog posts for SEO content
export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: varchar("slug").unique().notNull(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  author: varchar("author").notNull(),
  publishedAt: timestamp("published_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  featured: boolean("featured").default(false),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  keywords: text("keywords").array(),
  imageUrl: text("image_url"),
});

// Contact form submissions
export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email").notNull(),
  subject: varchar("subject").notNull(),
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  responded: boolean("responded").default(false),
});

// Admin settings for content management
export const adminSettings = pgTable("admin_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key").unique().notNull(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Gemini API keys for rotation
export const apiKeys = pgTable("api_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  provider: varchar("provider").notNull(),
  key: text("key").notNull(),
  isActive: boolean("is_active").default(true),
  dailyUsage: integer("daily_usage").default(0),
  lastReset: timestamp("last_reset").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Advertisement management
export const advertisements = pgTable("advertisements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  adCode: text("ad_code").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  position: varchar("position").notNull(), // header, sidebar, content, footer
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Ad settings for global control
export const adSettings = pgTable("ad_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adCount: varchar("ad_count").notNull().default("low"), // low, medium, high
  enableAds: boolean("enable_ads").default(false),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Auto blog generation settings and queue
export const autoBlogSettings = pgTable("auto_blog_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  enabled: boolean("enabled").default(false),
  frequency: varchar("frequency").notNull().default("daily"), // daily-1, daily-2, daily-5, weekly-1, weekly-2, weekly-4, monthly-1
  dailyPostCount: integer("daily_post_count").default(1), // 1-5 posts per day
  weeklyPostCount: integer("weekly_post_count").default(1), // 1-7 posts per week
  monthlyPostCount: integer("monthly_post_count").default(1), // 1-30 posts per month
  lastRun: timestamp("last_run"),
  nextRun: timestamp("next_run"),
  topics: text("topics").array().default(sql`ARRAY[]::text[]`),
  affiliateLinks: jsonb("affiliate_links"), // {url, text, placement}
  useLatestTrends: boolean("use_latest_trends").default(true), // Use 2025 and latest topics
  focusOnMyApp: boolean("focus_on_my_app").default(true), // Generate content related to MVP generator
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Auto blog generation queue
export const autoBlogQueue = pgTable("auto_blog_queue", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  topic: text("topic").notNull(),
  status: varchar("status").notNull().default("pending"), // pending, processing, completed, failed
  generatedContent: jsonb("generated_content"),
  publishedPostId: varchar("published_post_id"),
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at"),
  error: text("error"),
});

// Site settings for comprehensive control
export const siteSettings = pgTable("site_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  siteName: varchar("site_name").notNull().default("MVP Generator AI"),
  siteDescription: text("site_description").notNull().default("Generate comprehensive MVP plans using AI"),
  contactEmail: varchar("contact_email").notNull().default("admin@mvpgenerator.ai"),
  contactPhone: varchar("contact_phone"),
  contactAddress: text("contact_address"),
  socialLinks: jsonb("social_links"), // {twitter, linkedin, facebook, etc}
  seoSettings: jsonb("seo_settings"), // {defaultTitle, defaultDescription, keywords, etc}
  maintenanceMode: boolean("maintenance_mode").default(false),
  maintenanceMessage: text("maintenance_message"),
  enableRegistration: boolean("enable_registration").default(false),
  enableComments: boolean("enable_comments").default(true),
  maxMvpGenerationsPerDay: integer("max_mvp_generations_per_day").default(10),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schema definitions for validation
export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
  timestamp: true,
});

export const insertMvpGenerationSchema = createInsertSchema(mvpGenerations).omit({
  id: true,
  timestamp: true,
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  publishedAt: true,
  updatedAt: true,
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  timestamp: true,
  responded: true,
});

export const insertAdminSettingSchema = createInsertSchema(adminSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertApiKeySchema = createInsertSchema(apiKeys).omit({
  id: true,
  createdAt: true,
  lastReset: true,
});

export const insertAdvertisementSchema = createInsertSchema(advertisements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdSettingsSchema = createInsertSchema(adSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertAutoBlogSettingsSchema = z.object({
  enabled: z.boolean().default(false),
  frequency: z.enum(["daily", "weekly", "monthly"]).default("daily"),
  topics: z.array(z.string()).optional(),
  affiliateLinks: z.array(z.object({
    url: z.string().url(),
    text: z.string(),
    placement: z.string()
  })).optional(),
  dailyCount: z.number().min(1).max(10).default(1),
  scheduleTime: z.string().default("09:00"),
  lastRun: z.string().optional(),
  nextRun: z.string().optional(),
});

export const insertAutoBlogQueueSchema = createInsertSchema(autoBlogQueue).omit({
  id: true,
  createdAt: true,
  processedAt: true,
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettings).omit({
  id: true,
  updatedAt: true,
});

// MVP Generator form schema
export const mvpGeneratorSchema = z.object({
  idea: z.string().min(10, "Please provide a detailed description"),
  industry: z.string().min(1, "Please select an industry"),
  targetAudience: z.string().min(1, "Please select target audience"),
  budget: z.string().min(1, "Please select budget range"),
});

// Contact form schema
export const contactFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  subject: z.string().min(1, "Please select a subject"),
  message: z.string().min(10, "Please provide a detailed message"),
});

// Type exports
export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;

export type MvpGeneration = typeof mvpGenerations.$inferSelect;
export type InsertMvpGeneration = z.infer<typeof insertMvpGenerationSchema>;

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;

export type AdminSetting = typeof adminSettings.$inferSelect;
export type InsertAdminSetting = z.infer<typeof insertAdminSettingSchema>;

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;

export type Advertisement = typeof advertisements.$inferSelect;
export type InsertAdvertisement = z.infer<typeof insertAdvertisementSchema>;

export type AdSettings = typeof adSettings.$inferSelect;
export type InsertAdSettings = z.infer<typeof insertAdSettingsSchema>;

export type AutoBlogSettings = typeof autoBlogSettings.$inferSelect;
export type InsertAutoBlogSettings = z.infer<typeof insertAutoBlogSettingsSchema>;

export type AutoBlogQueue = typeof autoBlogQueue.$inferSelect;
export type InsertAutoBlogQueue = z.infer<typeof insertAutoBlogQueueSchema>;

export type SiteSettings = typeof siteSettings.$inferSelect;
export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;

export type MvpGeneratorData = z.infer<typeof mvpGeneratorSchema>;
export type ContactFormData = z.infer<typeof contactFormSchema>;