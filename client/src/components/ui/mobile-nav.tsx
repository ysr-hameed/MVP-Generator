import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X, Home, Lightbulb, BookOpen, MessageCircle, Info, Settings } from "lucide-react";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/mvp-generator", label: "MVP Generator", icon: Lightbulb },
    { href: "/blog", label: "Blog", icon: BookOpen },
    { href: "/about", label: "About", icon: Info },
    { href: "/contact", label: "Contact", icon: MessageCircle },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="md:hidden"
          size="icon"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle className="text-left">MVP Generator AI</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col space-y-4 mt-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
              >
                <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? "bg-primary text-white" 
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}>
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
          
          <div className="border-t pt-4 mt-6">
            <Link href="/admin">
              <div className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <Settings className="h-5 w-5" />
                <span className="font-medium">Admin Panel</span>
              </div>
            </Link>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}