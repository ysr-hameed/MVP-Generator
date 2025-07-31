
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

  // Enhanced script injection with proper sizing
  const injectAdScript = (adCode: string, container: HTMLElement, ad: Advertisement): void => {
    try {
      // Clear container first
      container.innerHTML = '';

      // Get dimensions - use ad dimensions or defaults based on position
      const getAdDimensions = () => {
        if (ad.width && ad.height) {
          return { width: ad.width, height: ad.height };
        }

        // Default sizes based on position
        const defaultSizes = {
          'header': { width: 728, height: 90 },
          'sidebar': { width: 300, height: 250 },
          'content': { width: 728, height: 90 },
          'footer': { width: 728, height: 90 },
          'blog-top': { width: 728, height: 90 },
          'blog-middle': { width: 336, height: 280 },
          'blog-bottom': { width: 728, height: 90 },
          'generator-top': { width: 728, height: 90 },
          'generator-bottom': { width: 300, height: 250 }
        };

        return defaultSizes[position as keyof typeof defaultSizes] || { width: 320, height: 100 };
      };

      const dimensions = getAdDimensions();
      
      // Set container size to match ad dimensions
      container.style.cssText = `
        width: ${dimensions.width}px;
        max-width: 100%;
        height: ${dimensions.height}px;
        margin: 10px auto;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        background: #fafafa;
        overflow: hidden;
        position: relative;
        display: block;
      `;

      // Check if it's a script-based ad (like Adsterra)
      if (adCode.includes('atOptions') || adCode.includes('<script') || adCode.includes('document.write')) {
        // Create sandbox iframe for script-based ads
        const iframe = document.createElement('iframe');
        iframe.style.cssText = `
          width: 100%;
          height: 100%;
          border: none;
          background: transparent;
          display: block;
        `;
        iframe.id = `ad-frame-${ad.id}`;
        iframe.sandbox = 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation';

        container.appendChild(iframe);

        // Inject content into iframe
        iframe.onload = () => {
          try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
            if (iframeDoc) {
              const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <style>
                    body { 
                      margin: 0; 
                      padding: 4px; 
                      overflow: hidden; 
                      font-family: Arial, sans-serif;
                      background: transparent;
                    }
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

              console.log(`✓ Script-based ad loaded: ${ad.name}`);
            }
          } catch (error) {
            console.error(`Failed to inject script ad for ${ad.name}:`, error);
            container.innerHTML = `
              <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #999; font-size: 14px;">
                <span>Advertisement</span>
              </div>
            `;
          }
        };

        iframe.src = 'about:blank';

      } else {
        // For HTML-based ads, inject directly
        const adWrapper = document.createElement('div');
        adWrapper.style.cssText = `
          width: 100%;
          height: 100%;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        `;
        adWrapper.innerHTML = adCode;
        container.appendChild(adWrapper);
        
        console.log(`✓ HTML ad loaded: ${ad.name}`);
      }

    } catch (error) {
      console.error(`Error creating ad container for ${ad.name}:`, error);
      container.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #999; font-size: 14px; border: 1px dashed #ccc;">
          <span>Ad failed to load</span>
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
          // Create individual ad container
          const adContainer = document.createElement('div');
          adContainer.className = `ad-slot ad-slot-${ad.id}`;
          adContainer.style.cssText = `
            margin-bottom: 20px;
            display: block;
          `;

          container.appendChild(adContainer);

          // Inject the ad with a delay for better loading
          setTimeout(() => {
            injectAdScript(ad.adCode, adContainer, ad);
          }, 200 * index);

        } catch (error) {
          console.error(`Error setting up ad container for ${ad.name}:`, error);
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
        className="ads-wrapper"
        style={{ minHeight: '60px' }}
      />
    </div>
  );
}

// Create BlogAdDisplay as an alias for AdDisplay
export const BlogAdDisplay = AdDisplay;

export { AdDisplay };
export default AdDisplay;
