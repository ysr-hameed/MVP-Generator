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

        // Queue a random blog post
        await autoBlogService.queueRandomPost();

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