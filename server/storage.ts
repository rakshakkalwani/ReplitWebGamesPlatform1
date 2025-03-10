import { 
  User, InsertUser, 
  Game, InsertGame, 
  Comment, InsertComment, 
  Rating, InsertRating, 
  GameHistory, InsertGameHistory,
  gameCategories 
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPoints(userId: number, points: number): Promise<User | undefined>;
  getTopPlayers(limit: number): Promise<User[]>;
  
  // Games
  getGames(): Promise<Game[]>;
  getGame(id: number): Promise<Game | undefined>;
  getGamesByCategory(category: string): Promise<Game[]>;
  getFeaturedGames(): Promise<Game[]>;
  getNewGames(): Promise<Game[]>;
  getPopularGames(limit: number): Promise<Game[]>;
  createGame(game: InsertGame): Promise<Game>;
  updateGamePlayCount(gameId: number): Promise<Game | undefined>;
  
  // Comments
  getCommentsByGame(gameId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  
  // Ratings
  getRatingsByGame(gameId: number): Promise<Rating[]>;
  createRating(rating: InsertRating): Promise<Rating>;
  
  // Game History
  getGameHistoryByUser(userId: number): Promise<GameHistory[]>;
  createGameHistory(history: InsertGameHistory): Promise<GameHistory>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private games: Map<number, Game>;
  private comments: Map<number, Comment>;
  private ratings: Map<number, Rating>;
  private gameHistory: Map<number, GameHistory>;
  
  private userIdCounter: number = 1;
  private gameIdCounter: number = 1;
  private commentIdCounter: number = 1;
  private ratingIdCounter: number = 1;
  private gameHistoryIdCounter: number = 1;

  constructor() {
    this.users = new Map();
    this.games = new Map();
    this.comments = new Map();
    this.ratings = new Map();
    this.gameHistory = new Map();
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserPoints(userId: number, points: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    user.points += points;
    // Level up logic (simplified)
    user.level = Math.floor(user.points / 1000) + 1;
    
    this.users.set(userId, user);
    return user;
  }
  
  async getTopPlayers(limit: number): Promise<User[]> {
    return Array.from(this.users.values())
      .sort((a, b) => b.points - a.points)
      .slice(0, limit);
  }
  
  // Game methods
  async getGames(): Promise<Game[]> {
    return Array.from(this.games.values());
  }
  
  async getGame(id: number): Promise<Game | undefined> {
    return this.games.get(id);
  }
  
  async getGamesByCategory(category: string): Promise<Game[]> {
    return Array.from(this.games.values()).filter(
      (game) => game.category === category || game.secondaryCategory === category
    );
  }
  
  async getFeaturedGames(): Promise<Game[]> {
    return Array.from(this.games.values()).filter(game => game.isFeatured);
  }
  
  async getNewGames(): Promise<Game[]> {
    return Array.from(this.games.values())
      .filter(game => game.isNew)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }
  
  async getPopularGames(limit: number): Promise<Game[]> {
    return Array.from(this.games.values())
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, limit);
  }
  
  async createGame(insertGame: InsertGame): Promise<Game> {
    const id = this.gameIdCounter++;
    const now = new Date();
    const game: Game = { ...insertGame, id, createdAt: now };
    this.games.set(id, game);
    return game;
  }
  
  async updateGamePlayCount(gameId: number): Promise<Game | undefined> {
    const game = await this.getGame(gameId);
    if (!game) return undefined;
    
    game.playCount += 1;
    this.games.set(gameId, game);
    return game;
  }
  
  // Comment methods
  async getCommentsByGame(gameId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.gameId === gameId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }
  
  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = this.commentIdCounter++;
    const now = new Date();
    const comment: Comment = { ...insertComment, id, createdAt: now };
    this.comments.set(id, comment);
    return comment;
  }
  
  // Rating methods
  async getRatingsByGame(gameId: number): Promise<Rating[]> {
    return Array.from(this.ratings.values()).filter(rating => rating.gameId === gameId);
  }
  
  async createRating(insertRating: InsertRating): Promise<Rating> {
    // Check if user already rated this game
    const existingRating = Array.from(this.ratings.values()).find(
      r => r.gameId === insertRating.gameId && r.userId === insertRating.userId
    );
    
    if (existingRating) {
      // Update existing rating
      existingRating.rating = insertRating.rating;
      this.ratings.set(existingRating.id, existingRating);
      return existingRating;
    }
    
    // Create new rating
    const id = this.ratingIdCounter++;
    const now = new Date();
    const rating: Rating = { ...insertRating, id, createdAt: now };
    this.ratings.set(id, rating);
    
    // Update game's overall rating
    this.updateGameRating(insertRating.gameId);
    
    return rating;
  }
  
  // Game History methods
  async getGameHistoryByUser(userId: number): Promise<GameHistory[]> {
    return Array.from(this.gameHistory.values())
      .filter(history => history.userId === userId)
      .sort((a, b) => (b.playedAt?.getTime() || 0) - (a.playedAt?.getTime() || 0));
  }
  
  async createGameHistory(insertHistory: InsertGameHistory): Promise<GameHistory> {
    const id = this.gameHistoryIdCounter++;
    const history: GameHistory = { ...insertHistory, id };
    this.gameHistory.set(id, history);
    return history;
  }
  
  // Helper methods
  private async updateGameRating(gameId: number): Promise<void> {
    const game = await this.getGame(gameId);
    if (!game) return;
    
    const ratings = await this.getRatingsByGame(gameId);
    if (ratings.length === 0) return;
    
    // Calculate average rating (0-5 scale)
    const totalRating = ratings.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = Math.round(totalRating / ratings.length);
    
    game.rating = averageRating;
    this.games.set(gameId, game);
  }
  
  // Initialize with sample data
  private initializeSampleData(): void {
    // Sample users
    const sampleUsers: InsertUser[] = [
      { username: "JediMaster", password: "password", email: "jedi@example.com", avatar: "JD", level: 42, points: 9845 },
      { username: "PixelPro", password: "password", email: "pixel@example.com", avatar: "PP", level: 39, points: 8732 },
      { username: "GameWizard", password: "password", email: "wizard@example.com", avatar: "GW", level: 37, points: 7914 },
      { username: "NinjaSlayer", password: "password", email: "ninja@example.com", avatar: "NS", level: 34, points: 7156 },
      { username: "RocketPower", password: "password", email: "rocket@example.com", avatar: "RP", level: 31, points: 6873 }
    ];
    
    sampleUsers.forEach(user => this.createUser(user));
    
    // Sample games
    const sampleGames: InsertGame[] = [
      {
        title: "Speed Racer",
        description: "Race against time in this high-speed arcade game",
        category: "arcade",
        secondaryCategory: "fast-paced",
        thumbnailUrl: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
        isFeatured: true,
        isNew: false,
        rating: 5,
        playCount: 3254
      },
      {
        title: "Mind Puzzler",
        description: "Challenge your brain with intricate puzzles",
        category: "puzzle",
        thumbnailUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
        isFeatured: false,
        isNew: true,
        rating: 5,
        playCount: 2198
      },
      {
        title: "Quest Heroes",
        description: "Embark on an epic journey of adventure",
        category: "adventure",
        thumbnailUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
        isFeatured: false,
        isNew: false,
        rating: 5,
        playCount: 1876
      },
      {
        title: "Battle Royale",
        description: "Compete in this intense connection-based battle game",
        category: "strategy",
        secondaryCategory: "multiplayer",
        thumbnailUrl: "https://images.unsplash.com/photo-1517957754642-2870518e16f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
        isFeatured: true,
        isNew: true,
        rating: 5,
        playCount: 4567
      },
      {
        title: "Pixel Runner",
        description: "Run through a pixel world avoiding obstacles",
        category: "arcade",
        secondaryCategory: "action",
        thumbnailUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80",
        isFeatured: false,
        isNew: false,
        rating: 5,
        playCount: 4982
      },
      {
        title: "Cube Crush",
        description: "Match cubes to clear the board in this addictive puzzle game",
        category: "puzzle",
        secondaryCategory: "fast-paced",
        thumbnailUrl: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80",
        isFeatured: false,
        isNew: false,
        rating: 5,
        playCount: 3782
      },
      {
        title: "Zombie Defense",
        description: "Defend your base against zombie hordes",
        category: "action",
        secondaryCategory: "strategy",
        thumbnailUrl: "https://images.unsplash.com/photo-1517957754642-2870518e16f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80",
        isFeatured: false,
        isNew: false,
        rating: 5,
        playCount: 2965
      },
      {
        title: "Star Explorer",
        description: "Explore the universe in this space adventure game",
        category: "adventure",
        secondaryCategory: "puzzle",
        thumbnailUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80",
        isFeatured: false,
        isNew: true,
        rating: 5,
        playCount: 1243
      },
      {
        title: "Candy Blast",
        description: "Match candies to score points and complete levels",
        category: "puzzle",
        secondaryCategory: "fast-paced",
        thumbnailUrl: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80",
        isFeatured: false,
        isNew: true,
        rating: 5,
        playCount: 2567
      },
      {
        title: "Word Masters",
        description: "Test your vocabulary in this challenging word game",
        category: "puzzle",
        thumbnailUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80",
        isFeatured: false,
        isNew: true,
        rating: 4,
        playCount: 1879
      }
    ];
    
    sampleGames.forEach(game => this.createGame(game));
    
    // Sample comments
    const sampleComments: InsertComment[] = [
      { gameId: 1, userId: 1, content: "This game is awesome! I love the speed and graphics." },
      { gameId: 1, userId: 2, content: "Great gameplay but could use more levels." },
      { gameId: 2, userId: 3, content: "Very challenging puzzles, kept me entertained for hours." },
      { gameId: 3, userId: 4, content: "The storyline is amazing, can't wait for more content." },
      { gameId: 4, userId: 5, content: "Best multiplayer game on the platform!" }
    ];
    
    sampleComments.forEach(comment => this.createComment(comment));
    
    // Sample ratings
    const sampleRatings: InsertRating[] = [
      { gameId: 1, userId: 1, rating: 5 },
      { gameId: 1, userId: 2, rating: 4 },
      { gameId: 2, userId: 3, rating: 5 },
      { gameId: 3, userId: 4, rating: 5 },
      { gameId: 4, userId: 5, rating: 5 }
    ];
    
    sampleRatings.forEach(rating => this.createRating(rating));
    
    // Sample game history
    const sampleHistory: InsertGameHistory[] = [
      { gameId: 1, userId: 1, score: 5280, playedAt: new Date(Date.now() - 1000 * 60 * 60 * 2) },
      { gameId: 2, userId: 1, score: 12450, playedAt: new Date(Date.now() - 1000 * 60 * 60 * 24) },
      { gameId: 3, userId: 2, score: 8760, playedAt: new Date(Date.now() - 1000 * 60 * 60 * 3) },
      { gameId: 4, userId: 3, score: 4500, playedAt: new Date(Date.now() - 1000 * 60 * 60 * 5) },
      { gameId: 1, userId: 4, score: 6200, playedAt: new Date(Date.now() - 1000 * 60 * 60 * 12) }
    ];
    
    sampleHistory.forEach(history => this.createGameHistory(history));
  }
}

export const storage = new MemStorage();
