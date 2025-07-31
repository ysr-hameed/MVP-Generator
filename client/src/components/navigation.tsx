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
            <Link href="/mvp-generator">
              <Button variant="ghost" className="text-sm">
                MVP Generator
              </Button>
            </Link>
            <Link href="/blog">
              <Button variant="ghost" className="text-sm">
                Blog
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="ghost" className="text-sm">
                About
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="ghost" className="text-sm">
                Contact
              </Button>
            </Link>
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
          <div className="mx-6 py-4 flex flex-col gap-4">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start text-sm">
                Home
              </Button>
            </Link>
            <Link href="/mvp-generator" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start text-sm">
                MVP Generator
              </Button>
            </Link>
            <Link href="/blog" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start text-sm">
                Blog
              </Button>
            </Link>
            <Link href="/about" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start text-sm">
                About
              </Button>
            </Link>
            <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start text-sm">
                Contact
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}