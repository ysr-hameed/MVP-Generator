import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

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

  // Simple direct injection approach
  useEffect(() => {
    if (displayAds.length > 0 && adContainerRef.current) {
      const container = adContainerRef.current;
      
      displayAds.forEach((ad, index) => {
        // Create a unique container for each ad
        const adWrapper = document.createElement('div');
        adWrapper.id = `ad-${ad.id}-${index}`;
        adWrapper.style.width = ad.width ? `${ad.width}px` : '320px';
        adWrapper.style.height = ad.height ? `${ad.height}px` : '50px';
        adWrapper.style.margin = '8px auto';
        adWrapper.style.border = '1px solid #ddd';
        adWrapper.style.borderRadius = '4px';
        adWrapper.style.padding = '4px';
        adWrapper.style.backgroundColor = '#fff';
        adWrapper.style.position = 'relative';
        adWrapper.style.overflow = 'hidden';
        
        // Inject the raw ad code directly
        adWrapper.innerHTML = ad.adCode;
        
        // Append to container
        container.appendChild(adWrapper);
        
        // Execute scripts manually after DOM injection
        const scripts = adWrapper.querySelectorAll('script');
        scripts.forEach((oldScript) => {
          const newScript = document.createElement('script');
          
          if (oldScript.src) {
            // External script
            newScript.src = oldScript.src.startsWith('//') ? `https:${oldScript.src}` : oldScript.src;
            newScript.async = true;
            newScript.onload = () => console.log('Ad script loaded:', newScript.src);
            newScript.onerror = () => console.error('Ad script failed:', newScript.src);
            document.head.appendChild(newScript);
          } else if (oldScript.textContent) {
            // Inline script
            newScript.textContent = oldScript.textContent;
            console.log('Executing ad script:', oldScript.textContent.substring(0, 50) + '...');
            document.head.appendChild(newScript);
          }
          
          // Remove the old script tag from the ad container
          oldScript.remove();
        });
        
        console.log(`Ad injected: ${ad.name} at position ${position}`);
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