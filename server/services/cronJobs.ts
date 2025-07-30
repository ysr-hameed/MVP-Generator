import { autoBlogService } from "./autoBlog";
import { storage } from "../storage";

class CronJobService {
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private isRunning = false;

  start() {
    if (this.isRunning) return;

    console.log("Starting cron job service...");
    this.isRunning = true;

    // Check for auto-blog tasks every 30 minutes
    const autoBlogInterval = setInterval(async () => {
      try {
        await this.checkAutoBlogTasks();
      } catch (error) {
        console.error("Auto-blog cron error:", error);
      }
    }, 30 * 60 * 1000); // 30 minutes

    // Process auto-blog queue every 5 minutes
    const queueInterval = setInterval(async () => {
      try {
        await autoBlogService.processQueue();
      } catch (error) {
        console.error("Auto-blog queue processing error:", error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    this.intervals.set("autoBlog", autoBlogInterval);
    this.intervals.set("queue", queueInterval);

    // Initial check
    setTimeout(() => {
      this.checkAutoBlogTasks();
    }, 5000); // Wait 5 seconds after startup
  }

  stop() {
    console.log("Stopping cron job service...");
    this.intervals.forEach((interval) => {
      clearInterval(interval);
    });
    this.intervals.clear();
    this.isRunning = false;
  }

  private async checkAutoBlogTasks() {
    try {
      const shouldRun = await autoBlogService.shouldRun();

      if (shouldRun) {
        console.log("Auto-blog scheduled run triggered");

        // Generate and publish blog posts immediately (not just queue)
        const settings = await storage.getAutoBlogSettings();
        if (settings?.enabled) {
          let postsToGenerate = 1;
          
          if (settings.frequency.startsWith('daily')) {
            postsToGenerate = settings.dailyPostCount || 1;
          } else if (settings.frequency.startsWith('weekly')) {
            postsToGenerate = settings.weeklyPostCount || 1;
          } else if (settings.frequency.startsWith('monthly')) {
            postsToGenerate = settings.monthlyPostCount || 1;
          }

          // Generate posts immediately
          for (let i = 0; i < postsToGenerate; i++) {
            try {
              const topic = await autoBlogService.getRandomTopic(
                settings.useLatestTrends ?? true,
                settings.focusOnMyApp ?? true
              );

              const affiliateLinks = settings.affiliateLinks ? 
                Array.isArray(settings.affiliateLinks) ? settings.affiliateLinks : [] : [];
              
              const content = await autoBlogService.generateHumanizedBlogPost(
                topic,
                affiliateLinks,
                settings.useLatestTrends ?? true,
                settings.focusOnMyApp ?? true
              );

              // Create slug from title
              const slug = content.title
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/--+/g, '-')
                .trim();

              // Save as blog post
              await storage.createBlogPost({
                title: content.title,
                slug: slug + `-${Date.now()}`,
                excerpt: content.excerpt,
                content: content.content,
                author: content.author,
                metaTitle: content.metaTitle,
                metaDescription: content.metaDescription,
                keywords: content.keywords,
                featured: false
              });

              console.log(`Auto-generated and published: ${content.title}`);
            } catch (error) {
              console.error(`Failed to generate scheduled blog post ${i + 1}:`, error);
            }
          }
        }

        // Schedule next run
        await autoBlogService.scheduleNextRun();

        console.log("Auto-blog task completed, next run scheduled");
      }
    } catch (error) {
      console.error("Error in auto-blog task:", error);
    }
  }

  // Manual trigger for testing
  async triggerAutoBlog() {
    console.log("Manually triggering auto-blog generation...");
    await autoBlogService.queueRandomPost();
    await autoBlogService.processQueue();
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      activeJobs: Array.from(this.intervals.keys()),
      startTime: this.isRunning ? new Date().toISOString() : null,
    };
  }
}

export const cronJobService = new CronJobService();