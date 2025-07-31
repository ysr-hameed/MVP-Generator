import type { Express } from "express";
import { getStorage } from "../storage";
import { SitemapGenerator } from "../services/sitemapGenerator";

export function registerSeoRoutes(app: Express) {
  // IndexNow submission endpoint
  app.post("/api/indexnow/submit", async (req, res) => {
    try {
      const { url, key } = req.body;
      
      if (!url || !key) {
        return res.status(400).json({ message: "URL and key are required" });
      }

      // Submit to IndexNow API
      const indexNowResponse = await fetch(`https://api.indexnow.org/IndexNow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'MVP-Generator-IndexNow/1.0'
        },
        body: JSON.stringify({
          host: new URL(url).hostname,
          key: key,
          keyLocation: `${new URL(url).origin}/${key}.txt`,
          urlList: [url]
        })
      });

      if (indexNowResponse.ok) {
        console.log(`✓ Successfully submitted ${url} to IndexNow`);
        res.json({ success: true, message: "URL submitted to IndexNow" });
      } else {
        const errorText = await indexNowResponse.text();
        console.log(`⚠️ IndexNow submission failed: ${errorText}`);
        res.status(500).json({ success: false, message: "IndexNow submission failed" });
      }
    } catch (error) {
      console.error("IndexNow submission error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // Generate and serve sitemap
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const storage = await getStorage();
      const sitemapGenerator = new SitemapGenerator();
      const sitemap = await sitemapGenerator.generateSitemap(storage);
      
      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
      res.send(sitemap);
    } catch (error) {
      console.error("Sitemap generation error:", error);
      res.status(500).send("Error generating sitemap");
    }
  });

  // Generate robots.txt
  app.get("/robots.txt", async (req, res) => {
    try {
      const storage = await getStorage();
      const siteSettings = await storage.getSiteSettings();
      const baseUrl = req.protocol + '://' + req.get('host');
      
      const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
${siteSettings?.maintenanceMode ? 'Disallow: /' : ''}

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1
`;

      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
      res.send(robotsTxt);
    } catch (error) {
      console.error("Robots.txt generation error:", error);
      res.status(500).send("Error generating robots.txt");
    }
  });

  // Site settings endpoint (for IndexNow key and other SEO settings)
  app.get("/api/site-settings", async (req, res) => {
    try {
      const storage = await getStorage();
      const settings = await storage.getSiteSettings();
      
      // Return public settings only
      const publicSettings = {
        siteName: settings?.siteName || "MVP Generator AI",
        siteDescription: settings?.siteDescription || "Generate comprehensive MVP plans using AI",
        indexNowKey: settings?.seoSettings?.indexNowKey || null,
        googleSiteVerification: settings?.seoSettings?.googleSiteVerification || null,
        bingSiteVerification: settings?.seoSettings?.bingSiteVerification || null,
      };
      
      res.json(publicSettings);
    } catch (error) {
      console.error("Site settings fetch error:", error);
      res.status(500).json({ message: "Failed to fetch site settings" });
    }
  });

  // Submit URL for immediate indexing
  app.post("/api/seo/submit-url", async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ message: "URL is required" });
      }

      const storage = await getStorage();
      const settings = await storage.getSiteSettings();
      const indexNowKey = settings?.seoSettings?.indexNowKey;
      
      if (!indexNowKey) {
        return res.status(400).json({ message: "IndexNow key not configured" });
      }

      // Submit to IndexNow
      const indexNowResponse = await fetch(`https://api.indexnow.org/IndexNow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'MVP-Generator-SEO/1.0'
        },
        body: JSON.stringify({
          host: new URL(url).hostname,
          key: indexNowKey,
          keyLocation: `${new URL(url).origin}/${indexNowKey}.txt`,
          urlList: [url]
        })
      });

      if (indexNowResponse.ok) {
        // Also submit to Google Search Console if configured
        // This would require Google Search Console API setup
        
        res.json({ 
          success: true, 
          message: "URL submitted for indexing",
          services: ["IndexNow"]
        });
      } else {
        res.status(500).json({ success: false, message: "Indexing submission failed" });
      }
    } catch (error) {
      console.error("SEO URL submission error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
}