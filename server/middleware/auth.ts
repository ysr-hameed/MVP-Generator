
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  isAuthenticated?: boolean;
  user?: {
    username: string;
    isAdmin: boolean;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || "mvp-generator-secret-key";
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "admin123";

export const generateToken = (username: string): string => {
  return jwt.sign(
    { username, isAdmin: true },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const adminAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { username, password } = req.body;
  
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = generateToken(username);
    req.isAuthenticated = true;
    req.user = { username, isAdmin: true };
    
    // Store admin session in database
    const { storage } = await import("../storage");
    await storage.setSetting('admin_session', {
      username,
      token,
      loginTime: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });
    
    // Set session and return token
    (req.session as any).isAdmin = true;
    (req.session as any).token = token;
    
    res.json({ 
      success: true, 
      token,
      user: { username, isAdmin: true }
    });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
};

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || (req.session as any)?.token;
  
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  
  const decoded = verifyToken(token);
  if (!decoded || !decoded.isAdmin) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
  
  req.user = decoded;
  req.isAuthenticated = true;
  next();
};
