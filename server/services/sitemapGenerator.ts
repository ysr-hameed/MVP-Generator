
import { getStorage } from "../storage";

export class SitemapGenerator {
  static async generateSitemap(): Promise<string> {
    const storage = await getStorage();
    const baseUrl = process.env.SITE_URL || 'https://mvp-generator-ai.com';
    
    // Get all published blog posts
    const blogPosts = await storage.getAllBlogPosts();
    
    // Static pages
    const staticPages = [
      { url: '/', changefreq: 'daily', priority: '1.0' },
      { url: '/mvp-generator', changefreq: 'weekly', priority: '0.9' },
      { url: '/blog', changefreq: 'daily', priority: '0.8' },
      { url: '/about', changefreq: 'monthly', priority: '0.6' },
      { url: '/contact', changefreq: 'monthly', priority: '0.5' },
    ];

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
`;

    // Add static pages
    staticPages.forEach(page => {
      sitemap += `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    });

    // Add blog posts
    blogPosts.forEach(post => {
      const lastmod = post.updatedAt ? new Date(post.updatedAt).toISOString() : new Date(post.publishedAt || post.createdAt).toISOString();
      
      sitemap += `  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>`;
      
      // Add image information if available
      if (post.imageUrl) {
        sitemap += `
    <image:image>
      <image:loc>${post.imageUrl}</image:loc>
      <image:title>${post.title}</image:title>
      <image:caption>${post.excerpt || ''}</image:caption>
    </image:image>`;
      }
      
      sitemap += `
  </url>
`;
    });

    sitemap += `</urlset>`;
    
    return sitemap;
  }

  static async generateRobotsTxt(): Promise<string> {
    const baseUrl = process.env.SITE_URL || 'https://mvp-generator-ai.com';
    
    return `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1

# Disallow admin areas
Disallow: /admin
Disallow: /api
Disallow: /*.json$
Disallow: /*?*

# Allow important static assets
Allow: /assets/
Allow: /*.css
Allow: /*.js
Allow: /*.png
Allow: /*.jpg
Allow: /*.jpeg
Allow: /*.gif
Allow: /*.svg
Allow: /*.webp
`;
  }
}
