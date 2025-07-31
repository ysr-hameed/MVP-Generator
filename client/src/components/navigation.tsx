
import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { 
  Sparkles, 
  Menu, 
  X, 
  Home, 
  Lightbulb, 
  BookOpen, 
  MessageCircle, 
  Info,
  ChevronRight
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

export default function Navigation() {
  const [location] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fetch site settings
  const { data: siteSettings } = useQuery({
    queryKey: ["/api/site-settings"],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const siteName = siteSettings?.siteName || "MVP Generator AI";

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/mvp-generator", label: "MVP Generator", icon: Lightbulb },
    { href: "/blog", label: "Blog", icon: BookOpen },
    { href: "/about", label: "About", icon: Info },
    { href: "/contact", label: "Contact", icon: MessageCircle },
  ];

  const isActive = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  return (
    <>
      <header className="fixed top-0 w-full z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" data-testid="link-home-logo">
              <div className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <Sparkles className="w-6 h-6 text-primary" />
                <span className="text-xl font-bold logo-text">
                  {siteName}
                </span>
              </div>
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Theme toggle */}
              <ModeToggle />

              {/* Sidebar menu button */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="relative z-50"
              >
                {isSidebarOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
                <span className="sr-only">Toggle Navigation</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Right Sidebar */}
      <div className={cn(
        "fixed top-0 right-0 h-full w-80 bg-background border-l border-border z-50 transform transition-transform duration-300 ease-in-out",
        isSidebarOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-primary" />
              <span className="text-lg font-semibold logo-text">
                {siteName}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-6">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <div className={cn(
                      "flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group cursor-pointer",
                      active 
                        ? "bg-primary/10 text-primary border border-primary/20" 
                        : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                    )}>
                      <Icon className={cn(
                        "w-5 h-5 transition-colors",
                        active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                      )} />
                      <span className="font-medium text-sm flex-1">
                        {item.label}
                      </span>
                      <ChevronRight className={cn(
                        "w-4 h-4 transition-all duration-200",
                        active 
                          ? "text-primary opacity-100" 
                          : "text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1"
                      )} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-6 border-t border-border">
            <div className="text-xs text-muted-foreground text-center">
              © 2024 {siteName}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
