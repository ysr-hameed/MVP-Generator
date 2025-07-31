
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

interface AdDisplayProps {
  position: "header" | "sidebar" | "content" | "footer" | "blog-top" | "blog-middle" | "blog-bottom" | "generator-top" | "generator-bottom";
  className?: string;
}

function AdDisplay({ position, className = "" }: AdDisplayProps) {
  const [mountedAds, setMountedAds] = useState<Set<string>>(new Set());

  // Get ad settings from database
  const { data: adSettings } = useQuery({
    queryKey: ["/api/admin/ad-settings"],
    refetchInterval: 30000, // Check every 30 seconds
    retry: false,
    staleTime: 60000, // Consider data fresh for 1 minute
  });

  // Get advertisements from database
  const { data: ads = [] } = useQuery({
    queryKey: ["/api/advertisements"],
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    enabled: true, // Always try to fetch ads
    retry: 3, // Retry 3 times on failure
    staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes
  });

  // Filter ads for this position that are active and have ad code
  const positionAds = ads.filter((ad: any) => 
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
    return counts[adSettings?.adCount || 'low'][position] || 1;
  };

  const limitedAds = (adSettings?.enableAds && positionAds.length > 0) ? 
    positionAds.slice(0, getMaxAdsForPosition()) : [];

  useEffect(() => {
    // Clean up previously mounted ads
    const adContainers = document.querySelectorAll(`[data-ad-position="${position}"]`);
    adContainers.forEach(container => {
      container.innerHTML = '';
    });
    
    // Process new ads
    limitedAds.forEach((ad: any, index: number) => {
      if (!mountedAds.has(`${ad.id}-${index}`)) {
        console.log('Processing ad:', ad.name, 'Position:', ad.position);
        
        try {
          // Mark as mounted immediately to prevent duplicate execution
          setMountedAds(prev => new Set([...prev, `${ad.id}-${index}`]));

          if (ad.adCode && ad.adCode.trim()) {
            console.log('Ad code found for:', ad.name);
            
            // Small delay to ensure DOM is ready
            setTimeout(() => {
              try {
                const adContainer = document.querySelector(`[data-ad-id="${ad.id}-${index}"]`);
                if (!adContainer) {
                  console.error('Ad container not found for:', ad.id);
                  return;
                }

                // Clear container first
                adContainer.innerHTML = '';

                // Parse and inject the ad code
                const parser = new DOMParser();
                const adDoc = parser.parseFromString(ad.adCode, 'text/html');
                
                // Handle scripts separately
                const scripts = adDoc.querySelectorAll('script');
                const nonScriptContent = ad.adCode.replace(/<script[\s\S]*?<\/script>/gi, '');
                
                // Add non-script content first
                if (nonScriptContent.trim()) {
                  const tempDiv = document.createElement('div');
                  tempDiv.innerHTML = nonScriptContent;
                  while (tempDiv.firstChild) {
                    adContainer.appendChild(tempDiv.firstChild);
                  }
                }

                // Then handle scripts
                scripts.forEach((script, scriptIndex) => {
                  const newScript = document.createElement('script');
                  
                  // Copy all attributes
                  Array.from(script.attributes).forEach(attr => {
                    newScript.setAttribute(attr.name, attr.value);
                  });
                  
                  if (script.src) {
                    // External script
                    newScript.onload = () => {
                      console.log('External ad script loaded:', script.src);
                      // Trigger any initialization functions if needed
                      if (window.adsbygoogle && !newScript.hasAttribute('data-adsbygoogle-status')) {
                        try {
                          (window.adsbygoogle = window.adsbygoogle || []).push({});
                        } catch (e) {
                          console.log('AdSense push error:', e);
                        }
                      }
                    };
                    newScript.onerror = () => console.error('Ad script failed to load:', script.src);
                    
                    // Set unique ID and append to head
                    newScript.id = `ad-script-${ad.id}-${index}-${scriptIndex}`;
                    if (!document.getElementById(newScript.id)) {
                      document.head.appendChild(newScript);
                    }
                  } else if (script.textContent && script.textContent.trim()) {
                    // Inline script
                    newScript.textContent = script.textContent;
                    newScript.id = `ad-inline-script-${ad.id}-${index}-${scriptIndex}`;
                    
                    if (!document.getElementById(newScript.id)) {
                      // Append inline scripts to the ad container or body
                      adContainer.appendChild(newScript);
                    }
                  }
                });
                
                console.log('Ad processed successfully:', ad.name);
              } catch (error) {
                console.error('Error processing ad code for', ad.name, ':', error);
              }
            }, 100 + (index * 50)); // Staggered loading
          } else {
            console.warn('No ad code found for:', ad.name);
          }
        } catch (error) {
          console.error('Error executing ad script for', ad.name, ':', error);
        }
      }
    });
  }, [limitedAds, position]);

  // Don't show ads if they're disabled globally or no ads available
  if (!adSettings?.enableAds || limitedAds.length === 0) {
    return null;
  }

  return (
    <div className={`ad-container ad-position-${position} ${className}`} data-ad-position={position}>
      {limitedAds.map((ad: any, index: number) => (
        <div 
          key={`${ad.id}-${index}`}
          className="ad-wrapper mb-4"
          style={{
            width: ad.width ? `${ad.width}px` : 'auto',
            height: ad.height ? `${ad.height}px` : 'auto',
            maxWidth: '100%',
            margin: '1rem auto',
            minHeight: '90px'
          }}
        >
          <div 
            className="ad-content"
            data-ad-id={`${ad.id}-${index}`}
            style={{
              width: '100%',
              height: '100%',
              overflow: 'hidden'
            }}
          />
          {adSettings?.showAdLabels !== false && (
            <div className="ad-label text-xs text-gray-400 text-center mt-1">
              Advertisement
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Helper component for responsive ad placement
export function ResponsiveAdDisplay({ position, className = "" }: AdDisplayProps) {
  return (
    <div className={`responsive-ad-wrapper ${className}`}>
      <style jsx>{`
        .responsive-ad-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 1rem 0;
        }

        @media (max-width: 768px) {
          .responsive-ad-wrapper {
            margin: 0.5rem 0;
          }

          .responsive-ad-wrapper .ad-wrapper {
            transform: scale(0.9);
            transform-origin: center;
          }
        }

        @media (max-width: 480px) {
          .responsive-ad-wrapper .ad-wrapper {
            transform: scale(0.8);
          }
        }
      `}</style>
      <AdDisplay position={position} />
    </div>
  );
}

// Blog-specific ad component
export function BlogAdDisplay({ position }: { position: "blog-top" | "blog-middle" | "blog-bottom" }) {
  return (
    <div className="blog-ad-section my-8">
      <AdDisplay position={position} className="flex justify-center" />
    </div>
  );
}

// Default export for the main component
export default AdDisplay;
