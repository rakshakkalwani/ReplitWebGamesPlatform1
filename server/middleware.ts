import type { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";

// Middleware to properly set MIME types for JavaScript modules
export function fixMimeTypes(req: Request, res: Response, next: NextFunction) {
  if (req.path.endsWith('.js') || req.path.endsWith('.mjs') || req.path.endsWith('.tsx')) {
    res.type('application/javascript');
  } else if (req.path.endsWith('.css')) {
    res.type('text/css');
  } else if (req.path.endsWith('.html')) {
    res.type('text/html');
  } else if (req.path.endsWith('.json')) {
    res.type('application/json');
  }
  next();
}

// Middleware to handle client-side routing for SPAs
export function spaFallback(req: Request, res: Response, next: NextFunction) {
  // Skip API routes and static file routes
  if (req.path.startsWith('/api/') || 
      req.path.includes('.') || 
      req.path.startsWith('/assets/') || 
      req.path.startsWith('/data/') || 
      req.path.startsWith('/games/')) {
    return next();
  }
  
  // Send the main index.html for all client routes
  const indexPath = path.resolve(process.cwd(), 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  
  next();
}