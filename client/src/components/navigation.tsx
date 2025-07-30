import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import MobileNav from "@/components/ui/mobile-nav";
import { Lightbulb } from "lucide-react";

export function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/mvp-generator", label: "MVP Generator" },
    { href: "/blog", label: "Blog" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto container-padding">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" data-testid="link-home-logo">
            <div className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">MVP Generator AI</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <span 
                  className={`nav-link ${
                    location === item.href ? "text-primary bg-primary/10" : "text-muted-foreground"
                  }`}
                  data-testid={`nav-link-${item.label.toLowerCase()}`}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <ModeToggle />
            <div className="hidden md:block">
              <Link href="/mvp-generator">
                <Button className="btn-primary" data-testid="button-get-started">
                  Get Started
                </Button>
              </Link>
            </div>
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}