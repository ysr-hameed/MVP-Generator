import { useEffect } from "react";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
}

export function SEOHead({ 
  title = "MVP Generator AI - Turn Ideas into Actionable Business Plans",
  description = "Generate comprehensive MVP plans using AI. Get detailed roadmaps, technical requirements, and business strategies for your startup idea.",
  keywords = "MVP generator, startup ideas, business plan, AI planning, startup roadmap",
  image = "/og-image.jpg",
  url = "https://mvpgenerator.ai"
}: SEOHeadProps) {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta tags
    const updateMetaTag = (property: string, content: string) => {
      let element = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('property', property);
        document.head.appendChild(element);
      }
      element.content = content;
    };

    const updateMetaName = (name: string, content: string) => {
      let element = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('name', name);
        document.head.appendChild(element);
      }
      element.content = content;
    };

    // Basic meta tags
    updateMetaName('description', description);
    updateMetaName('keywords', keywords);

    // Open Graph tags
    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description);
    updateMetaTag('og:image', image);
    updateMetaTag('og:url', url);
    updateMetaTag('og:type', 'website');

    // Twitter Card tags
    updateMetaName('twitter:card', 'summary_large_image');
    updateMetaName('twitter:title', title);
    updateMetaName('twitter:description', description);
    updateMetaName('twitter:image', image);

    // Additional SEO tags
    updateMetaName('robots', 'index, follow');
    updateMetaName('author', 'MVP Generator AI');
    updateMetaTag('og:site_name', 'MVP Generator AI');

  }, [title, description, keywords, image, url]);

  return null;
}