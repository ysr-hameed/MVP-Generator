import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

interface AdDisplayProps {
  position: "header" | "sidebar" | "content" | "footer" | "blog-top" | "blog-middle" | "blog-bottom" | "generator-top" | "generator-bottom";
  className?: string;
}

interface AdSettings {
  enableAds: boolean;
  adCount: 'low' | 'medium' | 'high';
  showAdLabels: boolean;
}

interface Advertisement {
  id: string;
  name: string;
  position: string;
  isActive: boolean;
  adCode: string;
  width?: number;
  height?: number;
}

function AdDisplay({ position, className = "" }: AdDisplayProps) {
  const adContainerRef = useRef<HTMLDivElement>(null);
  const [adsLoaded, setAdsLoaded] = useState(false);

  // Get ad settings from database
  const { data: adSettings } = useQuery<AdSettings>({
    queryKey: ["/api/admin/ad-settings"],
    refetchInterval: 30000,
    retry: false,
    staleTime: 60000,
  });

  // Get advertisements from database
  const { data: ads = [] } = useQuery<Advertisement[]>({
    queryKey: ["/api/advertisements"],
    refetchInterval: 5 * 60 * 1000,
    enabled: true,
    retry: 3,
    staleTime: 2 * 60 * 1000,
  });

  // Filter ads for this position that are active and have ad code
  const positionAds = ads.filter((ad: Advertisement) => 
    ad.position === position && 
    ad.isActive && 
    ad.adCode && 
    ad.adCode.trim().length > 0
  );

  // Apply ad count limits based on settings
  const getMaxAdsForPosition = () => {
    if (!adSettings) return 1;

    const counts = {
      low: { 
        header: 1, sidebar: 1, content: 1, footer: 1,
        "blog-top": 1, "blog-middle": 1, "blog-bottom": 1,
        "generator-top": 1, "generator-bottom": 1
      },
      medium: { 
        header: 1, sidebar: 2, content: 1, footer: 1,
        "blog-top": 1, "blog-middle": 1, "blog-bottom": 1,
        "generator-top": 1, "generator-bottom": 1
      },
      high: { 
        header: 1, sidebar: 3, content: 2, footer: 2,
        "blog-top": 1, "blog-middle": 2, "blog-bottom": 2,
        "generator-top": 1, "generator-bottom": 2
      }
    };
    const adCountLevel = adSettings?.adCount || 'low';
    return counts[adCountLevel][position as keyof typeof counts.low] || 1;
  };

  const displayAds = (adSettings?.enableAds && positionAds.length > 0) ? 
    positionAds.slice(0, getMaxAdsForPosition()) : [];

  // Simple script injection using HTML-like approach with iframes for isolation
  const injectAdScript = (adCode: string, container: HTMLElement, adId: string): void => {
    try {
      // Create iframe for isolated script execution (like HTML)
      const iframe = document.createElement('iframe');
      iframe.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
        background: transparent;
        display: block;
      `;
      iframe.id = `ad-frame-${adId}`;

      container.appendChild(iframe);

      // Wait for iframe to load then inject content
      iframe.onload = () => {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            // Create complete HTML document with the ad code
            const htmlContent = `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="UTF-8">
                <style>
                  body { margin: 0; padding: 8px; overflow: hidden; }
                  * { box-sizing: border-box; }
                </style>
              </head>
              <body>
                ${adCode}
              </body>
              </html>
            `;

            iframeDoc.open();
            iframeDoc.write(htmlContent);
            iframeDoc.close();

            console.log(`✓ Ad loaded successfully: ${adId}`);
          }
        } catch (error) {
          console.error(`Failed to inject ad content for ${adId}:`, error);
          container.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #999; border: 1px dashed #ddd; border-radius: 4px;">
              <p>Advertisement space</p>
            </div>
          `;
        }
      };

      // Set empty src to trigger onload
      iframe.src = 'about:blank';

    } catch (error) {
      console.error(`Error creating ad container for ${adId}:`, error);
      container.innerHTML = `
        <div style="padding: 20px; text-align: center; color: #999; border: 1px dashed #ddd; border-radius: 4px;">
          <p>Ad failed to load</p>
        </div>
      `;
    }
  };

  // Main ad loading effect
  useEffect(() => {
    if (displayAds.length > 0 && adContainerRef.current && !adsLoaded) {
      const container = adContainerRef.current;

      // Clear previous content
      container.innerHTML = '';

      displayAds.forEach((ad, index) => {
        try {
          // Create ad wrapper
          const adWrapper = document.createElement('div');
          adWrapper.className = 'ad-wrapper';
          adWrapper.style.cssText = `
            width: ${ad.width ? `${ad.width}px` : '100%'};
            max-width: 100%;
            height: ${ad.height ? `${ad.height}px` : '250px'};
            margin: 8px auto;
            padding: 0;
            border: 1px solid #e5e5e5;
            border-radius: 6px;
            background-color: #fafafa;
            position: relative;
            overflow: hidden;
            display: block;
          `;

          container.appendChild(adWrapper);

          // Inject the ad with a small delay
          setTimeout(() => {
            injectAdScript(ad.adCode, adWrapper, ad.id);
          }, 100 * index);

        } catch (error) {
          console.error(`Error creating ad container for ${ad.name}:`, error);
        }
      });

      setAdsLoaded(true);
    }
  }, [displayAds, adsLoaded, position]);

  // Reset when ads change
  useEffect(() => {
    setAdsLoaded(false);
  }, [displayAds.length, displayAds.map(ad => ad.id).join(',')]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (adContainerRef.current) {
        adContainerRef.current.innerHTML = '';
      }
    };
  }, []);

  // Don't render anything if ads are disabled
  if (!adSettings?.enableAds) {
    return null;
  }

  // Don't render if no ads for this position
  if (displayAds.length === 0) {
    return null;
  }

  return (
    <div className={`ad-container ${className}`}>
      {adSettings.showAdLabels && (
        <div className="text-xs text-muted-foreground mb-2 text-center">
          Advertisement
        </div>
      )}

      <div 
        ref={adContainerRef}
        className="space-y-2"
        style={{ minHeight: '60px' }}
      />
    </div>
  );
}

// Create BlogAdDisplay as an alias for AdDisplay
export const BlogAdDisplay = AdDisplay;

export { AdDisplay };
export default AdDisplay;