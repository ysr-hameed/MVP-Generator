
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      // Check if token is expired
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isExpired = payload.exp * 1000 < Date.now();
        
        if (isExpired) {
          localStorage.removeItem('adminToken');
          setIsAuthenticated(false);
          return;
        }
        
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('adminToken');
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  const logout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    setLocation('/admin/login');
  };

  return { isAuthenticated, logout };
}
