import { useQuery } from "@tanstack/react-query";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  canonicalUrl?: string;
  structuredData?: any;
}

export default function SEOHead({
  title,
  description,
  keywords,
  ogImage,
  ogType = "website",
  twitterCard = "summary_large_image",
  canonicalUrl,
  structuredData,
}: SEOHeadProps) {
  // Fetch site settings for default values
  const { data: siteSettings } = useQuery({
    queryKey: ["/api/site-settings"],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const siteName = siteSettings?.siteName || "MVP Generator AI";
  const siteDescription = siteSettings?.description || "AI-powered MVP generator for entrepreneurs and startups";
  const finalTitle = title ? `${title} | ${siteName}` : siteName;
  const finalDescription = description || siteDescription;
  const finalKeywords = keywords || siteSettings?.keywords || "MVP, startup, AI, generator, business plan";
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const finalCanonicalUrl = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : '');
  const finalOgImage = ogImage || `${baseUrl}/og-image.jpg`;

  return (
    <>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />

      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalOgImage} />
      <meta property="og:type" content={ogType} />
      {canonicalUrl && <link rel="canonical" href={finalCanonicalUrl} />}

      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalOgImage} />

      {/* Structured Data (JSON-LD) */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </>
  );
}