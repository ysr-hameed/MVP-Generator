import {
  analytics,
  mvpGenerations,
  blogPosts,
  contacts,
  adminSettings,
  apiKeys,
  type Analytics,
  type InsertAnalytics,
  type MvpGeneration,
  type InsertMvpGeneration,
  type BlogPost,
  type InsertBlogPost,
  type Contact,
  type InsertContact,
  type AdminSetting,
  type InsertAdminSetting,
  type ApiKey,
  type InsertApiKey,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, sql } from "drizzle-orm";

export interface IStorage {
  // Analytics operations
  trackPageView(data: InsertAnalytics): Promise<Analytics>;
  getAnalytics(dateRange?: { from: Date; to: Date }): Promise<any>;
  
  // MVP Generation operations
  createMvpGeneration(data: InsertMvpGeneration): Promise<MvpGeneration>;
  getMvpGenerations(limit?: number): Promise<MvpGeneration[]>;
  
  // Blog operations
  createBlogPost(data: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: string, data: Partial<InsertBlogPost>): Promise<BlogPost>;
  deleteBlogPost(id: string): Promise<void>;
  getBlogPosts(limit?: number): Promise<BlogPost[]>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  
  // Contact operations
  createContact(data: InsertContact): Promise<Contact>;
  getContacts(limit?: number): Promise<Contact[]>;
  markContactResponded(id: string): Promise<void>;
  
  // Admin settings operations
  getSetting(key: string): Promise<AdminSetting | undefined>;
  setSetting(key: string, value: any): Promise<AdminSetting>;
  
  // API Keys operations
  getActiveApiKeys(provider: string): Promise<ApiKey[]>;
  createApiKey(data: InsertApiKey): Promise<ApiKey>;
  toggleApiKey(id: string, isActive: boolean): Promise<ApiKey>;
  deleteApiKey(id: string): Promise<void>;
  incrementApiUsage(id: string): Promise<void>;
  resetDailyUsage(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async trackPageView(data: InsertAnalytics): Promise<Analytics> {
    const [analytics] = await db
      .insert(analytics)
      .values({
        ...data,
        ip: data.ip?.substring(0, 12) + '***', // Privacy: partial IP
      })
      .returning();
    return analytics;
  }

  async getAnalytics(dateRange?: { from: Date; to: Date }) {
    const baseQuery = db.select().from(analytics);
    
    const analyticsData = dateRange
      ? await baseQuery.where(
          and(
            sql`${analytics.timestamp} >= ${dateRange.from}`,
            sql`${analytics.timestamp} <= ${dateRange.to}`
          )
        )
      : await baseQuery.orderBy(desc(analytics.timestamp)).limit(1000);

    // Get summary stats
    const totalViews = analyticsData.length;
    
    const pageViews = analyticsData.reduce((acc, item) => {
      acc[item.page] = (acc[item.page] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dailyViews = analyticsData.reduce((acc, item) => {
      const date = item.timestamp?.toISOString().split('T')[0] || 'unknown';
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get MVP generation count
    const [mvpCount] = await db
      .select({ count: count() })
      .from(mvpGenerations);

    return {
      totalViews,
      totalMvpGenerated: mvpCount.count,
      totalApiCalls: totalViews, // Simplified
      activeUsers: Math.floor(totalViews / 10), // Estimation
      pageViews,
      dailyViews,
    };
  }

  async createMvpGeneration(data: InsertMvpGeneration): Promise<MvpGeneration> {
    const [generation] = await db
      .insert(mvpGenerations)
      .values({
        ...data,
        ip: data.ip?.substring(0, 12) + '***', // Privacy
      })
      .returning();
    return generation;
  }

  async getMvpGenerations(limit = 100): Promise<MvpGeneration[]> {
    return await db
      .select()
      .from(mvpGenerations)
      .orderBy(desc(mvpGenerations.timestamp))
      .limit(limit);
  }

  async createBlogPost(data: InsertBlogPost): Promise<BlogPost> {
    const [post] = await db
      .insert(blogPosts)
      .values(data)
      .returning();
    return post;
  }

  async updateBlogPost(id: string, data: Partial<InsertBlogPost>): Promise<BlogPost> {
    const [post] = await db
      .update(blogPosts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(blogPosts.id, id))
      .returning();
    return post;
  }

  async deleteBlogPost(id: string): Promise<void> {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
  }

  async getBlogPosts(limit = 50): Promise<BlogPost[]> {
    return await db
      .select()
      .from(blogPosts)
      .orderBy(desc(blogPosts.publishedAt))
      .limit(limit);
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug));
    return post;
  }

  async createContact(data: InsertContact): Promise<Contact> {
    const [contact] = await db
      .insert(contacts)
      .values(data)
      .returning();
    return contact;
  }

  async getContacts(limit = 100): Promise<Contact[]> {
    return await db
      .select()
      .from(contacts)
      .orderBy(desc(contacts.timestamp))
      .limit(limit);
  }

  async markContactResponded(id: string): Promise<void> {
    await db
      .update(contacts)
      .set({ responded: true })
      .where(eq(contacts.id, id));
  }

  async getSetting(key: string): Promise<AdminSetting | undefined> {
    const [setting] = await db
      .select()
      .from(adminSettings)
      .where(eq(adminSettings.key, key));
    return setting;
  }

  async setSetting(key: string, value: any): Promise<AdminSetting> {
    const existing = await this.getSetting(key);
    
    if (existing) {
      const [setting] = await db
        .update(adminSettings)
        .set({ value, updatedAt: new Date() })
        .where(eq(adminSettings.key, key))
        .returning();
      return setting;
    } else {
      const [setting] = await db
        .insert(adminSettings)
        .values({ key, value })
        .returning();
      return setting;
    }
  }

  async getActiveApiKeys(provider: string): Promise<ApiKey[]> {
    return await db
      .select()
      .from(apiKeys)
      .where(and(eq(apiKeys.provider, provider), eq(apiKeys.isActive, true)))
      .orderBy(apiKeys.dailyUsage); // Rotate to least used
  }

  async createApiKey(data: InsertApiKey): Promise<ApiKey> {
    const [key] = await db
      .insert(apiKeys)
      .values(data)
      .returning();
    return key;
  }

  async toggleApiKey(id: string, isActive: boolean): Promise<ApiKey> {
    const [key] = await db
      .update(apiKeys)
      .set({ isActive })
      .where(eq(apiKeys.id, id))
      .returning();
    return key;
  }

  async deleteApiKey(id: string): Promise<void> {
    await db.delete(apiKeys).where(eq(apiKeys.id, id));
  }

  async incrementApiUsage(id: string): Promise<void> {
    await db
      .update(apiKeys)
      .set({ 
        dailyUsage: sql`${apiKeys.dailyUsage} + 1`
      })
      .where(eq(apiKeys.id, id));
  }

  async resetDailyUsage(): Promise<void> {
    await db
      .update(apiKeys)
      .set({ 
        dailyUsage: 0,
        lastReset: new Date()
      });
  }
}

export const storage = new DatabaseStorage();