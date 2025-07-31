
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

interface AdDisplayProps {
  position: "header" | "sidebar" | "content" | "footer";
  className?: string;
}

export function AdDisplay({ position, className = "" }: AdDisplayProps) {
  const [mountedAds, setMountedAds] = useState<Set<string>>(new Set());

  // Get ad settings to check if ads are enabled
  const { data: adSettings } = useQuery({
    queryKey: ["/api/admin/ad-settings"],
    refetchInterval: 30000, // Check every 30 seconds
  });

  const { data: ads = [] } = useQuery({
    queryKey: ["/api/advertisements"],
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  // Filter ads for this position
  const positionAds = ads.filter((ad: any) => 
    ad.position === position && ad.isActive
  );

  // Apply ad count limits based on settings
  const getMaxAdsForPosition = () => {
    const counts = {
      low: { header: 1, sidebar: 2, content: 1, footer: 1 },
      medium: { header: 1, sidebar: 3, content: 2, footer: 1 },
      high: { header: 2, sidebar: 4, content: 3, footer: 2 }
    };
    return counts[adSettings?.adCount || 'low'][position] || 1;
  };

  const limitedAds = adSettings?.enableAds ? positionAds.slice(0, getMaxAdsForPosition()) : [];

  useEffect(() => {
    // Execute ad scripts when component mounts or ads change
    limitedAds.forEach((ad: any) => {
      if (!mountedAds.has(ad.id)) {
        try {
          // Mark as mounted immediately to prevent duplicate execution
          setMountedAds(prev => new Set([...prev, ad.id]));
          
          if (ad.adCode && ad.adCode.includes('<script')) {
            // Create a temporary div to parse the ad code
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = ad.adCode;
            
            // Find and execute scripts
            const scripts = tempDiv.getElementsByTagName('script');
            Array.from(scripts).forEach(script => {
              if (script.src) {
                // External script
                const newScript = document.createElement('script');
                newScript.src = script.src;
                newScript.async = true;
                newScript.defer = true;
                // Add error handling
                newScript.onerror = () => console.log('Ad script failed to load:', script.src);
                document.head.appendChild(newScript);
              } else if (script.textContent && script.textContent.trim()) {
                // Inline script with error handling
                try {
                  const newScript = document.createElement('script');
                  newScript.textContent = script.textContent;
                  document.body.appendChild(newScript);
                } catch (scriptError) {
                  console.error('Error executing inline script:', scriptError);
                }
              }
            });
          }
        } catch (error) {
          console.error('Error executing ad script:', error);
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
            maxWidth: '100%'
          }}
        >
          <div 
            className="ad-content"
            dangerouslySetInnerHTML={{ __html: ad.adCode }}
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
