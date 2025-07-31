import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, ExternalLink, Zap, TrendingUp, Target, Users } from "lucide-react";

interface AdDisplayProps {
  position: 'header' | 'content' | 'footer' | 'sidebar' | 'blog-top' | 'blog-middle' | 'blog-bottom' | 'generator-top' | 'generator-bottom';
  className?: string;
}

interface AdContent {
  id: string;
  title: string;
  description: string;
  cta: string;
  url: string;
  image?: string;
  type: 'banner' | 'card' | 'native' | 'video';
  priority: number;
}

export function EnhancedAdDisplay({ position, className = "" }: AdDisplayProps) {
  const [ads, setAds] = useState<AdContent[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  // Smart ad content based on position and context
  const getContextualAds = (): AdContent[] => {
    const baseAds: AdContent[] = [
      {
        id: "mvp-generator-pro",
        title: "Supercharge Your MVP Planning",
        description: "Get detailed technical specs, budget breakdowns, and investor-ready documentation with our Pro features.",
        cta: "Upgrade to Pro",
        url: "/pricing",
        type: "card",
        priority: 10
      },
      {
        id: "startup-consultation",
        title: "Free MVP Strategy Session",
        description: "Book a 30-minute consultation with our startup experts. Get personalized advice for your business idea.",
        cta: "Book Free Session",
        url: "/consultation",
        type: "native",
        priority: 9
      },
      {
        id: "mvp-templates",
        title: "Ready-to-Use MVP Templates",
        description: "Skip the planning phase with our pre-built MVP templates for common business models and industries.",
        cta: "Browse Templates",
        url: "/templates",
        type: "card",
        priority: 8
      },
      {
        id: "startup-toolkit",
        title: "Complete Startup Toolkit",
        description: "Everything you need from idea to launch: legal docs, pitch decks, financial models, and more.",
        cta: "Get Toolkit",
        url: "/toolkit",
        type: "banner",
        priority: 7
      },
      {
        id: "community-access",
        title: "Join 10K+ Entrepreneurs",
        description: "Connect with like-minded founders, get feedback on your ideas, and access exclusive resources.",
        cta: "Join Community",
        url: "/community",
        type: "native",
        priority: 6
      },
      {
        id: "mvp-course",
        title: "MVP Mastery Course",
        description: "Learn from successful founders who built and scaled their MVPs to million-dollar businesses.",
        cta: "Start Learning",
        url: "/course",
        type: "card",
        priority: 5
      }
    ];

    // Filter and sort ads based on position
    return baseAds
      .filter(ad => !dismissed.includes(ad.id))
      .sort((a, b) => b.priority - a.priority)
      .slice(0, getAdCountForPosition(position));
  };

  const getAdCountForPosition = (pos: string): number => {
    switch (pos) {
      case 'header': return 1;
      case 'content': return 2;
      case 'sidebar': return 3;
      case 'footer': return 2;
      case 'blog-top': return 1;
      case 'blog-middle': return 1;
      case 'blog-bottom': return 2;
      case 'generator-top': return 1;
      case 'generator-bottom': return 2;
      default: return 1;
    }
  };

  const getAdStyle = () => {
    switch (position) {
      case 'header':
        return "w-full max-w-sm mx-auto";
      case 'content':
        return "w-full max-w-md mx-auto mb-6";
      case 'sidebar':
        return "w-full sticky top-4 space-y-4";
      case 'footer':
        return "w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4";
      case 'blog-top':
        return "w-full max-w-2xl mx-auto mb-8";
      case 'blog-middle':
        return "w-full max-w-md mx-auto my-8";
      case 'blog-bottom':
        return "w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 mt-8";
      case 'generator-top':
        return "w-full max-w-lg mx-auto mb-6";
      case 'generator-bottom':
        return "w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 mt-8";
      default:
        return "w-full max-w-md mx-auto";
    }
  };

  useEffect(() => {
    setAds(getContextualAds());
  }, [position, dismissed]);

  useEffect(() => {
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentAdIndex((prev) => (prev + 1) % ads.length);
      }, 8000); // Rotate every 8 seconds
      return () => clearInterval(interval);
    }
  }, [ads.length]);

  const handleDismiss = (adId: string) => {
    setDismissed(prev => [...prev, adId]);
  };

  const handleClick = (ad: AdContent) => {
    // Track ad click analytics
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page: `ad_click_${ad.id}`,
        metadata: { position, adType: ad.type }
      })
    }).catch(() => {}); // Silent fail for analytics
  };

  if (!isVisible || ads.length === 0) return null;

  const renderAd = (ad: AdContent, index: number) => {
    const isActive = index === currentAdIndex;
    
    switch (ad.type) {
      case 'banner':
        return (
          <div 
            key={ad.id}
            className={`relative bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-4 ${
              ads.length > 1 && !isActive ? 'hidden' : ''
            }`}
          >
            <button
              onClick={() => handleDismiss(ad.id)}
              className="absolute top-2 right-2 text-white/70 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">{ad.title}</h3>
                <p className="text-white/90 text-sm mt-1">{ad.description}</p>
              </div>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => handleClick(ad)}
                className="ml-4 bg-white text-blue-600 hover:bg-gray-100"
              >
                {ad.cta}
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        );

      case 'card':
        return (
          <Card 
            key={ad.id}
            className={`relative p-4 border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow ${
              ads.length > 1 && !isActive ? 'hidden' : ''
            }`}
          >
            <button
              onClick={() => handleDismiss(ad.id)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">{ad.title}</h3>
                <p className="text-gray-600 text-xs mt-1 line-clamp-2">{ad.description}</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleClick(ad)}
                  className="mt-3 text-xs h-7"
                >
                  {ad.cta}
                </Button>
              </div>
            </div>
          </Card>
        );

      case 'native':
        return (
          <div 
            key={ad.id}
            className={`relative bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 ${
              ads.length > 1 && !isActive ? 'hidden' : ''
            }`}
          >
            <Badge variant="secondary" className="absolute top-2 right-8 text-xs">
              Sponsored
            </Badge>
            <button
              onClick={() => handleDismiss(ad.id)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3 h-3" />
            </button>
            <div className="flex items-start space-x-3 mt-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Target className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-sm">{ad.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-xs mt-1">{ad.description}</p>
                <button 
                  onClick={() => handleClick(ad)}
                  className="text-blue-600 hover:text-blue-800 text-xs font-medium mt-2 inline-flex items-center"
                >
                  {ad.cta}
                  <ExternalLink className="w-3 h-3 ml-1" />
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`enhanced-ad-display ${getAdStyle()} ${className}`}>
      {position === 'sidebar' ? (
        // Sidebar shows multiple ads stacked
        ads.map((ad, index) => renderAd(ad, index))
      ) : position.includes('bottom') || position === 'footer' ? (
        // Bottom positions show ads in grid
        ads.map((ad, index) => (
          <div key={ad.id} className="flex-1">
            {renderAd(ad, index)}
          </div>
        ))
      ) : (
        // Other positions show rotating single ad
        ads.map((ad, index) => renderAd(ad, index))
      )}
      
      {ads.length > 1 && !['sidebar', 'footer'].includes(position) && (
        <div className="flex justify-center mt-2 space-x-1">
          {ads.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentAdIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentAdIndex ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}