import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

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

  // Execute scripts after DOM is updated
  useEffect(() => {
    if (displayAds.length > 0) {
      displayAds.forEach((ad, index) => {
        const containerId = `ad-container-${ad.id}-${index}`;
        const container = document.getElementById(containerId);
        
        if (container && ad.adCode) {
          // Clear previous content but preserve container
          container.innerHTML = '';
          
          // Create a placeholder div for the ad content
          const adContentDiv = document.createElement('div');
          adContentDiv.id = `ad-content-${ad.id}-${index}`;
          adContentDiv.style.width = ad.width ? `${ad.width}px` : '320px';
          adContentDiv.style.height = ad.height ? `${ad.height}px` : '50px';
          adContentDiv.style.display = 'block';
          adContentDiv.style.position = 'relative';
          container.appendChild(adContentDiv);
          
          // Parse the ad code safely
          const parser = new DOMParser();
          const adDoc = parser.parseFromString(ad.adCode, 'text/html');
          
          // Execute inline scripts first
          const inlineScripts = adDoc.querySelectorAll('script:not([src])');
          inlineScripts.forEach((script) => {
            if (script.textContent && script.textContent.trim()) {
              try {
                const scriptContent = script.textContent;
                console.log('Executing inline ad script for container:', containerId);
                
                // Create a scoped execution context
                const executeScript = new Function('container', 'adContainer', scriptContent);
                executeScript(container, adContentDiv);
              } catch (error) {
                console.error('Error executing inline ad script:', error);
              }
            }
          });
          
          // Handle external scripts with proper timing
          const externalScripts = adDoc.querySelectorAll('script[src]');
          externalScripts.forEach((script) => {
            const src = script.getAttribute('src');
            if (src) {
              // Check if script already exists
              const existingScript = document.querySelector(`script[src="${src}"]`);
              
              if (!existingScript) {
                const newScript = document.createElement('script');
                newScript.src = src.startsWith('//') ? `https:${src}` : src;
                newScript.async = false; // Ensure scripts load in order
                newScript.type = 'text/javascript';
                
                newScript.onload = () => {
                  console.log('External ad script loaded:', src);
                  
                  // Add a small delay to allow the script to initialize
                  setTimeout(() => {
                    // Check if the ad content has been injected
                    if (adContentDiv.children.length === 0) {
                      console.log('Triggering ad content injection for:', containerId);
                      
                      // Try to trigger ad display if it hasn't appeared
                      if (window.adsbygoogle && window.adsbygoogle.length !== undefined) {
                        try {
                          (window.adsbygoogle = window.adsbygoogle || []).push({});
                        } catch (e) {
                          console.log('AdSense push attempt:', e);
                        }
                      }
                    }
                  }, 1000);
                };
                
                newScript.onerror = () => console.error('External ad script failed:', src);
                document.head.appendChild(newScript);
              } else {
                console.log('External script already loaded:', src);
              }
            }
          });
          
          // Add any non-script HTML content
          const nonScriptElements = adDoc.body.children;
          for (let i = 0; i < nonScriptElements.length; i++) {
            const element = nonScriptElements[i];
            if (element.tagName !== 'SCRIPT') {
              adContentDiv.appendChild(element.cloneNode(true));
            }
          }
        }
      });
    }
  }, [displayAds]);

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
      
      <div className="space-y-4">
        {displayAds.map((ad, index) => (
          <div
            key={`${ad.id}-${index}`}
            id={`ad-container-${ad.id}-${index}`}
            className="ad-slot border border-dashed border-gray-300 rounded"
            style={{
              minHeight: ad.height ? `${ad.height}px` : '50px',
              width: ad.width ? `${ad.width}px` : '320px',
              maxWidth: '100%',
              overflow: 'visible',
              padding: '2px',
              backgroundColor: '#f9f9f9'
            }}
            data-ad-name={ad.name}
            data-ad-position={ad.position}
          />
        ))}
      </div>
    </div>
  );
}

// Create BlogAdDisplay as an alias for AdDisplay
export const BlogAdDisplay = AdDisplay;

export { AdDisplay };
export default AdDisplay;