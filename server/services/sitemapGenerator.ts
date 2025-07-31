import type { DatabaseStorage } from "../storage";

export class SitemapGenerator {
  async generateSitemap(storage: DatabaseStorage): Promise<string> {
    try {
      const baseUrl = process.env.BASE_URL || "https://mvp-generator.replit.app";
      const currentDate = new Date().toISOString();

      // Get all blog posts
      const blogPosts = await storage.getBlogPosts();
      const publishedPosts = blogPosts.filter(post => post.publishedAt !== null);

      // Enhanced static pages with better SEO
      const staticPages = [
        { url: "", changefreq: "hourly", priority: "1.0", lastmod: currentDate },
        { url: "/mvp-generator", changefreq: "hourly", priority: "0.95", lastmod: currentDate },
        { url: "/blog", changefreq: "hourly", priority: "0.9", lastmod: currentDate },
        { url: "/about", changefreq: "weekly", priority: "0.7" },
        { url: "/contact", changefreq: "weekly", priority: "0.6" },
        { url: "/privacy", changefreq: "monthly", priority: "0.4" },
        { url: "/terms", changefreq: "monthly", priority: "0.4" },
      ];

      let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
`;

      // Add static pages
      for (const page of staticPages) {
        const lastmod = page.lastmod || currentDate;
        sitemapXml += `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <mobile:mobile/>
  </url>`;
      }

      // Add blog posts sorted by date (newest first for better crawling)
      const sortedPosts = publishedPosts.sort((a, b) => 
        new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()
      );

      for (const post of sortedPosts) {
        const postDate = post.publishedAt ? new Date(post.publishedAt).toISOString() : currentDate;
        const isRecent = new Date(postDate).getTime() > (Date.now() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
        
        sitemapXml += `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${postDate}</lastmod>
    <changefreq>${isRecent ? 'daily' : 'weekly'}</changefreq>
    <priority>${isRecent ? '0.85' : '0.8'}</priority>
    <mobile:mobile/>`;
        
        // Add image information if available
        if (post.imageUrl) {
          sitemapXml += `
    <image:image>
      <image:loc>${post.imageUrl}</image:loc>
      <image:caption>${post.title.replace(/[<>&"']/g, '')}</image:caption>
      <image:title>${post.title.replace(/[<>&"']/g, '')}</image:title>
    </image:image>`;
        }

        // Add news annotation for recent posts
        if (isRecent) {
          sitemapXml += `
    <news:news>
      <news:publication>
        <news:name>MVP Generator AI Blog</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${postDate}</news:publication_date>
      <news:title>${post.title.replace(/[<>&"']/g, '')}</news:title>
    </news:news>`;
        }
        
        sitemapXml += `
  </url>`;
      }

      sitemapXml += `
</urlset>`;

      return sitemapXml;
    } catch (error) {
      console.error("Error generating sitemap:", error);
      // Return basic sitemap if there's an error
      const baseUrl = process.env.BASE_URL || "https://mvp-generator.replit.app";
      const currentDate = new Date().toISOString();
      
      return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;
    }
  }

  async generateSitemapIndex(storage: DatabaseStorage): Promise<string> {
    try {
      const baseUrl = process.env.BASE_URL || "https://mvp-generator.replit.app";
      const currentDate = new Date().toISOString();

      // For larger sites, you might want to split sitemaps
      // For now, we'll just reference the main sitemap
      const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
</sitemapindex>`;

      return sitemapIndex;
    } catch (error) {
      console.error("Error generating sitemap index:", error);
      return "";
    }
  }

  async submitToSearchEngines(sitemapUrl: string): Promise<void> {
    try {
      // Submit to Google
      const googleUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
      try {
        const response = await fetch(googleUrl);
        if (response.ok) {
          console.log("✓ Sitemap submitted to Google");
        }
      } catch (error) {
        console.log("Google sitemap submission failed:", error);
      }

      // Submit to Bing
      const bingUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
      try {
        const response = await fetch(bingUrl);
        if (response.ok) {
          console.log("✓ Sitemap submitted to Bing");
        }
      } catch (error) {
        console.log("Bing sitemap submission failed:", error);
      }

      // Submit via IndexNow if configured
      try {
        const response = await fetch('/api/indexnow/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: sitemapUrl })
        });
        if (response.ok) {
          console.log("✓ Sitemap submitted via IndexNow");
        }
      } catch (error) {
        console.log("IndexNow sitemap submission failed:", error);
      }

    } catch (error) {
      console.error("Error submitting sitemap to search engines:", error);
    }
  }
}