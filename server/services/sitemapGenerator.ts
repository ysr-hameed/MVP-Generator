typescript
import { getStorage } from "../storage";

export class SitemapGenerator {
  private static readonly BASE_URL = process.env.SITE_URL || 'https://your-domain.com';

  static async generateSitemap(): Promise<string> {
    try {
      const storage = getStorage();
      const blogs = await storage.getAllBlogs();

      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" 
        xmlns:xhtml="http://www.w3.org/1999/xhtml" 
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0" 
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" 
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">`;

      // Add main pages with proper SEO structure
      const staticPages = [
        { url: '/', priority: '1.0', changefreq: 'daily', title: 'MVP Generator AI - Create Business Plans with AI' },
        { url: '/mvp-generator', priority: '0.9', changefreq: 'weekly', title: 'AI MVP Generator - Business Plan Creator' },
        { url: '/blog', priority: '0.8', changefreq: 'daily', title: 'Business & Startup Blog - MVP Generator' },
        { url: '/about', priority: '0.7', changefreq: 'monthly', title: 'About MVP Generator AI' },
        { url: '/contact', priority: '0.6', changefreq: 'monthly', title: 'Contact MVP Generator AI' }
      ];

      const baseUrl = process.env.SITE_URL || process.env.REPL_URL || 'https://mvp-generator-ai.replit.app';

      staticPages.forEach(page => {
        sitemap += `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
      });

      // Add blog posts with enhanced metadata
      if (blogs && blogs.length > 0) {
        blogs.forEach((blog: any) => {
          const slug = blog.slug || blog.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          sitemap += `
  <url>
    <loc>${baseUrl}/blog/${slug}</loc>
    <lastmod>${new Date(blog.updatedAt || blog.createdAt).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <news:news>
      <news:publication>
        <news:name>MVP Generator AI Blog</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${new Date(blog.createdAt).toISOString().split('T')[0]}</news:publication_date>
      <news:title>${blog.title}</news:title>
    </news:news>
  </url>`;
        });
      }

      sitemap += `
</urlset>`;

      console.log(`✓ Generated sitemap with ${staticPages.length + (blogs?.length || 0)} URLs`);
      return sitemap;
    } catch (error) {
      console.error('Error generating sitemap:', error);
      const baseUrl = process.env.SITE_URL || process.env.REPL_URL || 'https://mvp-generator-ai.replit.app';
      return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
    }
  }

  private static generateBasicSitemap(): string {
    const currentDate = new Date().toISOString().split('T')[0];

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${this.BASE_URL}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${this.BASE_URL}/mvp-generator</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${this.BASE_URL}/blog</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${this.BASE_URL}/about</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${this.BASE_URL}/contact</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>`;
  }

  private static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private static escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private static extractKeywords(content: string): string[] {
    // Extract meaningful keywords from content
    const words = content
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !this.isStopWord(word));

    // Count frequency and return top keywords
    const wordCount = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  private static isStopWord(word: string): boolean {
    const stopWords = [
      'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 
      'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his',
      'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy',
      'did', 'man', 'oil', 'sit', 'use', 'way', 'this', 'that', 'with', 'have'
    ];
    return stopWords.includes(word);
  }

  private static extractImages(content: string): Array<{url: string, caption?: string}> {
    const images: Array<{url: string, caption?: string}> = [];

    // Extract markdown images
    const markdownImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let match;
    while ((match = markdownImageRegex.exec(content)) !== null) {
      images.push({
        url: match[2],
        caption: match[1] || undefined
      });
    }

    // Extract HTML images
    const htmlImageRegex = /<img[^>]+src=['"](([^'"]+))['"]/g;
    while ((match = htmlImageRegex.exec(content)) !== null) {
      if (!images.some(img => img.url === match[1])) {
        images.push({
          url: match[1]
        });
      }
    }

    return images;
  }

  static async generateRobotsTxt(): Promise<string> {
    return `User-agent: *
Allow: /

# Sitemap
Sitemap: ${this.BASE_URL}/sitemap.xml

# Crawl-delay for bots
Crawl-delay: 1

# Block admin areas
Disallow: /admin/
Disallow: /api/admin/

# Allow important pages
Allow: /blog/
Allow: /mvp-generator/
Allow: /about/
Allow: /contact/`;
  }

  static async submitToSearchEngines(): Promise<void> {
    try {
      const sitemapUrl = `${this.BASE_URL}/sitemap.xml`;

      // Submit to Google
      try {
        const googleResponse = await fetch(
          `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`
        );
        console.log('✓ Sitemap submitted to Google:', googleResponse.status === 200 ? 'Success' : 'Failed');
      } catch (error) {
        console.log('⚠️ Failed to submit to Google:', error);
      }

      // Submit to Bing
      try {
        const bingResponse = await fetch(
          `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`
        );
        console.log('✓ Sitemap submitted to Bing:', bingResponse.status === 200 ? 'Success' : 'Failed');
      } catch (error) {
        console.log('⚠️ Failed to submit to Bing:', error);
      }

    } catch (error) {
      console.error('Failed to submit sitemap to search engines:', error);
    }
  }
}