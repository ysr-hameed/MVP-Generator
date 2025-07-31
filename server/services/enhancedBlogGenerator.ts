import { geminiService } from "./gemini";
import { UnsplashService } from "./unsplashService";
import { getStorage } from "../storage";

export class EnhancedBlogGenerator {
  private readonly currentTopics2025 = [
    "AI-Powered MVP Development: Complete Guide for 2025",
    "No-Code MVP Platforms: Best Options for Non-Technical Founders in 2025",
    "MVP Validation Strategies That Actually Work in 2025",
    "Building SaaS MVPs: From Idea to First Customer in 2025",
    "Mobile-First MVP Development: iOS vs Android vs PWA in 2025",
    "Startup Funding for MVPs: Angel, VC, or Bootstrap in 2025?",
    "MVP Analytics: Essential Metrics Every Founder Should Track",
    "Common MVP Failures and How to Avoid Them in 2025",
    "E-commerce MVP Development: Shopify vs Custom Solutions",
    "API-First MVP Architecture: Building for Scale from Day One",
    "MVP Security Best Practices for Modern Startups",
    "User Testing Your MVP: Tools and Strategies That Work",
    "MVP to Product: When and How to Scale Your Startup",
    "Remote Team MVP Development: Tools for Distributed Success",
    "Green Tech MVPs: Building Sustainable Startups in 2025"
  ];

  async generateComprehensiveBlogPost(
    topic?: string,
    useUnsplashImages = true,
    focusOnMvpGenerator = true
  ): Promise<any> {
    const selectedTopic = topic || this.currentTopics2025[
      Math.floor(Math.random() * this.currentTopics2025.length)
    ];

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });

    // Generate main blog image first
    let featuredImageUrl = '';
    let contentImages: string[] = [];
    
    if (useUnsplashImages) {
      try {
        const imageKeywords = this.extractKeywords(selectedTopic);
        featuredImageUrl = await UnsplashService.getImageUrl(imageKeywords[0], 1200, 600);
        
        // Generate additional images for content sections
        for (let i = 1; i < Math.min(imageKeywords.length, 4); i++) {
          const contentImage = await UnsplashService.getImageUrl(imageKeywords[i], 800, 400);
          contentImages.push(contentImage);
        }
      } catch (error) {
        console.error("Failed to fetch Unsplash images:", error);
        featuredImageUrl = `https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=600&fit=crop`;
      }
    }

    const enhancedPrompt = `
Write a comprehensive, SEO-optimized blog post about "${selectedTopic}" for ${currentMonth} ${currentYear}.

WRITING STYLE:
- Conversational yet professional tone
- Use personal anecdotes and real-world examples
- Include actionable tips and practical advice
- Write for both technical and non-technical readers
- Use storytelling elements to engage readers
- Include relevant statistics and trends from ${currentYear}

STRUCTURE REQUIREMENTS:
1. Compelling headline that includes the year ${currentYear}
2. Engaging introduction that hooks the reader
3. Well-organized sections with clear headings
4. Practical examples and case studies from ${currentYear}
5. Actionable takeaways and next steps
6. Strong conclusion with call-to-action

SEO REQUIREMENTS:
- Include primary keyword "${selectedTopic}" naturally throughout
- Use related keywords and synonyms
- Include long-tail keywords relevant to MVP development
- Add internal linking opportunities
- Write compelling meta description (150-160 characters)

${focusOnMvpGenerator ? `
PRODUCT INTEGRATION:
- Naturally mention how our MVP Generator tool can help readers
- Include specific examples of how the tool addresses pain points discussed
- Add subtle calls-to-action to try the MVP Generator
- Position the tool as a solution to problems mentioned in the article
` : ''}

CONTENT REQUIREMENTS:
- Minimum 2000 words
- Include current ${currentYear} trends and examples
- Reference recent startup success stories
- Include specific tools, frameworks, and technologies popular in ${currentYear}
- Add relevant statistics and market data
- Include expert quotes or insights

OUTPUT FORMAT:
Return a JSON object with the following structure:
{
  "title": "SEO-optimized title including ${currentYear}",
  "slug": "url-friendly-slug",
  "excerpt": "150-word compelling summary",
  "content": "Full blog post content in HTML format with proper headings, paragraphs, lists, and formatting",
  "author": "MVP Generator Team",
  "metaTitle": "SEO title (60 characters max)",
  "metaDescription": "SEO description (150-160 characters)",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "imageUrl": "${featuredImageUrl}",
  "contentImages": ${JSON.stringify(contentImages)},
  "readingTime": "estimated reading time in minutes",
  "category": "MVP Development",
  "tags": ["relevant", "tags", "for", "the", "post"],
  "publishedAt": "${currentDate.toISOString()}",
  "featured": false,
  "internalLinks": [
    {
      "text": "anchor text",
      "url": "/relevant-internal-page",
      "description": "brief description of linked content"
    }
  ],
  "callToActions": [
    {
      "text": "Try our MVP Generator",
      "url": "/mvp-generator",
      "type": "primary"
    }
  ]
}

Focus on providing genuine value to readers while naturally integrating our MVP Generator tool as a helpful solution.
`;

    try {
      const response = await geminiService.generateContent(enhancedPrompt);
      const cleanedResponse = response.replace(/```json\s*|\s*```/g, '').trim();
      const blogPost = JSON.parse(cleanedResponse);
      
      // Enhance the blog post with additional metadata
      return {
        ...blogPost,
        timestamp: new Date(),
        wordCount: this.estimateWordCount(blogPost.content),
        socialShareText: `${blogPost.title} - Essential insights for startup founders in ${currentYear}`,
        seoScore: this.calculateSeoScore(blogPost),
      };
    } catch (error) {
      console.error("Enhanced blog generation failed:", error);
      return this.generateFallbackBlogPost(selectedTopic, featuredImageUrl, currentYear);
    }
  }

  private extractKeywords(topic: string): string[] {
    const keywords = [
      "startup business development",
      "technology innovation",
      "business planning strategy",
      "entrepreneurship success",
      "digital transformation"
    ];
    
    // Extract specific keywords from topic
    const topicKeywords = topic.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(' ')
      .filter(word => word.length > 3)
      .slice(0, 3)
      .join(' ');
    
    return [topicKeywords, ...keywords];
  }

  private estimateWordCount(content: string): number {
    return content.replace(/<[^>]*>/g, '').trim().split(/\s+/).length;
  }

  private calculateSeoScore(blogPost: any): number {
    let score = 0;
    
    // Title optimization
    if (blogPost.title.length >= 30 && blogPost.title.length <= 60) score += 20;
    if (blogPost.title.includes('2025')) score += 10;
    
    // Meta description
    if (blogPost.metaDescription.length >= 150 && blogPost.metaDescription.length <= 160) score += 20;
    
    // Content length
    if (this.estimateWordCount(blogPost.content) >= 2000) score += 20;
    
    // Keywords
    if (blogPost.keywords.length >= 5) score += 15;
    
    // Images
    if (blogPost.imageUrl) score += 10;
    if (blogPost.contentImages.length > 0) score += 5;
    
    return score;
  }

  private generateFallbackBlogPost(topic: string, imageUrl: string, year: number): any {
    const slug = topic.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '-');

    return {
      title: `${topic} - Complete Guide for ${year}`,
      slug,
      excerpt: `Discover everything you need to know about ${topic.toLowerCase()} in ${year}. This comprehensive guide covers best practices, tools, and strategies for startup success.`,
      content: `
        <h1>${topic} - Complete Guide for ${year}</h1>
        
        <p>Starting a business in ${year} requires careful planning and the right approach. This comprehensive guide will walk you through everything you need to know about ${topic.toLowerCase()}.</p>
        
        <h2>Why This Matters in ${year}</h2>
        <p>The startup landscape has evolved significantly, and understanding modern approaches to MVP development is crucial for success.</p>
        
        <h2>Key Strategies for Success</h2>
        <ul>
          <li>Focus on user validation early and often</li>
          <li>Build with modern, scalable technologies</li>
          <li>Implement data-driven decision making</li>
          <li>Plan for iterative development cycles</li>
        </ul>
        
        <h2>Tools and Resources</h2>
        <p>Our MVP Generator tool can help you create a comprehensive plan for your startup idea, complete with technology recommendations, timeline, and budget estimates.</p>
        
        <h2>Next Steps</h2>
        <p>Ready to turn your idea into reality? Start by creating a detailed MVP plan that addresses your specific market and requirements.</p>
      `,
      author: "MVP Generator Team",
      metaTitle: `${topic} Guide ${year}`,
      metaDescription: `Complete guide to ${topic.toLowerCase()} in ${year}. Learn best practices, tools, and strategies for startup success.`,
      keywords: ["mvp development", "startup planning", "business strategy", `${year} trends`, "entrepreneurship"],
      imageUrl: imageUrl || `https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=600&fit=crop`,
      contentImages: [],
      readingTime: "8 minutes",
      category: "MVP Development",
      tags: ["startup", "mvp", "planning", "strategy"],
      publishedAt: new Date().toISOString(),
      featured: false,
      wordCount: 250,
      seoScore: 75
    };
  }

  async generateMultiplePosts(count: number = 3): Promise<any[]> {
    const posts = [];
    const usedTopics = new Set();
    
    for (let i = 0; i < count; i++) {
      let topic;
      do {
        topic = this.currentTopics2025[Math.floor(Math.random() * this.currentTopics2025.length)];
      } while (usedTopics.has(topic) && usedTopics.size < this.currentTopics2025.length);
      
      usedTopics.add(topic);
      
      try {
        const post = await this.generateComprehensiveBlogPost(topic, true, true);
        posts.push(post);
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Failed to generate post for topic: ${topic}`, error);
      }
    }
    
    return posts;
  }
}

export const enhancedBlogGenerator = new EnhancedBlogGenerator();