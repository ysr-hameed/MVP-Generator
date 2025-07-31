
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

  // Enhanced script injection with proper execution
  const injectAndExecuteScript = (script: HTMLScriptElement, containerId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const newScript = document.createElement('script');
      
      if (script.src) {
        // External script
        const srcUrl = script.src.startsWith('//') ? `https:${script.src}` : script.src;
        
        // Check if script is already loaded
        if (loadedScripts.has(srcUrl)) {
          console.log('External script already loaded:', srcUrl);
          resolve();
          return;
        }
        
        newScript.src = srcUrl;
        newScript.async = true;
        newScript.defer = true;
        
        newScript.onload = () => {
          console.log('External ad script loaded:', srcUrl);
          setLoadedScripts(prev => new Set(prev).add(srcUrl));
          resolve();
        };
        
        newScript.onerror = (error) => {
          console.error('Ad script failed to load:', srcUrl, error);
          setAdErrors(prev => [...prev, `Failed to load: ${srcUrl}`]);
          reject(error);
        };
        
        document.head.appendChild(newScript);
      } else if (script.textContent) {
        // Inline script
        try {
          console.log('Executing inline ad script for container:', containerId);
          
          // Create a safer execution context
          const scriptContent = script.textContent;
          newScript.textContent = `
            try {
              ${scriptContent}
            } catch (error) {
              console.error('Ad script execution error:', error);
            }
          `;
          
          document.head.appendChild(newScript);
          
          // Remove the script after execution
          setTimeout(() => {
            if (newScript.parentNode) {
              newScript.parentNode.removeChild(newScript);
            }
          }, 100);
          
          resolve();
        } catch (error) {
          console.error('Inline script execution error:', error);
          setAdErrors(prev => [...prev, `Script execution failed: ${containerId}`]);
          reject(error);
        }
      } else {
        resolve();
      }
    });
  };

  // Enhanced ad injection with better error handling
  useEffect(() => {
    if (displayAds.length > 0 && adContainerRef.current) {
      const container = adContainerRef.current;
      
      // Clear previous ads
      container.innerHTML = '';
      setAdErrors([]);
      
      displayAds.forEach(async (ad, index) => {
        try {
          // Create a unique container for each ad
          const adWrapper = document.createElement('div');
          const containerId = `ad-container-${ad.id}-${index}`;
          adWrapper.id = containerId;
          
          // Set container styles
          adWrapper.style.width = ad.width ? `${ad.width}px` : '100%';
          adWrapper.style.maxWidth = '100%';
          adWrapper.style.height = ad.height ? `${ad.height}px` : 'auto';
          adWrapper.style.minHeight = '50px';
          adWrapper.style.margin = '8px auto';
          adWrapper.style.border = '1px solid #e5e5e5';
          adWrapper.style.borderRadius = '6px';
          adWrapper.style.padding = '8px';
          adWrapper.style.backgroundColor = '#fafafa';
          adWrapper.style.position = 'relative';
          adWrapper.style.overflow = 'hidden';
          adWrapper.style.display = 'flex';
          adWrapper.style.alignItems = 'center';
          adWrapper.style.justifyContent = 'center';
          
          // Add loading indicator
          adWrapper.innerHTML = '<div style="color: #666; font-size: 12px;">Loading ad...</div>';
          
          // Append to container first
          container.appendChild(adWrapper);
          
          // Small delay to ensure DOM is ready
          setTimeout(async () => {
            try {
              // Inject the raw ad code
              adWrapper.innerHTML = ad.adCode;
              
              // Find and execute scripts
              const scripts = adWrapper.querySelectorAll('script');
              const scriptPromises: Promise<void>[] = [];
              
              scripts.forEach((oldScript) => {
                scriptPromises.push(injectAndExecuteScript(oldScript, containerId));
                // Remove the old script tag from the ad container
                oldScript.remove();
              });
              
              // Wait for all scripts to load/execute
              await Promise.allSettled(scriptPromises);
              
              console.log(`Ad successfully injected: ${ad.name} at position ${position}`);
              
              // Remove loading state after a short delay
              setTimeout(() => {
                const loadingDiv = adWrapper.querySelector('div[style*="Loading ad"]');
                if (loadingDiv) {
                  loadingDiv.remove();
                }
              }, 2000);
              
            } catch (error) {
              console.error(`Error processing ad ${ad.name}:`, error);
              adWrapper.innerHTML = `
                <div style="color: #999; font-size: 11px; text-align: center; padding: 10px;">
                  Ad failed to load: ${ad.name}
                </div>
              `;
              setAdErrors(prev => [...prev, `Failed to load ad: ${ad.name}`]);
            }
          }, 100 * index); // Stagger ad loading
          
        } catch (error) {
          console.error(`Error creating ad container for ${ad.name}:`, error);
        }
      });
    }
  }, [displayAds, loadedScripts]);

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
