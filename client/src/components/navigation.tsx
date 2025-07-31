import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { 
  Menu, 
  X, 
  Home, 
  Sparkles, 
  FileText, 
  Mail, 
  Info,
  Settings,
  BarChart3
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Navigation() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAdmin } = useAuth();

  const { data: siteConfig } = useQuery({
    queryKey: ["/api/admin/site-config"],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const siteName = siteConfig?.siteName || "MVP Generator AI";

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
              <Link href="/" onClick={() => setIsSidebarOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </Button>
              </Link>
              <Link href="/mvp-generator" onClick={() => setIsSidebarOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <Sparkles className="mr-2 h-4 w-4" />
                  MVP Generator
                </Button>
              </Link>
              <Link href="/blog" onClick={() => setIsSidebarOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Blog
                </Button>
              </Link>
              <Link href="/contact" onClick={() => setIsSidebarOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact
                </Button>
              </Link>
              <Link href="/about" onClick={() => setIsSidebarOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <Info className="mr-2 h-4 w-4" />
                  About
                </Button>
              </Link>
              {isAdmin && (
                <Link href="/admin" onClick={() => setIsSidebarOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    Admin
                  </Button>
                </Link>
              )}
              {isAdmin && (
                <Link href="/admin/analytics" onClick={() => setIsSidebarOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Analytics
                  </Button>
                </Link>
              )}
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