import { geminiService } from "./gemini";
import { storage } from "../storage";

export class AutoBlogService {
  private readonly mvpTopics2025 = [
    "MVP Development Trends in 2025: What's Changed",
    "AI-First MVP Development: Building Smarter Startups in 2025",
    "No-Code vs Low-Code MVP Development in 2025",
    "How to Validate Your Startup Idea Before Building in 2025",
    "Budget-Friendly MVP Development: Maximum Impact, Minimum Cost for 2025",
    "Common MVP Mistakes That Kill Startups in 2025",
    "From Idea to Launch: A Complete MVP Roadmap for 2025",
    "Choosing the Right Technology Stack for Your MVP in 2025",
    "User Feedback: The Secret to MVP Success in the AI Era",
    "MVP vs Full Product: When to Scale Up in 2025",
    "Building an MVP in 30 Days: 2025 Edition",
    "The Psychology of MVP Success: User-Centric Development",
    "Remote Team MVP Development: Tools and Strategies for 2025",
    "MVP Analytics: Metrics That Actually Matter in 2025",
    "Converting MVP Users to Paying Customers: 2025 Strategies",
    "Agile MVP Development: Iterating for Success",
    "Voice-First MVP Development: The Next Big Thing in 2025",
    "Sustainable MVP Development: Green Tech Startups in 2025",
    "Blockchain MVP Development: Opportunities in 2025",
    "MVP Security Best Practices for 2025"
  ];

  private readonly trendingTopics2025 = [
    "AI Agent Development for Startups in 2025",
    "Voice AI Integration in Modern MVPs",
    "Sustainable Tech Startups: Building Green MVPs in 2025",
    "Blockchain Integration for MVP Development",
    "AR/VR MVP Development: The Future is Now",
    "FinTech MVP Development: 2025 Regulatory Landscape",
    "HealthTech MVPs: Navigating 2025 Compliance",
    "EdTech Innovation: Building Educational MVPs in 2025",
    "E-commerce MVP Development: 2025 Trends and Tools",
    "SaaS MVP Development: Best Practices for 2025",
    "Mobile-First MVP Development for Gen Z in 2025",
    "API-First Architecture for Modern MVPs",
    "Microservices vs Monolith: MVP Architecture in 2025",
    "Developer Experience: Building MVPs That Scale in 2025",
    "MVP Testing Strategies: Automation and AI in 2025"
  ];

  private readonly humanizationPrompts = [
    "Write in a conversational, approachable tone like you're mentoring a friend",
    "Include personal anecdotes and real-world examples",
    "Use contractions and casual language while maintaining professionalism",
    "Add rhetorical questions to engage readers",
    "Include emotional elements and storytelling",
    "Use varied sentence structures and paragraph lengths",
    "Include practical tips and actionable advice",
    "Add humor where appropriate but keep it professional"
  ];

  async generateHumanizedBlogPost(topic: string, affiliateLinks?: any[], useLatestTrends = true, focusOnMyApp = true): Promise<any> {
    const humanizationInstruction = this.humanizationPrompts[
      Math.floor(Math.random() * this.humanizationPrompts.length)
    ];

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });

    const prompt = `Write a comprehensive, engaging blog post about "${topic}" for an MVP generator platform.

${humanizationInstruction}

CURRENT CONTEXT (${currentMonth} ${currentYear}):
- Always use current year (${currentYear}) in dates and examples
- Reference latest trends and technologies as of ${currentMonth} ${currentYear}
- Use recent examples and case studies from ${currentYear}
${useLatestTrends ? `- Focus on cutting-edge trends like AI agents, voice AI, sustainable tech, and modern development practices` : ''}
${focusOnMyApp ? `- Naturally mention how MVP Generator AI can help readers implement these strategies` : ''}

IMPORTANT REQUIREMENTS:
- Write like a human expert, not an AI
- Use natural language patterns and varied vocabulary
- Include specific examples and case studies from ${currentYear}
- Add personal insights and opinions
- Use transition words naturally
- Vary sentence lengths and structures
- Include subheadings for better readability
- Write 1500-2000 words
- Add a compelling introduction and conclusion
- Include actionable takeaways
- Always reference current year (${currentYear}) and latest trends

${affiliateLinks?.length ? `
AFFILIATE INTEGRATION:
Naturally integrate these affiliate links where relevant:
${affiliateLinks.map(link => `- ${link.text}: ${link.url}`).join('\n')}
` : ''}

Focus on providing genuine value to entrepreneurs and startup founders. Make it feel like it was written by someone with real experience in the startup world in ${currentYear}.

Return the content in this JSON format:
{
  "title": "SEO-optimized title with ${currentYear}",
  "slug": "url-friendly-slug",
  "excerpt": "Compelling 2-sentence excerpt mentioning ${currentYear}",
  "content": "Full blog post content in markdown with current examples",
  "metaTitle": "SEO meta title (under 60 chars) with ${currentYear}",
  "metaDescription": "SEO meta description (under 160 chars) with ${currentYear}",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "author": "MVP Generator AI Team"
}`;

    try {
      const response = await geminiService.generateContent(prompt);

      // Parse the JSON response
      const content = JSON.parse(response);

      // Add additional humanization touches
      content.content = this.addHumanTouches(content.content, affiliateLinks);

      return content;
    } catch (error) {
      console.error("Auto blog generation error:", error);
      throw new Error("Failed to generate humanized blog content");
    }
  }

  private addHumanTouches(content: string, affiliateLinks?: any[]): string {
    let humanizedContent = content;

    // Add random human touches
    const touches = [
      "Trust me, I've been there.",
      "Here's what I've learned from experience:",
      "Let me share a quick story:",
      "I can't stress this enough:",
      "Here's the thing nobody tells you:",
      "From my perspective,",
      "In my experience,",
      "Here's a pro tip:",
      "Let's be honest:",
      "The reality is:"
    ];

    // Randomly insert human touches (sparingly)
    const sentences = humanizedContent.split('. ');
    const touchesToAdd = Math.floor(sentences.length * 0.1); // 10% of sentences

    for (let i = 0; i < touchesToAdd; i++) {
      const randomIndex = Math.floor(Math.random() * sentences.length);
      const randomTouch = touches[Math.floor(Math.random() * touches.length)];

      if (sentences[randomIndex] && !sentences[randomIndex].includes(randomTouch)) {
        sentences[randomIndex] = `${randomTouch} ${sentences[randomIndex]}`;
      }
    }

    humanizedContent = sentences.join('. ');

    // Add affiliate links naturally if provided
    if (affiliateLinks?.length) {
      affiliateLinks.forEach(link => {
        const placements = [
          `\n\n*Recommended: [${link.text}](${link.url}) - This has been incredibly helpful for our team.*\n\n`,
          `\n\n> **Pro Tip**: Check out [${link.text}](${link.url}) for advanced features.\n\n`,
          `\n\nI highly recommend [${link.text}](${link.url}) for this purpose.\n\n`
        ];

        const randomPlacement = placements[Math.floor(Math.random() * placements.length)];

        // Insert at a random position in the content
        const contentSections = humanizedContent.split('\n\n');
        const insertIndex = Math.floor(contentSections.length * 0.6); // Insert in latter half
        contentSections.splice(insertIndex, 0, randomPlacement);
        humanizedContent = contentSections.join('\n\n');
      });
    }

    return humanizedContent;
  }

  async getRandomTopic(useLatestTrends = true, focusOnMyApp = true): Promise<string> {
    const allTopics = [...this.mvpTopics2025];
    
    if (useLatestTrends) {
      allTopics.push(...this.trendingTopics2025);
    }
    
    return allTopics[Math.floor(Math.random() * allTopics.length)];
  }

  async processQueue(): Promise<void> {
    try {
      const settings = await storage.getAutoBlogSettings();
      if (!settings?.enabled) {
        return;
      }

      const pendingItems = await storage.getAutoBlogQueue("pending");
      
      for (const item of pendingItems.slice(0, 3)) { // Process max 3 at a time
        try {
          await storage.updateAutoBlogQueueStatus(item.id, "processing");
          
          const affiliateLinks = settings.affiliateLinks ? 
            Array.isArray(settings.affiliateLinks) ? settings.affiliateLinks : [] : [];
          
          const content = await this.generateHumanizedBlogPost(
            item.topic,
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

          await storage.updateAutoBlogQueueStatus(item.id, "completed", {
            content: content,
            postId: blogPost.id
          });

          console.log(`Auto-generated blog post: ${content.title}`);
          
        } catch (error) {
          console.error(`Failed to process blog item ${item.id}:`, error);
          await storage.updateAutoBlogQueueStatus(item.id, "failed", {
            error: error instanceof Error ? error.message : "Unknown error"
          });
        }
      }
    } catch (error) {
      console.error("Auto blog processing error:", error);
    }
  }

  async scheduleNextRun(): Promise<void> {
    try {
      const settings = await storage.getAutoBlogSettings();
      if (!settings?.enabled) {
        return;
      }

      const now = new Date();
      let postsToSchedule = 0;

      // Determine how many posts to schedule based on frequency
      if (settings.frequency.startsWith('daily')) {
        postsToSchedule = settings.dailyPostCount || 1;
      } else if (settings.frequency.startsWith('weekly')) {
        // Only schedule on specific days for weekly
        const dayOfWeek = now.getDay();
        if (dayOfWeek === 1) { // Monday
          postsToSchedule = settings.weeklyPostCount || 1;
        }
      } else if (settings.frequency.startsWith('monthly')) {
        // Only schedule on first day of month
        const dayOfMonth = now.getDate();
        if (dayOfMonth === 1) {
          postsToSchedule = settings.monthlyPostCount || 1;
        }
      }

      // Schedule the posts
      for (let i = 0; i < postsToSchedule; i++) {
        const topic = await this.getRandomTopic(
          settings.useLatestTrends ?? true,
          settings.focusOnMyApp ?? true
        );
        
        await storage.createAutoBlogQueueItem({
          topic,
          status: "pending"
        });
      }

      // Update last run time
      await storage.updateAutoBlogSettings({
        lastRun: now,
        nextRun: this.calculateNextRun(settings.frequency, now)
      });

      if (postsToSchedule > 0) {
        console.log(`Scheduled ${postsToSchedule} new blog posts for generation`);
      }
    } catch (error) {
      console.error("Auto blog scheduling error:", error);
    }
  }

  private calculateNextRun(frequency: string, from: Date): Date {
    const next = new Date(from);
    
    if (frequency.startsWith('daily')) {
      next.setDate(next.getDate() + 1);
    } else if (frequency.startsWith('weekly')) {
      next.setDate(next.getDate() + 7);
    } else if (frequency.startsWith('monthly')) {
      next.setMonth(next.getMonth() + 1);
    }
    
    return next;
  }



  async scheduleNextRun(): Promise<void> {
    try {
      const settings = await storage.getAutoBlogSettings();
      if (!settings || !settings.enabled) return;

      const now = new Date();
      let nextRun = new Date(now);

      switch (settings.frequency) {
        case "daily":
          nextRun.setDate(now.getDate() + 1);
          break;
        case "weekly":
          nextRun.setDate(now.getDate() + 7);
          break;
        case "monthly":
          nextRun.setMonth(now.getMonth() + 1);
          break;
      }

      await storage.updateAutoBlogSettings({
        nextRun,
        lastRun: now,
      });

      console.log(`Next auto-blog run scheduled for: ${nextRun.toISOString()}`);
    } catch (error) {
      console.error("Error scheduling next auto-blog run:", error);
    }
  }

  async shouldRun(): Promise<boolean> {
    const settings = await storage.getAutoBlogSettings();
    if (!settings?.enabled) return false;

    const now = new Date();
    const nextRun = settings.nextRun ? new Date(settings.nextRun) : new Date(0);

    return now >= nextRun;
  }

  async queueRandomPost(): Promise<void> {
    const topic = await this.getRandomTopic();
    await storage.createAutoBlogQueueItem({
      topic,
      status: "pending"
    });
    console.log(`Queued new blog post: ${topic}`);
  }
}

export const autoBlogService = new AutoBlogService();