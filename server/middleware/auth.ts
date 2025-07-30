import { Request, Response, NextFunction } from "express";

export interface AuthenticatedRequest extends Request {
  isAuthenticated?: boolean;
}

export const adminAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { username, password } = req.body;
  
  // Check against environment variables
  const adminUser = process.env.ADMIN_USER || "admin";
  const adminPass = process.env.ADMIN_PASS || "admin123";
  
  if (username === adminUser && password === adminPass) {
    req.isAuthenticated = true;
    // Set session
    (req.session as any).isAdmin = true;
    next();
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
};

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if ((req.session as any)?.isAdmin) {
    next();
  } else {
    res.status(401).json({ message: "Admin access required" });
  }
};
