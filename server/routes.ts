import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertCommentSchema, insertRatingSchema, insertGameHistorySchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import path from "path";
import express from "express";
import fs from "fs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve the data directory and other static files
  app.use('/data', express.static(path.join(process.cwd(), 'public', 'data')));
  
  // Special handling for game files
  app.use('/games', express.static(path.join(process.cwd(), 'public', 'games')));
  
  // Error handler middleware for zod validation errors
  const handleZodError = (err: unknown, res: Response) => {
    if (err instanceof ZodError) {
      const validationError = fromZodError(err);
      return res.status(400).json({ message: validationError.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  };

  // User routes
  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send password to client
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      const user = await storage.createUser(userData);
      
      // Don't send password to client
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (err) {
      console.error(err);
      handleZodError(err, res);
    }
  });

  app.get("/api/leaderboard", async (_req: Request, res: Response) => {
    try {
      const topPlayers = await storage.getTopPlayers(10);
      
      // Don't send passwords to client
      const safeUsers = topPlayers.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(safeUsers);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to get leaderboard" });
    }
  });

  // Game routes
  app.get("/api/games", async (_req: Request, res: Response) => {
    try {
      const games = await storage.getGames();
      res.json(games);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to get games" });
    }
  });

  app.get("/api/games/featured", async (_req: Request, res: Response) => {
    try {
      const featuredGames = await storage.getFeaturedGames();
      res.json(featuredGames);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to get featured games" });
    }
  });

  app.get("/api/games/new", async (_req: Request, res: Response) => {
    try {
      const newGames = await storage.getNewGames();
      res.json(newGames);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to get new games" });
    }
  });

  app.get("/api/games/popular", async (_req: Request, res: Response) => {
    try {
      const popularGames = await storage.getPopularGames(5);
      res.json(popularGames);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to get popular games" });
    }
  });

  app.get("/api/games/category/:category", async (req: Request, res: Response) => {
    try {
      const { category } = req.params;
      const games = await storage.getGamesByCategory(category);
      res.json(games);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to get games by category" });
    }
  });

  app.get("/api/games/:id", async (req: Request, res: Response) => {
    try {
      const gameId = parseInt(req.params.id);
      const game = await storage.getGame(gameId);
      
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      res.json(game);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to get game" });
    }
  });

  app.post("/api/games/:id/play", async (req: Request, res: Response) => {
    try {
      const gameId = parseInt(req.params.id);
      const game = await storage.updateGamePlayCount(gameId);
      
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      // Optional: record game history if user is logged in
      if (req.body.userId) {
        const gameHistory = insertGameHistorySchema.parse({
          gameId,
          userId: req.body.userId,
          score: req.body.score || 0
        });
        
        await storage.createGameHistory(gameHistory);
        
        // Award points to user based on score
        if (req.body.score > 0) {
          const pointsToAdd = Math.floor(req.body.score / 100);
          await storage.updateUserPoints(req.body.userId, pointsToAdd);
        }
      }
      
      res.json(game);
    } catch (err) {
      console.error(err);
      handleZodError(err, res);
    }
  });

  // Comment routes
  app.get("/api/games/:id/comments", async (req: Request, res: Response) => {
    try {
      const gameId = parseInt(req.params.id);
      const comments = await storage.getCommentsByGame(gameId);
      res.json(comments);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to get comments" });
    }
  });

  app.post("/api/games/:id/comments", async (req: Request, res: Response) => {
    try {
      const gameId = parseInt(req.params.id);
      
      // Validate game exists
      const game = await storage.getGame(gameId);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      const commentData = insertCommentSchema.parse({
        ...req.body,
        gameId
      });
      
      const comment = await storage.createComment(commentData);
      res.status(201).json(comment);
    } catch (err) {
      console.error(err);
      handleZodError(err, res);
    }
  });

  // Rating routes
  app.post("/api/games/:id/rate", async (req: Request, res: Response) => {
    try {
      const gameId = parseInt(req.params.id);
      
      // Validate game exists
      const game = await storage.getGame(gameId);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      const ratingData = insertRatingSchema.parse({
        ...req.body,
        gameId
      });
      
      const rating = await storage.createRating(ratingData);
      res.status(201).json(rating);
    } catch (err) {
      console.error(err);
      handleZodError(err, res);
    }
  });

  // User game history
  app.get("/api/users/:id/history", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Validate user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const history = await storage.getGameHistoryByUser(userId);
      res.json(history);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to get game history" });
    }
  });

  // Catch-all route to handle direct access to client routes
  // This should be placed after all API routes but before creating the server
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return next();
    }
    
    // Serve the main index.html for all client-side routes
    const indexPath = path.join(process.cwd(), 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
    next();
  });

  const httpServer = createServer(app);
  return httpServer;
}
