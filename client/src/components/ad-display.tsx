
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

interface AdDisplayProps {
  position: "header" | "sidebar" | "content" | "footer";
  className?: string;
}

export function AdDisplay({ position, className = "" }: AdDisplayProps) {
  const [mountedAds, setMountedAds] = useState<Set<string>>(new Set());

  const { data: ads = [] } = useQuery({
    queryKey: ["/api/advertisements"],
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  const positionAds = ads.filter((ad: any) => ad.position === position);

  useEffect(() => {
    // Execute ad scripts when component mounts or ads change
    positionAds.forEach((ad: any) => {
      if (!mountedAds.has(ad.id) && ad.adCode.includes('<script')) {
        try {
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
              document.head.appendChild(newScript);
            } else if (script.textContent) {
              // Inline script
              const newScript = document.createElement('script');
              newScript.textContent = script.textContent;
              document.head.appendChild(newScript);
            }
          });
          
          setMountedAds(prev => new Set([...prev, ad.id]));
        } catch (error) {
          console.error('Error executing ad script:', error);
        }
      }
    });
  }, [positionAds, mountedAds]);

  if (positionAds.length === 0) {
    return null;
  }

  return (
    <div className={`ad-container ad-position-${position} ${className}`}>
      {positionAds.map((ad: any) => (
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
