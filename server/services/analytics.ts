import { storage } from "../storage";
import { type InsertAnalytics } from "@shared/schema";

export class AnalyticsService {
  async trackPageView(
    page: string,
    userAgent?: string,
    ip?: string,
    sessionId?: string,
    referrer?: string,
    metadata?: any
  ) {
    try {
      const analyticsData: InsertAnalytics = {
        page,
        userAgent,
        ip,
        sessionId,
        referrer,
        metadata,
      };

      await storage.logPageView(analyticsData);
    } catch (error) {
      console.error("Failed to track page view:", error);
      // Don't throw error to avoid breaking user experience
    }
  }

  async getAnalyticsSummary() {
    try {
      return await storage.getAnalyticsSummary();
    } catch (error) {
      console.error("Failed to get analytics summary:", error);
      return {
        totalViews: 0,
        totalMvpGenerated: 0,
        totalApiCalls: 0,
        activeUsers: 0,
      };
    }
  }

  async getDetailedAnalytics(days = 30) {
    try {
      const analytics = await storage.getAnalytics(days);
      
      // Group by page
      const pageViews = analytics.reduce((acc, item) => {
        acc[item.page] = (acc[item.page] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Group by date
      const dailyViews = analytics.reduce((acc, item) => {
        const date = item.timestamp?.toISOString().split('T')[0] || 'unknown';
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        pageViews,
        dailyViews,
        totalViews: analytics.length,
      };
    } catch (error) {
      console.error("Failed to get detailed analytics:", error);
      return {
        pageViews: {},
        dailyViews: {},
        totalViews: 0,
      };
    }
  }
}

export const analyticsService = new AnalyticsService();
