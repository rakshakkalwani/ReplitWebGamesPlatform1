import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  avatar: text("avatar"),
  level: integer("level").default(1),
  points: integer("points").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  secondaryCategory: text("secondary_category"),
  thumbnailUrl: text("thumbnail_url").notNull(),
  isFeatured: boolean("is_featured").default(false),
  isNew: boolean("is_new").default(false),
  rating: integer("rating").default(0),
  playCount: integer("play_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull(),
  userId: integer("user_id").notNull(),
  rating: integer("rating").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const gameHistory = pgTable("game_history", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull(),
  userId: integer("user_id").notNull(),
  score: integer("score").default(0),
  playedAt: timestamp("played_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertGameSchema = createInsertSchema(games).omit({ id: true, createdAt: true });
export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, createdAt: true });
export const insertRatingSchema = createInsertSchema(ratings).omit({ id: true, createdAt: true });
export const insertGameHistorySchema = createInsertSchema(gameHistory).omit({ id: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Game = typeof games.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type Rating = typeof ratings.$inferSelect;
export type InsertRating = z.infer<typeof insertRatingSchema>;

export type GameHistory = typeof gameHistory.$inferSelect;
export type InsertGameHistory = z.infer<typeof insertGameHistorySchema>;

// Category type for frontend
export const gameCategories = [
  { id: "puzzle", name: "Puzzle", count: 42, icon: "puzzle", color: "indigo" },
  { id: "arcade", name: "Arcade", count: 38, icon: "play-circle", color: "pink" },
  { id: "adventure", name: "Adventure", count: 29, icon: "globe", color: "emerald" },
  { id: "action", name: "Action", count: 35, icon: "flame", color: "red" },
  { id: "multiplayer", name: "Multiplayer", count: 27, icon: "users", color: "violet" },
  { id: "fast-paced", name: "Fast-Paced", count: 31, icon: "zap", color: "amber" }
];

export type GameCategory = (typeof gameCategories)[number];
