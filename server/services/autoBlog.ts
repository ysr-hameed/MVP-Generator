
import { geminiService } from "./gemini";
import { storage } from "../storage";

export class AutoBlogService {
  private readonly mvpTopics = [
    "Essential MVP Development Strategies for 2024",
    "How to Validate Your Startup Idea Before Building",
    "Budget-Friendly MVP Development: Maximum Impact, Minimum Cost",
    "Common MVP Mistakes That Kill Startups",
    "From Idea to Launch: A Complete MVP Roadmap",
    "Choosing the Right Technology Stack for Your MVP",
    "User Feedback: The Secret to MVP Success",
    "MVP vs Full Product: When to Scale Up",
    "Building an MVP in 30 Days: Is It Possible?",
    "The Psychology of MVP Success: User-Centric Development",
    "Remote Team MVP Development: Tools and Strategies",
    "MVP Analytics: Metrics That Actually Matter",
    "Converting MVP Users to Paying Customers",
    "Agile MVP Development: Iterating for Success",
    "AI-Powered MVP Development: The Future is Here"
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

  async generateHumanizedBlogPost(topic: string, affiliateLinks?: any[]): Promise<any> {
    const humanizationInstruction = this.humanizationPrompts[
      Math.floor(Math.random() * this.humanizationPrompts.length)
    ];

    const prompt = `Write a comprehensive, engaging blog post about "${topic}" for an MVP generator platform.

${humanizationInstruction}

IMPORTANT REQUIREMENTS:
- Write like a human expert, not an AI
- Use natural language patterns and varied vocabulary
- Include specific examples and case studies
- Add personal insights and opinions
- Use transition words naturally
- Vary sentence lengths and structures
- Include subheadings for better readability
- Write 1500-2000 words
- Add a compelling introduction and conclusion
- Include actionable takeaways

${affiliateLinks?.length ? `
AFFILIATE INTEGRATION:
Naturally integrate these affiliate links where relevant:
${affiliateLinks.map(link => `- ${link.text}: ${link.url}`).join('\n')}
` : ''}

Focus on providing genuine value to entrepreneurs and startup founders. Make it feel like it was written by someone with real experience in the startup world.

Return the content in this JSON format:
{
  "title": "SEO-optimized title",
  "slug": "url-friendly-slug",
  "excerpt": "Compelling 2-sentence excerpt",
  "content": "Full blog post content in markdown",
  "metaTitle": "SEO meta title (under 60 chars)",
  "metaDescription": "SEO meta description (under 160 chars)",
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

  async getRandomTopic(): Promise<string> {
    return this.mvpTopics[Math.floor(Math.random() * this.mvpTopics.length)];
  }

  async processQueue(): Promise<void> {
    console.log("Processing auto-blog queue...");
    
    const pendingItems = await storage.getAutoBlogQueue("pending");
    
    for (const item of pendingItems) {
      try {
        await storage.updateAutoBlogQueueStatus(item.id, "processing");
        
        // Get auto-blog settings for affiliate links
        const settings = await storage.getAutoBlogSettings();
        const affiliateLinks = settings?.affiliateLinks as any[] || [];
        
        console.log(`Generating blog post for topic: ${item.topic}`);
        
        const blogContent = await this.generateHumanizedBlogPost(item.topic, affiliateLinks);
        
        // Create the blog post
        const post = await storage.createBlogPost({
          ...blogContent,
          featured: Math.random() > 0.7, // 30% chance of being featured
        });
        
        await storage.updateAutoBlogQueueStatus(item.id, "completed", {
          content: blogContent,
          postId: post.id
        });
        
        console.log(`Successfully generated and published blog post: ${post.title}`);
        
        // Add a small delay between generations
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`Failed to process queue item ${item.id}:`, error);
        await storage.updateAutoBlogQueueStatus(item.id, "failed", {
          error: error.message
        });
      }
    }
  }

  async scheduleNextRun(): Promise<void> {
    const settings = await storage.getAutoBlogSettings();
    if (!settings?.enabled) return;

    const now = new Date();
    let nextRun = new Date(now);

    switch (settings.frequency) {
      case "daily":
        nextRun.setDate(nextRun.getDate() + 1);
        break;
      case "weekly":
        nextRun.setDate(nextRun.getDate() + 7);
        break;
      case "monthly":
        nextRun.setMonth(nextRun.getMonth() + 1);
        break;
    }

    await storage.updateAutoBlogSettings({
      lastRun: now,
      nextRun: nextRun
    });
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
