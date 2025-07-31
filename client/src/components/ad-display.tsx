import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

interface AdDisplayProps {
  position: "header" | "sidebar" | "content" | "footer" | "blog-top" | "blog-middle" | "blog-bottom" | "generator-top" | "generator-bottom";
  className?: string;
}

function AdDisplay({ position, className = "" }: AdDisplayProps) {
  const [mountedAds, setMountedAds] = useState<Set<string>>(new Set());

  // Get ad settings to check if ads are enabled (public endpoint)
  const { data: adSettings } = useQuery({
    queryKey: ["/api/ad-settings"],
    refetchInterval: 30000, // Check every 30 seconds
  });

  const { data: ads = [] } = useQuery({
    queryKey: ["/api/advertisements"],
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    enabled: true, // Always try to fetch ads
  });

  // Filter ads for this position
  const positionAds = ads.filter((ad: any) => 
    ad.position === position && ad.isActive && ad.adCode?.trim()
  );

  // Apply ad count limits based on settings
  const getMaxAdsForPosition = () => {
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
    return counts[adSettings?.adCount || 'low'][position] || 0;
  };

  const limitedAds = (adSettings?.enableAds && positionAds.length > 0) ? 
    positionAds.slice(0, getMaxAdsForPosition()) : [];

  useEffect(() => {
    // Execute ad scripts when component mounts or ads change
    limitedAds.forEach((ad: any) => {
      if (!mountedAds.has(ad.id)) {
        console.log('Processing ad:', ad.name, 'Position:', ad.position);
        
        try {
          // Mark as mounted immediately to prevent duplicate execution
          setMountedAds(prev => new Set([...prev, ad.id]));

          if (ad.adCode && ad.adCode.trim()) {
            console.log('Ad code found for:', ad.name);
            
            // Small delay to ensure DOM is ready
            setTimeout(() => {
              try {
                const adContainer = document.querySelector(`[data-ad-id="${ad.id}"]`);
                if (!adContainer) {
                  console.error('Ad container not found for:', ad.id);
                  return;
                }

                // Create a temporary div to parse the ad code
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = ad.adCode;

                // First, add all non-script content to the container
                const nonScriptContent = ad.adCode.replace(/<script[\s\S]*?<\/script>/gi, '');
                if (nonScriptContent.trim()) {
                  adContainer.innerHTML = nonScriptContent;
                }

                // Then handle scripts separately
                const scriptMatches = ad.adCode.match(/<script[\s\S]*?<\/script>/gi);
                if (scriptMatches) {
                  scriptMatches.forEach((scriptHtml, index) => {
                    const tempScriptDiv = document.createElement('div');
                    tempScriptDiv.innerHTML = scriptHtml;
                    const script = tempScriptDiv.querySelector('script');
                    
                    if (script) {
                      const newScript = document.createElement('script');
                      
                      // Copy all attributes
                      Array.from(script.attributes).forEach(attr => {
                        newScript.setAttribute(attr.name, attr.value);
                      });
                      
                      if (script.src) {
                        // External script
                        newScript.onload = () => console.log('Ad script loaded:', script.src);
                        newScript.onerror = () => console.error('Ad script failed to load:', script.src);
                      } else if (script.textContent && script.textContent.trim()) {
                        // Inline script
                        newScript.textContent = script.textContent;
                      }
                      
                      newScript.id = `ad-script-${ad.id}-${index}`;
                      
                      // Append to document head for external scripts, body for inline
                      if (script.src) {
                        document.head.appendChild(newScript);
                      } else {
                        document.body.appendChild(newScript);
                      }
                    }
                  });
                }
                
                console.log('Ad processed successfully:', ad.name);
              } catch (error) {
                console.error('Error processing ad code for', ad.name, ':', error);
              }
            }, 200);
          } else {
            console.warn('No ad code found for:', ad.name);
          }
        } catch (error) {
          console.error('Error executing ad script for', ad.name, ':', error);
        }
      }
    });
  }, [limitedAds, mountedAds]);

  // Don't show ads if they're disabled globally or no ads available
  if (!adSettings?.enableAds || limitedAds.length === 0) {
    return null;
  }

  return (
    <div className={`ad-container ad-position-${position} ${className}`}>
      {limitedAds.map((ad: any) => (
        <div 
          key={ad.id} 
          className="ad-wrapper mb-4"
          style={{
            width: `${ad.width}px`,
            height: `${ad.height}px`,
            maxWidth: '100%',
            margin: '1rem auto'
          }}
        >
          <div 
            className="ad-content"
            data-ad-id={ad.id}
            style={{
              width: '100%',
              height: '100%',
              overflow: 'hidden'
            }}
          />
          <div className="ad-label text-xs text-gray-400 text-center mt-1">
            Advertisement
          </div>
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
            transform: scale(0.8);
            transform-origin: center;
          }
        }

        @media (max-width: 480px) {
          .responsive-ad-wrapper .ad-wrapper {
            transform: scale(0.6);
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