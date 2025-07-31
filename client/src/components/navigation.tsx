import React from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Sparkles, Menu, X } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

export default function Navigation() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fetch site settings
  const { data: siteSettings } = useQuery({
    queryKey: ["/api/site-settings"],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const siteName = siteSettings?.siteName || "MVP Generator AI";

  return (
    <header className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" data-testid="link-home-logo">
            <div className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Sparkles className="w-6 h-6 text-blue-400" />
              <span className="text-xl font-bold gradient-text">
                {siteName}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {/* Add navigation items here */}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Theme toggle */}
            <ModeToggle />

            {/* Mobile menu button */}
            <Button
              variant="outline"
              size="icon"
              className="ml-auto md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="border-b border-border md:hidden">
          <div className="mx-6 py-2 flex flex-col gap-3">
            <Link href="/">
              <div className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <Sparkles className="w-6 h-6 text-blue-400" />
                <span className="text-xl font-bold gradient-text">
                  {siteName}
                </span>
              </div>
            </Link>
            {/* Add mobile navigation items here */}
          </div>
        </div>
      )}
    </header>
  );
}