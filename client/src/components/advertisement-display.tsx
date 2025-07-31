import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ExternalLink } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Advertisement {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  targetUrl?: string;
  position: string;
  isActive: boolean;
  priority: number;
  impressions: number;
  clicks: number;
}

interface AdSettings {
  enableAds: boolean;
  adCount: "low" | "medium" | "high";
  positions: string[];
}

interface AdvertisementDisplayProps {
  position: "header" | "sidebar" | "content" | "footer" | "between-sections" | "floating";
  className?: string;
}

export function AdvertisementDisplay({ position, className = "" }: AdvertisementDisplayProps) {
  const [dismissedAds, setDismissedAds] = useState<string[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  // Fetch ad settings
  const { data: adSettings } = useQuery({
    queryKey: ["/api/admin/ad-settings"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/ad-settings");
      return response.json();
    },
  });

  // Fetch advertisements for this position
  const { data: ads = [] } = useQuery({
    queryKey: ["/api/advertisements", position],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/advertisements");
      const allAds = await response.json();
      return allAds.filter((ad: Advertisement) => 
        ad.isActive && 
        ad.position === position && 
        !dismissedAds.includes(ad.id)
      ).sort((a: Advertisement, b: Advertisement) => b.priority - a.priority);
    },
    enabled: !!adSettings?.enableAds,
  });

  // Rotate ads every 30 seconds
  useEffect(() => {
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentAdIndex((prev) => (prev + 1) % ads.length);
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [ads.length]);

  // Track impression
  useEffect(() => {
    if (ads.length > 0 && ads[currentAdIndex]) {
      trackImpression(ads[currentAdIndex].id);
    }
  }, [currentAdIndex, ads]);

  const trackImpression = async (adId: string) => {
    try {
      await apiRequest("POST", `/api/advertisements/${adId}/impression`);
    } catch (error) {
      console.log("Failed to track impression:", error);
    }
  };

  const trackClick = async (adId: string) => {
    try {
      await apiRequest("POST", `/api/advertisements/${adId}/click`);
    } catch (error) {
      console.log("Failed to track click:", error);
    }
  };

  const handleAdClick = (ad: Advertisement) => {
    trackClick(ad.id);
    if (ad.targetUrl) {
      window.open(ad.targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDismiss = (adId: string) => {
    setDismissedAds(prev => [...prev, adId]);
    // Store in localStorage to persist across page loads
    const dismissed = JSON.parse(localStorage.getItem('dismissedAds') || '[]');
    dismissed.push(adId);
    localStorage.setItem('dismissedAds', JSON.stringify(dismissed));
  };

  // Load dismissed ads from localStorage
  useEffect(() => {
    const dismissed = JSON.parse(localStorage.getItem('dismissedAds') || '[]');
    setDismissedAds(dismissed);
  }, []);

  // Don't show ads if disabled or no ads available
  if (!adSettings?.enableAds || !ads.length) {
    return null;
  }

  // Ad count limits
  const adLimits = {
    low: 1,
    medium: 2,
    high: 3
  };

  const maxAds = adLimits[adSettings.adCount] || 1;
  const displayAds = ads.slice(0, maxAds);

  if (displayAds.length === 0) {
    return null;
  }

  const currentAd = displayAds[currentAdIndex % displayAds.length];

  // Different layouts based on position
  const getAdLayout = () => {
    switch (position) {
      case "header":
        return (
          <div className={`w-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 ${className}`}>
            <div className="container mx-auto px-4 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {currentAd.imageUrl && (
                    <img 
                      src={currentAd.imageUrl} 
                      alt={currentAd.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                  )}
                  <div>
                    <h4 className="font-medium text-sm text-gray-800">{currentAd.title}</h4>
                    <p className="text-xs text-gray-600 line-clamp-1">{currentAd.content}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {currentAd.targetUrl && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAdClick(currentAd)}
                      className="text-xs"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Learn More
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDismiss(currentAd.id)}
                    className="text-xs p-1"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      case "sidebar":
        return (
          <Card className={`p-4 ${className}`}>
            <div className="relative">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDismiss(currentAd.id)}
                className="absolute top-0 right-0 p-1 h-6 w-6"
              >
                <X className="w-3 h-3" />
              </Button>
              {currentAd.imageUrl && (
                <img 
                  src={currentAd.imageUrl} 
                  alt={currentAd.title}
                  className="w-full h-32 object-cover rounded mb-3"
                />
              )}
              <h4 className="font-semibold text-sm mb-2">{currentAd.title}</h4>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{currentAd.content}</p>
              {currentAd.targetUrl && (
                <Button
                  size="sm"
                  onClick={() => handleAdClick(currentAd)}
                  className="w-full text-xs"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Learn More
                </Button>
              )}
            </div>
          </Card>
        );

      case "content":
        return (
          <div className={`bg-amber-50 border border-amber-200 rounded-lg p-4 my-6 ${className}`}>
            <div className="flex items-start justify-between">
              <div className="flex gap-3 flex-1">
                {currentAd.imageUrl && (
                  <img 
                    src={currentAd.imageUrl} 
                    alt={currentAd.title}
                    className="w-16 h-16 rounded object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{currentAd.title}</h4>
                    <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-full">Sponsored</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{currentAd.content}</p>
                  {currentAd.targetUrl && (
                    <Button
                      size="sm"
                      onClick={() => handleAdClick(currentAd)}
                      className="text-xs"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Learn More
                    </Button>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDismiss(currentAd.id)}
                className="p-1 h-6 w-6 ml-2"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        );

      case "floating":
        return (
          <div className={`fixed bottom-4 right-4 z-50 max-w-xs ${className}`}>
            <Card className="p-4 shadow-lg">
              <div className="relative">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDismiss(currentAd.id)}
                  className="absolute top-0 right-0 p-1 h-6 w-6"
                >
                  <X className="w-3 h-3" />
                </Button>
                {currentAd.imageUrl && (
                  <img 
                    src={currentAd.imageUrl} 
                    alt={currentAd.title}
                    className="w-full h-24 object-cover rounded mb-2"
                  />
                )}
                <h4 className="font-semibold text-sm mb-1">{currentAd.title}</h4>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{currentAd.content}</p>
                {currentAd.targetUrl && (
                  <Button
                    size="sm"
                    onClick={() => handleAdClick(currentAd)}
                    className="w-full text-xs"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Learn More
                  </Button>
                )}
              </div>
            </Card>
          </div>
        );

      default:
        return (
          <div className={`border rounded-lg p-4 bg-card ${className}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {currentAd.imageUrl && (
                  <img 
                    src={currentAd.imageUrl} 
                    alt={currentAd.title}
                    className="w-12 h-12 rounded object-cover"
                  />
                )}
                <div>
                  <h4 className="font-medium text-sm">{currentAd.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-1">{currentAd.content}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {currentAd.targetUrl && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAdClick(currentAd)}
                    className="text-xs"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    View
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDismiss(currentAd.id)}
                  className="p-1 h-6 w-6"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        );
    }
  };

  return getAdLayout();
}