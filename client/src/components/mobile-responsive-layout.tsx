import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MobileResponsiveLayoutProps {
  children: ReactNode;
  className?: string;
}

export function MobileResponsiveLayout({ children, className }: MobileResponsiveLayoutProps) {
  return (
    <div className={cn(
      // Base layout
      "min-h-screen w-full",
      // Mobile optimizations
      "px-4 sm:px-6 lg:px-8",
      "py-4 sm:py-6 lg:py-8",
      // Responsive spacing
      "space-y-4 sm:space-y-6 lg:space-y-8",
      className
    )}>
      {children}
    </div>
  );
}

interface ResponsiveGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function ResponsiveGrid({ children, columns = 1, className }: ResponsiveGridProps) {
  const gridClasses = {
    1: "grid grid-cols-1",
    2: "grid grid-cols-1 md:grid-cols-2",
    3: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
  };

  return (
    <div className={cn(
      gridClasses[columns],
      "gap-4 sm:gap-6",
      className
    )}>
      {children}
    </div>
  );
}

interface ResponsiveCardProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveCard({ children, className }: ResponsiveCardProps) {
  return (
    <div className={cn(
      // Base card styling
      "bg-card text-card-foreground rounded-lg border shadow-sm",
      // Mobile optimizations
      "p-4 sm:p-6",
      // Responsive spacing
      "space-y-3 sm:space-y-4",
      className
    )}>
      {children}
    </div>
  );
}

interface ResponsiveTextProps {
  children: ReactNode;
  variant?: "heading" | "subheading" | "body" | "small";
  className?: string;
}

export function ResponsiveText({ children, variant = "body", className }: ResponsiveTextProps) {
  const variants = {
    heading: "text-2xl sm:text-3xl lg:text-4xl font-bold",
    subheading: "text-lg sm:text-xl lg:text-2xl font-semibold",
    body: "text-sm sm:text-base",
    small: "text-xs sm:text-sm"
  };

  return (
    <div className={cn(variants[variant], className)}>
      {children}
    </div>
  );
}

interface ResponsiveButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
}

export function ResponsiveButton({ 
  children, 
  onClick, 
  variant = "default", 
  size = "md", 
  className,
  disabled = false 
}: ResponsiveButtonProps) {
  const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
  
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-input hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground"
  };

  const sizes = {
    sm: "h-8 px-3 text-xs sm:h-9 sm:px-4 sm:text-sm",
    md: "h-9 px-4 text-sm sm:h-10 sm:px-6 sm:text-base",
    lg: "h-10 px-6 text-base sm:h-11 sm:px-8 sm:text-lg"
  };

  return (
    <button
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        // Mobile touch optimizations
        "touch-manipulation",
        // Ensure minimum touch target size
        "min-h-[44px] min-w-[44px]",
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

interface ResponsiveInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: "text" | "email" | "password" | "number";
  className?: string;
  disabled?: boolean;
}

export function ResponsiveInput({ 
  placeholder, 
  value, 
  onChange, 
  type = "text", 
  className,
  disabled = false 
}: ResponsiveInputProps) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      className={cn(
        // Base styling
        "flex w-full rounded-md border border-input bg-transparent ring-offset-background",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        // Mobile optimizations
        "px-3 py-2 text-sm sm:px-4 sm:py-3 sm:text-base",
        // Ensure minimum touch target
        "min-h-[44px]",
        // Prevent zoom on iOS
        "text-base sm:text-sm",
        className
      )}
    />
  );
}

interface ResponsiveModalProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  className?: string;
}

export function ResponsiveModal({ children, isOpen, onClose, title, className }: ResponsiveModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-lg">
        <div className={cn(
          "bg-background p-6 shadow-lg border rounded-lg",
          // Mobile optimizations
          "mx-4 sm:mx-0",
          "max-h-[90vh] overflow-y-auto",
          className
        )}>
          {title && (
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{title}</h2>
              <button
                onClick={onClose}
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <span className="sr-only">Close</span>
                ✕
              </button>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}