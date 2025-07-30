import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from './use-toast';

interface User {
  username: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isTokenExpired: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const { toast } = useToast();

  // Check for existing token on app load
  useEffect(() => {
    const storedToken = localStorage.getItem('admin_token');
    const storedUser = localStorage.getItem('admin_user');
    const tokenExpiry = localStorage.getItem('token_expiry');

    if (storedToken && storedUser && tokenExpiry) {
      const expiryDate = new Date(tokenExpiry);
      const now = new Date();

      if (now < expiryDate) {
        // Token is still valid
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } else {
        // Token expired, clear storage
        logout();
        toast({
          title: "Session Expired",
          description: "Please log in again.",
          variant: "destructive",
        });
      }
    }
  }, []);

  const isTokenExpired = (): boolean => {
    const tokenExpiry = localStorage.getItem('token_expiry');
    if (!tokenExpiry) return true;
    
    const expiryDate = new Date(tokenExpiry);
    const now = new Date();
    return now >= expiryDate;
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Store token and user info for 7 days
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 7);
        
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_user', JSON.stringify(data.user));
        localStorage.setItem('token_expiry', expiryDate.toISOString());
        
        setToken(data.token);
        setUser(data.user);
        
        toast({
          title: "Login Successful",
          description: "Welcome back! Your session will last 7 days.",
        });
        
        return true;
      } else {
        const errorData = await response.json();
        toast({
          title: "Login Failed",
          description: errorData.message || "Invalid credentials",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "Network error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('token_expiry');
    setToken(null);
    setUser(null);
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  // Auto-logout when token expires
  useEffect(() => {
    if (token && isTokenExpired()) {
      logout();
    }
  }, [token]);

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!user && !!token && !isTokenExpired(),
    isTokenExpired,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}