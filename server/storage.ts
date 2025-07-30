import {
  analytics,
  mvpGenerations,
  blogPosts,
  contacts,
  adminSettings,
  apiKeys,
  advertisements,
  adSettings,
  autoBlogSettings,
  autoBlogQueue,
  siteSettings,
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
  type Advertisement,
  type InsertAdvertisement,
  type AdSettings,
  type InsertAdSettings,
  type AutoBlogSettings,
  type InsertAutoBlogSettings,
  type AutoBlogQueue,
  type InsertAutoBlogQueue,
  type SiteSettings,
  type InsertSiteSettings,
} from "@shared/schema";
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

  // Advertisement operations
  getAdvertisements(): Promise<Advertisement[]>;
  createAdvertisement(data: InsertAdvertisement): Promise<Advertisement>;
  updateAdvertisement(id: string, data: Partial<InsertAdvertisement>): Promise<Advertisement>;
  deleteAdvertisement(id: string): Promise<void>;
  getAdSettings(): Promise<AdSettings | undefined>;
  updateAdSettings(data: InsertAdSettings): Promise<AdSettings>;

  // Auto blog operations
  getAutoBlogSettings(): Promise<AutoBlogSettings | undefined>;
  updateAutoBlogSettings(data: Partial<InsertAutoBlogSettings>): Promise<AutoBlogSettings>;
  createAutoBlogQueueItem(data: InsertAutoBlogQueue): Promise<AutoBlogQueue>;
  getAutoBlogQueue(status?: string): Promise<AutoBlogQueue[]>;
  updateAutoBlogQueueStatus(id: string, status: string, data?: any): Promise<void>;
  
  // Site settings operations
  getSiteSettings(): Promise<SiteSettings | undefined>;
  updateSiteSettings(data: Partial<InsertSiteSettings>): Promise<SiteSettings>;
}

export class DatabaseStorage implements IStorage {
  constructor(private db: any) {}

  async trackPageView(data: InsertAnalytics): Promise<Analytics> {
    const [analyticsResult] = await this.db
      .insert(analytics)
      .values({
        ...data,
        ip: data.ip?.substring(0, 12) + '***', // Privacy: partial IP
      })
      .returning();
    return analyticsResult;
  }

  async getAnalytics(dateRange?: { from: Date; to: Date }) {
    const baseQuery = this.db.select().from(analytics);

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

    const pageViews = analyticsData.reduce((acc: Record<string, number>, item: Analytics) => {
      acc[item.page] = (acc[item.page] || 0) + 1;
      return acc;
    }, {});

    const dailyViews = analyticsData.reduce((acc: Record<string, number>, item: Analytics) => {
      const date = item.timestamp?.toISOString().split('T')[0] || 'unknown';
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Get MVP generation count
    const [mvpCount] = await this.db
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
    const [generation] = await this.db
      .insert(mvpGenerations)
      .values({
        ...data,
        ip: data.ip?.substring(0, 12) + '***', // Privacy
      })
      .returning();
    return generation;
  }

  async getMvpGenerations(limit = 100): Promise<MvpGeneration[]> {
    return await this.db
      .select()
      .from(mvpGenerations)
      .orderBy(desc(mvpGenerations.timestamp))
      .limit(limit);
  }

  async createBlogPost(data: InsertBlogPost): Promise<BlogPost> {
    const [post] = await this.db
      .insert(blogPosts)
      .values(data)
      .returning();
    return post;
  }

  async updateBlogPost(id: string, data: Partial<InsertBlogPost>): Promise<BlogPost> {
    const [post] = await this.db
      .update(blogPosts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(blogPosts.id, id))
      .returning();
    return post;
  }

  async deleteBlogPost(id: string): Promise<void> {
    await this.db.delete(blogPosts).where(eq(blogPosts.id, id));
  }

  async getBlogPosts(limit = 50): Promise<BlogPost[]> {
    return await this.db
      .select()
      .from(blogPosts)
      .orderBy(desc(blogPosts.publishedAt))
      .limit(limit);
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [post] = await this.db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug));
    return post;
  }

  async createContact(data: InsertContact): Promise<Contact> {
    const [contact] = await this.db
      .insert(contacts)
      .values(data)
      .returning();
    return contact;
  }

  async getContacts(limit = 100): Promise<Contact[]> {
    return await this.db
      .select()
      .from(contacts)
      .orderBy(desc(contacts.timestamp))
      .limit(limit);
  }

  async markContactResponded(id: string): Promise<void> {
    await this.db
      .update(contacts)
      .set({ responded: true })
      .where(eq(contacts.id, id));
  }

  async getSetting(key: string): Promise<AdminSetting | undefined> {
    try {
      const [setting] = await this.db
        .select()
        .from(adminSettings)
        .where(eq(adminSettings.key, key));
      return setting;
    } catch (error) {
      console.error(`Error getting setting ${key}:`, error);
      return undefined;
    }
  }

  async setSetting(key: string, value: any): Promise<AdminSetting> {
    try {
      const existing = await this.getSetting(key);

      if (existing) {
        const [setting] = await this.db
          .update(adminSettings)
          .set({ value, updatedAt: new Date() })
          .where(eq(adminSettings.key, key))
          .returning();
        return setting;
      } else {
        const [setting] = await this.db
          .insert(adminSettings)
          .values({ key, value })
          .returning();
        return setting;
      }
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
      throw new Error(`Failed to save setting: ${key}`);
    }
  }

  async getActiveApiKeys(provider: string): Promise<ApiKey[]> {
    return await this.db
      .select()
      .from(apiKeys)
      .where(and(eq(apiKeys.provider, provider), eq(apiKeys.isActive, true)))
      .orderBy(apiKeys.dailyUsage); // Rotate to least used
  }

  async createApiKey(data: InsertApiKey): Promise<ApiKey> {
    const [key] = await this.db
      .insert(apiKeys)
      .values(data)
      .returning();
    return key;
  }

  async toggleApiKey(id: string, isActive: boolean): Promise<ApiKey> {
    const [key] = await this.db
      .update(apiKeys)
      .set({ isActive })
      .where(eq(apiKeys.id, id))
      .returning();
    return key;
  }

  async deleteApiKey(id: string): Promise<void> {
    await this.db.delete(apiKeys).where(eq(apiKeys.id, id));
  }

  async incrementApiUsage(id: string): Promise<void> {
    await this.db
      .update(apiKeys)
      .set({ 
        dailyUsage: sql`${apiKeys.dailyUsage} + 1`
      })
      .where(eq(apiKeys.id, id));
  }

  async resetDailyUsage(): Promise<void> {
    await this.db.update(apiKeys).set({ 
      dailyUsage: 0, 
      lastReset: new Date() 
    });
  }

  // Advertisement operations
  async getAdvertisements(): Promise<Advertisement[]> {
    return await this.db.select().from(advertisements).orderBy(advertisements.createdAt);
  }

  async createAdvertisement(data: InsertAdvertisement): Promise<Advertisement> {
    const [result] = await this.db.insert(advertisements).values(data).returning();
    return result;
  }

  async updateAdvertisement(id: string, data: Partial<InsertAdvertisement>): Promise<Advertisement> {
    const [result] = await this.db
      .update(advertisements)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(advertisements.id, id))
      .returning();
    return result;
  }

  async deleteAdvertisement(id: string): Promise<void> {
    await this.db.delete(advertisements).where(eq(advertisements.id, id));
  }

  async getAdSettings(): Promise<AdSettings | undefined> {
    const [result] = await this.db.select().from(adSettings).limit(1);
    return result;
  }

  async updateAdSettings(data: InsertAdSettings): Promise<AdSettings> {
    const existing = await this.getAdSettings();
    if (existing) {
      const [result] = await this.db
        .update(adSettings)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(adSettings.id, existing.id))
        .returning();
      return result;
    } else {
      const [result] = await this.db.insert(adSettings).values(data).returning();
      return result;
    }
  }

  // Auto blog operations
  async getAutoBlogSettings(): Promise<AutoBlogSettings | undefined> {
    const [result] = await this.db.select().from(autoBlogSettings).limit(1);
    return result;
  }

  async updateAutoBlogSettings(data: Partial<InsertAutoBlogSettings>): Promise<AutoBlogSettings> {
    const existing = await this.getAutoBlogSettings();
    if (existing) {
      const [result] = await this.db
        .update(autoBlogSettings)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(autoBlogSettings.id, existing.id))
        .returning();
      return result;
    } else {
      const [result] = await this.db.insert(autoBlogSettings).values(data).returning();
      return result;
    }
  }

  async createAutoBlogQueueItem(data: InsertAutoBlogQueue): Promise<AutoBlogQueue> {
    const [result] = await this.db.insert(autoBlogQueue).values(data).returning();
    return result;
  }

  async getAutoBlogQueue(status?: string): Promise<AutoBlogQueue[]> {
    if (status) {
      return await this.db.select().from(autoBlogQueue)
        .where(eq(autoBlogQueue.status, status))
        .orderBy(autoBlogQueue.createdAt);
    }
    return await this.db.select().from(autoBlogQueue).orderBy(autoBlogQueue.createdAt);
  }

  async updateAutoBlogQueueStatus(id: string, status: string, data?: any): Promise<void> {
    const updateData: any = { status, processedAt: new Date() };
    if (data) {
      if (data.content) updateData.generatedContent = data.content;
      if (data.postId) updateData.publishedPostId = data.postId;
      if (data.error) updateData.error = data.error;
    }

    await this.db
      .update(autoBlogQueue)
      .set(updateData)
      .where(eq(autoBlogQueue.id, id));
  }

  async getSiteSettings(): Promise<SiteSettings | undefined> {
    const results = await this.db.select().from(siteSettings).limit(1);
    return results[0];
  }

  async updateSiteSettings(data: Partial<InsertSiteSettings>): Promise<SiteSettings> {
    const existing = await this.getSiteSettings();
    
    if (existing) {
      const [result] = await this.db
        .update(siteSettings)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(siteSettings.id, existing.id))
        .returning();
      return result;
    } else {
      const [result] = await this.db.insert(siteSettings).values(data).returning();
      return result;
    }
  }
}

// Memory storage implementation for development without database
export class MemoryStorage implements IStorage {
  private analytics: Analytics[] = [];
  private mvpGenerations: MvpGeneration[] = [];
  private blogPosts: BlogPost[] = [];
  private contacts: Contact[] = [];
  private settings: AdminSetting[] = [];
  private apiKeys: ApiKey[] = [];
  private advertisements: Advertisement[] = [];
  private adSettings: AdSettings | undefined;
  private autoBlogSettings: AutoBlogSettings | undefined;
  private autoBlogQueue: AutoBlogQueue[] = [];
  private siteSettings: SiteSettings | undefined;

  async trackPageView(data: InsertAnalytics): Promise<Analytics> {
    const analytics: Analytics = {
      id: `analytics_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      page: data.page,
      userAgent: data.userAgent || null,
      ip: data.ip ? data.ip.substring(0, 12) + '***' : null,
      timestamp: new Date(),
      sessionId: data.sessionId || null,
      referrer: data.referrer || null,
      metadata: data.metadata || null,
    };
    this.analytics.push(analytics);
    return analytics;
  }

  async getAnalytics(dateRange?: { from: Date; to: Date }) {
    const filteredAnalytics = dateRange 
      ? this.analytics.filter(a => 
          a.timestamp && a.timestamp >= dateRange.from && a.timestamp <= dateRange.to
        )
      : this.analytics.slice(-1000);

    const totalViews = filteredAnalytics.length;
    const pageViews = filteredAnalytics.reduce((acc: Record<string, number>, item) => {
      acc[item.page] = (acc[item.page] || 0) + 1;
      return acc;
    }, {});

    const dailyViews = filteredAnalytics.reduce((acc: Record<string, number>, item) => {
      const date = item.timestamp?.toISOString().split('T')[0] || 'unknown';
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return {
      totalViews,
      totalMvpGenerated: this.mvpGenerations.length,
      totalApiCalls: totalViews,
      activeUsers: Math.floor(totalViews / 10),
      pageViews,
      dailyViews,
    };
  }

  async createMvpGeneration(data: InsertMvpGeneration): Promise<MvpGeneration> {
    const generation: MvpGeneration = {
      id: `mvp_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      idea: data.idea,
      industry: data.industry || null,
      targetAudience: data.targetAudience || null,
      budget: data.budget || null,
      result: data.result,
      timestamp: new Date(),
      ip: data.ip ? data.ip.substring(0, 12) + '***' : null,
      sessionId: data.sessionId || null,
    };
    this.mvpGenerations.push(generation);
    return generation;
  }

  async getMvpGenerations(limit = 100): Promise<MvpGeneration[]> {
    return this.mvpGenerations
      .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0))
      .slice(0, limit);
  }

  async createBlogPost(data: InsertBlogPost): Promise<BlogPost> {
    const post: BlogPost = {
      id: `blog_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt || null,
      content: data.content,
      author: data.author,
      publishedAt: new Date(),
      updatedAt: new Date(),
      featured: data.featured || null,
      metaTitle: data.metaTitle || null,
      metaDescription: data.metaDescription || null,
      keywords: data.keywords || null,
      imageUrl: data.imageUrl || null,
    };
    this.blogPosts.push(post);
    return post;
  }

  async updateBlogPost(id: string, data: Partial<InsertBlogPost>): Promise<BlogPost> {
    const index = this.blogPosts.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Blog post not found');

    this.blogPosts[index] = {
      ...this.blogPosts[index],
      ...data,
      updatedAt: new Date(),
    };
    return this.blogPosts[index];
  }

  async deleteBlogPost(id: string): Promise<void> {
    const index = this.blogPosts.findIndex(p => p.id === id);
    if (index !== -1) {
      this.blogPosts.splice(index, 1);
    }
  }

  async getBlogPosts(limit = 50): Promise<BlogPost[]> {
    return this.blogPosts
      .sort((a, b) => (b.publishedAt?.getTime() || 0) - (a.publishedAt?.getTime() || 0))
      .slice(0, limit);
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    return this.blogPosts.find(p => p.slug === slug);
  }

  async createContact(data: InsertContact): Promise<Contact> {
    const contact: Contact = {
      id: `contact_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      ...data,
      timestamp: new Date(),
      responded: false,
    };
    this.contacts.push(contact);
    return contact;
  }

  async getContacts(limit = 100): Promise<Contact[]> {
    return this.contacts
      .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0))
      .slice(0, limit);
  }

  async markContactResponded(id: string): Promise<void> {
    const contact = this.contacts.find(c => c.id === id);
    if (contact) {
      contact.responded = true;
    }
  }

  async getSetting(key: string): Promise<AdminSetting | undefined> {
    return this.settings.find(s => s.key === key);
  }

  async setSetting(key: string, value: any): Promise<AdminSetting> {
    let setting = this.settings.find(s => s.key === key);

    if (setting) {
      setting.value = value;
      setting.updatedAt = new Date();
    } else {
      setting = {
        id: `setting_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        key,
        value,
        updatedAt: new Date(),
      };
      this.settings.push(setting);
    }
    return setting;
  }

  async getActiveApiKeys(provider: string): Promise<ApiKey[]> {
    return this.apiKeys
      .filter(k => k.provider === provider && k.isActive)
      .sort((a, b) => (a.dailyUsage || 0) - (b.dailyUsage || 0));
  }

  async createApiKey(data: InsertApiKey): Promise<ApiKey> {
    const key: ApiKey = {
      id: `apikey_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      provider: data.provider,
      key: data.key,
      isActive: data.isActive ?? true,
      dailyUsage: data.dailyUsage ?? 0,
      lastReset: new Date(),
      createdAt: new Date(),
    };
    this.apiKeys.push(key);
    return key;
  }

  async toggleApiKey(id: string, isActive: boolean): Promise<ApiKey> {
    const key = this.apiKeys.find(k => k.id === id);
    if (!key) throw new Error('API key not found');

    key.isActive = isActive;
    return key;
  }

  async deleteApiKey(id: string): Promise<void> {
    const index = this.apiKeys.findIndex(k => k.id === id);
    if (index !== -1) {
      this.apiKeys.splice(index, 1);
    }
  }

  async incrementApiUsage(id: string): Promise<void> {
    const key = this.apiKeys.find(k => k.id === id);
    if (key) {
      key.dailyUsage = (key.dailyUsage || 0) + 1;
    }
  }

  async resetDailyUsage(): Promise<void> {
    this.apiKeys.forEach(key => {
      key.dailyUsage = 0;
      key.lastReset = new Date();
    });
  }

  async getAdvertisements(): Promise<Advertisement[]> {
    return this.advertisements;
  }

  async createAdvertisement(data: InsertAdvertisement): Promise<Advertisement> {
    const advertisement: Advertisement = {
      id: `ad_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      name: data.name,
      adCode: data.adCode,
      width: data.width,
      height: data.height,
      position: data.position,
      isActive: data.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.advertisements.push(advertisement);
    return advertisement;
  }

  async updateAdvertisement(id: string, data: Partial<InsertAdvertisement>): Promise<Advertisement> {
    const index = this.advertisements.findIndex(ad => ad.id === id);
    if (index === -1) throw new Error('Advertisement not found');

    this.advertisements[index] = {
      ...this.advertisements[index],
      ...data,
      updatedAt: new Date(),
    };
    return this.advertisements[index];
  }

  async deleteAdvertisement(id: string): Promise<void> {
    const index = this.advertisements.findIndex(ad => ad.id === id);
    if (index !== -1) {
      this.advertisements.splice(index, 1);
    }
  }

  async getAdSettings(): Promise<AdSettings | undefined> {
    return this.adSettings;
  }

  async updateAdSettings(data: InsertAdSettings): Promise<AdSettings> {
    this.adSettings = {
      id: this.adSettings?.id || `adsettings_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      adCount: data.adCount || "3",
      enableAds: data.enableAds ?? true,
      updatedAt: new Date(),
    };
    return this.adSettings;
  }

  async getAutoBlogSettings(): Promise<AutoBlogSettings | undefined> {
    return this.autoBlogSettings;
  }

  async updateAutoBlogSettings(data: Partial<InsertAutoBlogSettings>): Promise<AutoBlogSettings> {
    this.autoBlogSettings = {
      id: this.autoBlogSettings?.id || `autoblogsettings_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      enabled: data.enabled ?? false,
      frequency: data.frequency || "daily",
      dailyPostCount: data.dailyPostCount ?? 1,
      weeklyPostCount: data.weeklyPostCount ?? 1,
      monthlyPostCount: data.monthlyPostCount ?? 1,
      lastRun: data.lastRun || null,
      nextRun: data.nextRun || null,
      topics: data.topics || [],
      affiliateLinks: data.affiliateLinks || null,
      useLatestTrends: data.useLatestTrends ?? true,
      focusOnMyApp: data.focusOnMyApp ?? true,
      createdAt: this.autoBlogSettings?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    return this.autoBlogSettings;
  }

  async createAutoBlogQueueItem(data: InsertAutoBlogQueue): Promise<AutoBlogQueue> {
    const item: AutoBlogQueue = {
      id: `autoblogqueue_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      status: data.status || "pending",
      topic: data.topic,
      generatedContent: data.generatedContent || null,
      publishedPostId: data.publishedPostId || null,
      error: data.error || null,
      createdAt: new Date(),
      processedAt: null,
    };
    this.autoBlogQueue.push(item);
    return item;
  }

  async getAutoBlogQueue(status?: string): Promise<AutoBlogQueue[]> {
    return status
      ? this.autoBlogQueue.filter(item => item.status === status)
      : this.autoBlogQueue;
  }

  async updateAutoBlogQueueStatus(id: string, status: string, data?: any): Promise<void> {
    const item = this.autoBlogQueue.find(item => item.id === id);
    if (item) {
      item.status = status;
      item.processedAt = new Date();
      if (data) {
        if (data.content) item.generatedContent = data.content;
        if (data.postId) item.publishedPostId = data.postId;
        if (data.error) item.error = data.error;
      }
    }
  }

  async getSiteSettings(): Promise<SiteSettings | undefined> {
    return this.siteSettings;
  }

  async updateSiteSettings(data: Partial<InsertSiteSettings>): Promise<SiteSettings> {
    this.siteSettings = {
      id: this.siteSettings?.id || `sitesettings_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      siteName: data.siteName || "MVP Generator AI",
      siteDescription: data.siteDescription || "Generate comprehensive MVP plans using AI",
      contactEmail: data.contactEmail || "admin@mvpgenerator.ai",
      contactPhone: data.contactPhone || null,
      contactAddress: data.contactAddress || null,
      socialLinks: data.socialLinks || null,
      seoSettings: data.seoSettings || null,
      maintenanceMode: data.maintenanceMode ?? false,
      maintenanceMessage: data.maintenanceMessage || null,
      enableRegistration: data.enableRegistration ?? false,
      enableComments: data.enableComments ?? true,
      maxMvpGenerationsPerDay: data.maxMvpGenerationsPerDay ?? 10,
      updatedAt: new Date(),
    };
    return this.siteSettings;
  }
}

// Import db and initialize storage
import { db, initializeDatabase } from "./db";

// Initialize database connection and storage
const database = initializeDatabase();
export const storage: IStorage = database ? new DatabaseStorage(database) : new MemoryStorage();