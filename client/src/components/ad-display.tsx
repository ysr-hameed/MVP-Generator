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
  const [adErrors, setAdErrors] = useState<string[]>([]);
  const [loadedScripts, setLoadedScripts] = useState<Set<string>>(new Set());
  const [adsLoaded, setAdsLoaded] = useState(false);
  const processedAdsRef = useRef<Set<string>>(new Set());

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

  // Enhanced script injection that handles Adsterra and other ad networks properly
  const injectAdScript = (adCode: string, container: HTMLElement): Promise<void> => {
    return new Promise((resolve) => {
      try {
        // Create a unique container ID
        const containerId = `ad-container-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        container.id = containerId;

        // Clear loading message
        container.innerHTML = '';

        // Check if this is an Adsterra-style script
        if (adCode.includes('atOptions') || adCode.includes('document.write')) {
          console.log('Executing Adsterra-style ad script for container:', containerId);
          
          // Create content div for the ad
          const adContentDiv = document.createElement('div');
          adContentDiv.id = `${containerId}-content`;
          adContentDiv.style.cssText = 'width: 100%; height: 100%; display: block;';
          container.appendChild(adContentDiv);

          // Override document.write temporarily for this container
          const originalWrite = document.write;
          const originalWriteln = document.writeln;
          
          document.write = function(content: string) {
            const contentDiv = document.getElementById(`${containerId}-content`);
            if (contentDiv) {
              contentDiv.innerHTML += content;
            }
          };
          
          document.writeln = function(content: string) {
            const contentDiv = document.getElementById(`${containerId}-content`);
            if (contentDiv) {
              contentDiv.innerHTML += content + '\n';
            }
          };

          // Execute the ad script using Function constructor (safer than eval)
          try {
            console.log('Executing inline ad script:', adCode.substring(0, 100) + '...');
            
            // Extract and execute the JavaScript code
            const executeCode = new Function(adCode);
            executeCode();
            
            // Restore document.write after execution
            setTimeout(() => {
              document.write = originalWrite;
              document.writeln = originalWriteln;
            }, 1000);

          } catch (error) {
            console.error('Adsterra script execution error:', error);
            // Restore document.write on error
            document.write = originalWrite;
            document.writeln = originalWriteln;
            
            container.innerHTML = `<div style="padding: 20px; text-align: center; color: #666; border: 1px dashed #ccc; border-radius: 4px;">
              <p>Loading advertisement...</p>
              <div style="width: 20px; height: 20px; border: 2px solid #e3e3e3; border-top: 2px solid #333; border-radius: 50%; animation: spin 1s linear infinite; margin: 10px auto;"></div>
            </div>`;
          }
        } else {
          // For regular HTML ads
          console.log('Executing HTML ad for container:', containerId);
          container.innerHTML = adCode;
        }

        // Resolve after allowing time for ad to load
        setTimeout(() => {
          resolve();
        }, 2000);

      } catch (error) {
        console.error('Ad injection error:', error);
        container.innerHTML = `<div style="padding: 20px; text-align: center; color: #999; border: 1px dashed #ddd; border-radius: 4px;">
          <p>Ad failed to load</p>
        </div>`;
        resolve();
      }
    });
  };

  // Main ad loading effect
  useEffect(() => {
    if (displayAds.length > 0 && adContainerRef.current && !adsLoaded) {
      const container = adContainerRef.current;

      // Clear previous content
      container.innerHTML = '';
      setAdErrors([]);

      const loadAds = async () => {
        for (let i = 0; i < displayAds.length; i++) {
          const ad = displayAds[i];
          const adKey = `${ad.id}-${position}`;

          // Skip if already processed
          if (processedAdsRef.current.has(adKey)) {
            continue;
          }

          try {
            // Create ad wrapper
            const adWrapper = document.createElement('div');
            adWrapper.className = 'ad-wrapper';
            adWrapper.style.cssText = `
              width: ${ad.width ? `${ad.width}px` : '100%'};
              max-width: 100%;
              height: ${ad.height ? `${ad.height}px` : 'auto'};
              min-height: 60px;
              margin: 8px auto;
              padding: 8px;
              border: 1px solid #e5e5e5;
              border-radius: 6px;
              background-color: #fafafa;
              position: relative;
              overflow: hidden;
              display: block;
            `;

            // Add loading indicator with better styling
            adWrapper.innerHTML = `
              <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666; font-size: 12px; background: #f8f9fa;">
                <div style="text-align: center;">
                  <div style="width: 20px; height: 20px; border: 2px solid #e3e3e3; border-top: 2px solid #333; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 8px;"></div>
                  Loading ad...
                </div>
              </div>
              <style>
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              </style>
            `;

            container.appendChild(adWrapper);

            // Inject the ad after a short delay
            setTimeout(async () => {
              try {
                await injectAdScript(ad.adCode, adWrapper);
                processedAdsRef.current.add(adKey);
                console.log(`Ad loaded successfully: ${ad.name}`);
                
                // Remove loading state
                const loadingDiv = adWrapper.querySelector('div[style*="Loading ad"]');
                if (loadingDiv) {
                  loadingDiv.remove();
                }
                
              } catch (error) {
                console.error(`Failed to load ad ${ad.name}:`, error);
                adWrapper.innerHTML = `
                  <div style="display: flex; align-items: center; justify-content: center; height: 60px; color: #999; font-size: 11px; background: #fafafa; border: 1px dashed #ddd; border-radius: 4px;">
                    <span>Advertisement space</span>
                  </div>
                `;
                setAdErrors(prev => [...prev, `Failed to load: ${ad.name}`]);
              }
            }, 200 * i);
          } catch (error) {
            console.error(`Error creating ad container for ${ad.name}:`, error);
          }
        }

        setAdsLoaded(true);
      };

      loadAds();
    }
  }, [displayAds, adsLoaded, position]);

  // Reset when ads change
  useEffect(() => {
    setAdsLoaded(false);
    processedAdsRef.current.clear();
  }, [displayAds.length, displayAds.map(ad => ad.id).join(',')]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (adContainerRef.current) {
        adContainerRef.current.innerHTML = '';
      }
      processedAdsRef.current.clear();
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

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && adErrors.length > 0 && (
        <div className="text-xs text-red-500 mt-2">
          {adErrors.map((error, index) => (
            <div key={index}>{error}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// Create BlogAdDisplay as an alias for AdDisplay
export const BlogAdDisplay = AdDisplay;

export { AdDisplay };
export default AdDisplay;