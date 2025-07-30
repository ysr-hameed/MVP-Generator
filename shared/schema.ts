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
  frequency: varchar("frequency").notNull().default("daily"), // daily, weekly, monthly
  lastRun: timestamp("last_run"),
  nextRun: timestamp("next_run"),
  topics: text("topics").array().default(sql`ARRAY[]::text[]`),
  affiliateLinks: jsonb("affiliate_links"), // {url, text, placement}
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

export const insertAutoBlogSettingsSchema = createInsertSchema(autoBlogSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAutoBlogQueueSchema = createInsertSchema(autoBlogQueue).omit({
  id: true,
  createdAt: true,
  processedAt: true,
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

export type MvpGeneratorData = z.infer<typeof mvpGeneratorSchema>;
export type ContactFormData = z.infer<typeof contactFormSchema>;
