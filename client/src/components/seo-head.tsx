
import { useEffect } from "react";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonical?: string;
  structuredData?: object;
  noindex?: boolean;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  articleTags?: string[];
  lang?: string;
}

export default function SEOHead({
  title = "MVP Generator AI - Transform Ideas into Startup Plans",
  description = "AI-powered tool that transforms startup ideas into comprehensive MVP plans with tech stacks, features, and roadmaps.",
  keywords = "MVP, startup, business plan, AI generator, tech stack, entrepreneur",
  ogTitle,
  ogDescription,
  ogImage = "/og-image.jpg",
  twitterTitle,
  twitterDescription, 
  twitterImage,
  canonical,
  structuredData,
  noindex = false,
  author = "MVP Generator AI Team",
  publishedTime,
  modifiedTime,
  articleTags = [],
  lang = "en"
}: SEOHeadProps) {
  useEffect(() => {
    // Set document title
    document.title = title;
    
    // Set language
    document.documentElement.lang = lang;

    // Helper function to set meta tag
    const setMetaTag = (name: string, content: string, property?: boolean) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement("meta");
        if (property) {
          meta.setAttribute("property", name);
        } else {
          meta.setAttribute("name", name);
        }
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Basic meta tags
    setMetaTag("description", description);
    setMetaTag("keywords", keywords);
    setMetaTag("author", author);
    setMetaTag("robots", noindex ? "noindex, nofollow" : "index, follow");
    setMetaTag("viewport", "width=device-width, initial-scale=1.0");

    // Open Graph tags
    setMetaTag("og:title", ogTitle || title, true);
    setMetaTag("og:description", ogDescription || description, true);
    setMetaTag("og:image", ogImage, true);
    setMetaTag("og:type", publishedTime ? "article" : "website", true);
    setMetaTag("og:url", window.location.href, true);
    setMetaTag("og:site_name", "MVP Generator AI", true);

    // Twitter Card tags
    setMetaTag("twitter:card", "summary_large_image");
    setMetaTag("twitter:title", twitterTitle || ogTitle || title);
    setMetaTag("twitter:description", twitterDescription || ogDescription || description);
    setMetaTag("twitter:image", twitterImage || ogImage);
    setMetaTag("twitter:site", "@mvpgeneratorai");

    // Article specific tags
    if (publishedTime) {
      setMetaTag("article:published_time", publishedTime, true);
      setMetaTag("article:author", author, true);
    }
    
    if (modifiedTime) {
      setMetaTag("article:modified_time", modifiedTime, true);
    }

    // Article tags
    articleTags.forEach(tag => {
      const meta = document.createElement("meta");
      meta.setAttribute("property", "article:tag");
      meta.content = tag;
      document.head.appendChild(meta);
    });

    // Canonical URL
    if (canonical) {
      let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonicalLink) {
        canonicalLink = document.createElement("link");
        canonicalLink.rel = "canonical";
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.href = canonical;
    }

    // Structured data
    if (structuredData) {
      let scriptTag = document.querySelector('script[type="application/ld+json"]');
      if (!scriptTag) {
        scriptTag = document.createElement("script");
        (scriptTag as HTMLScriptElement).type = "application/ld+json";
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(structuredData);
    }

    // Auto-submit to search engines for indexing
    if (!noindex && typeof window !== 'undefined') {
      // Submit to IndexNow for instant indexing
      const submitToIndexNow = async () => {
        try {
          const indexNowKey = "your-indexnow-key"; // Add to environment
          const url = window.location.href;
          
          await fetch(`https://api.indexnow.org/indexnow?url=${encodeURIComponent(url)}&key=${indexNowKey}`, {
            method: 'GET'
          });
        } catch (error) {
          console.log('IndexNow submission failed:', error);
        }
      };

      // Submit after a delay to avoid spamming
      setTimeout(submitToIndexNow, 2000);
    }
  }, [title, description, keywords, ogTitle, ogDescription, ogImage, twitterTitle, twitterDescription, twitterImage, canonical, structuredData, noindex, author, publishedTime, modifiedTime, articleTags, lang]);

  return null;
}
