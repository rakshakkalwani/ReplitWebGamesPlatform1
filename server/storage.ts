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
    
    user.points = (user.points || 0) + points;
    // Level up logic (simplified)
    user.level = Math.floor((user.points || 0) / 1000) + 1;
    
    this.users.set(userId, user);
    return user;
  }
  
  async getTopPlayers(limit: number): Promise<User[]> {
    return Array.from(this.users.values())
      .sort((a, b) => (b.points || 0) - (a.points || 0))
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
      (game) => 
        game.category.toLowerCase() === category.toLowerCase() || 
        game.secondaryCategory?.toLowerCase() === category.toLowerCase()
    );
  }
  
  async getFeaturedGames(): Promise<Game[]> {
    return Array.from(this.games.values()).filter(
      (game) => game.isFeatured
    );
  }
  
  async getNewGames(): Promise<Game[]> {
    return Array.from(this.games.values()).filter(
      (game) => game.isNew
    );
  }
  
  async getPopularGames(limit: number): Promise<Game[]> {
    return Array.from(this.games.values())
      .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
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
    
    game.playCount = (game.playCount || 0) + 1;
    this.games.set(gameId, game);
    return game;
  }

  // Comment methods
  async getCommentsByGame(gameId: number): Promise<Comment[]> {
    return Array.from(this.comments.values()).filter(
      (comment) => comment.gameId === gameId
    );
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
    return Array.from(this.ratings.values()).filter(
      (rating) => rating.gameId === gameId
    );
  }
  
  async createRating(insertRating: InsertRating): Promise<Rating> {
    const id = this.ratingIdCounter++;
    const now = new Date();
    const rating: Rating = { ...insertRating, id, createdAt: now };
    this.ratings.set(id, rating);
    
    // Update game average rating
    this.updateGameRating(insertRating.gameId);
    
    return rating;
  }

  // Game History methods
  async getGameHistoryByUser(userId: number): Promise<GameHistory[]> {
    return Array.from(this.gameHistory.values()).filter(
      (history) => history.userId === userId
    );
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
    const totalRating = ratings.reduce((sum, r) => sum + (r.rating || 0), 0);
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
    
    // Game entries from directory scan
    const allGames = [
  {
    "title": "Alpha Balls",
    "description": "Dive into this engaging board game and test your skills!",
    "category": "adventure",
    "secondaryCategory": "arcade",
    "thumbnailUrl": "https://images.unsplash.com/photo-1520642413789-218e04661ad2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": true,
    "isNew": true,
    "rating": 5,
    "playCount": 3032
  },
  {
    "title": "Basket Slide",
    "description": "Dive into this entertaining adventure game and test your skills!",
    "category": "action",
    "secondaryCategory": "casual",
    "thumbnailUrl": "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": true,
    "isNew": true,
    "rating": 5,
    "playCount": 1351
  },
  {
    "title": "Blocks 8",
    "description": "Play this entertaining adventure game and test your skills!",
    "category": "sports",
    "secondaryCategory": "racing",
    "thumbnailUrl": "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": false,
    "rating": 5,
    "playCount": 1500
  },
  {
    "title": "Blocky 360",
    "description": "Challenge yourself with this challenging board game and test your skills!",
    "category": "racing",
    "secondaryCategory": "puzzle",
    "thumbnailUrl": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": true,
    "rating": 5,
    "playCount": 2259
  },
  {
    "title": "Blue Block",
    "description": "Play this engaging puzzle game and test your skills!",
    "category": "puzzle",
    "secondaryCategory": "educational",
    "thumbnailUrl": "https://images.unsplash.com/photo-1626170733248-39b929943827?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": true,
    "rating": 4,
    "playCount": 5540
  },
  {
    "title": "Bounce",
    "description": "Bounce your way through challenging levels with physics-based gameplay",
    "category": "action",
    "secondaryCategory": "arcade",
    "thumbnailUrl": "https://images.unsplash.com/photo-1520642413789-218e04661ad2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": true,
    "isNew": false,
    "rating": 4,
    "playCount": 5298
  },
  {
    "title": "Bridges",
    "description": "Build bridges to connect islands and solve tricky puzzles",
    "category": "strategy",
    "secondaryCategory": "board",
    "thumbnailUrl": "https://images.unsplash.com/photo-1517957754642-2870518e16f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": true,
    "isNew": false,
    "rating": 4,
    "playCount": 3496
  },
  {
    "title": "Cards 2048",
    "description": "Enjoy this fun puzzle game and test your skills!",
    "category": "card",
    "secondaryCategory": "board",
    "thumbnailUrl": "https://images.unsplash.com/photo-1626170733248-39b929943827?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": true,
    "isNew": false,
    "rating": 4,
    "playCount": 1255
  },
  {
    "title": "Circle_ S",
    "description": "Dive into this engaging casual game and test your skills!",
    "category": "card",
    "secondaryCategory": "action",
    "thumbnailUrl": "https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": false,
    "rating": 5,
    "playCount": 1532
  },
  {
    "title": "Color Strings",
    "description": "Experience this challenging card game and test your skills!",
    "category": "action",
    "secondaryCategory": "board",
    "thumbnailUrl": "https://images.unsplash.com/photo-1517957754642-2870518e16f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": true,
    "isNew": false,
    "rating": 4,
    "playCount": 4182
  },
  {
    "title": "Colored Bricks",
    "description": "Enjoy this challenging casual game and test your skills!",
    "category": "puzzle",
    "secondaryCategory": "adventure",
    "thumbnailUrl": "https://images.unsplash.com/photo-1517957754642-2870518e16f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": true,
    "isNew": false,
    "rating": 4,
    "playCount": 5737
  },
  {
    "title": "Connect Me",
    "description": "Experience this entertaining multiplayer game and test your skills!",
    "category": "puzzle",
    "secondaryCategory": "board",
    "thumbnailUrl": "https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": false,
    "rating": 5,
    "playCount": 3568
  },
  {
    "title": "Connect Merge",
    "description": "Experience this challenging educational game and test your skills!",
    "category": "puzzle",
    "secondaryCategory": "strategy",
    "thumbnailUrl": "https://images.unsplash.com/photo-1614681817039-bc3e5b650321?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": false,
    "rating": 4,
    "playCount": 5045
  },
  {
    "title": "Cross Path",
    "description": "Experience this entertaining racing game and test your skills!",
    "category": "racing",
    "secondaryCategory": "arcade",
    "thumbnailUrl": "https://images.unsplash.com/photo-1614681817039-bc3e5b650321?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": false,
    "rating": 4,
    "playCount": 3929
  },
  {
    "title": "Cube Jump",
    "description": "Experience this entertaining card game and test your skills!",
    "category": "adventure",
    "secondaryCategory": "strategy",
    "thumbnailUrl": "https://images.unsplash.com/photo-1517957754642-2870518e16f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": false,
    "rating": 4,
    "playCount": 5062
  },
  {
    "title": "Dino Bubbles",
    "description": "Play this exciting educational game and test your skills!",
    "category": "adventure",
    "secondaryCategory": "sports",
    "thumbnailUrl": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": true,
    "isNew": false,
    "rating": 4,
    "playCount": 1406
  },
  {
    "title": "Disk Rush",
    "description": "Play this engaging strategy game and test your skills!",
    "category": "adventure",
    "secondaryCategory": "educational",
    "thumbnailUrl": "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": true,
    "isNew": false,
    "rating": 4,
    "playCount": 2191
  },
  {
    "title": "Donut Box",
    "description": "Play this addictive arcade game and test your skills!",
    "category": "multiplayer",
    "secondaryCategory": "casual",
    "thumbnailUrl": "https://images.unsplash.com/photo-1626170733248-39b929943827?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": true,
    "rating": 5,
    "playCount": 2986
  },
  {
    "title": "Dotted Fill",
    "description": "Challenge yourself with this entertaining racing game and test your skills!",
    "category": "board",
    "secondaryCategory": "racing",
    "thumbnailUrl": "https://images.unsplash.com/photo-1626170733248-39b929943827?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": true,
    "rating": 5,
    "playCount": 2805
  },
  {
    "title": "Draw In",
    "description": "Enjoy this entertaining sports game and test your skills!",
    "category": "multiplayer",
    "secondaryCategory": "racing",
    "thumbnailUrl": "https://images.unsplash.com/photo-1626170733248-39b929943827?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": false,
    "rating": 4,
    "playCount": 2184
  },
  {
    "title": "Drifter",
    "description": "Dive into this challenging card game and test your skills!",
    "category": "adventure",
    "secondaryCategory": "card",
    "thumbnailUrl": "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": false,
    "rating": 5,
    "playCount": 5255
  },
  {
    "title": "Emoji Puzzle",
    "description": "Play this addictive adventure game and test your skills!",
    "category": "arcade",
    "secondaryCategory": "casual",
    "thumbnailUrl": "https://images.unsplash.com/photo-1517957754642-2870518e16f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": false,
    "rating": 4,
    "playCount": 2513
  },
  {
    "title": "Equalz",
    "description": "Play this fun card game and test your skills!",
    "category": "sports",
    "secondaryCategory": "educational",
    "thumbnailUrl": "https://images.unsplash.com/photo-1626170733248-39b929943827?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": false,
    "rating": 4,
    "playCount": 1770
  },
  {
    "title": "Filling Lines",
    "description": "Experience this engaging educational game and test your skills!",
    "category": "arcade",
    "secondaryCategory": "racing",
    "thumbnailUrl": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": false,
    "rating": 4,
    "playCount": 2091
  },
  {
    "title": "Fire Up",
    "description": "Play this challenging action game and test your skills!",
    "category": "puzzle",
    "secondaryCategory": "adventure",
    "thumbnailUrl": "https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": true,
    "rating": 4,
    "playCount": 5536
  },
  {
    "title": "Flight Color",
    "description": "Play this exciting arcade game and test your skills!",
    "category": "arcade",
    "secondaryCategory": "puzzle",
    "thumbnailUrl": "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": false,
    "rating": 5,
    "playCount": 1019
  },
  {
    "title": "Fools Match",
    "description": "Play this exciting sports game and test your skills!",
    "category": "card",
    "secondaryCategory": "strategy",
    "thumbnailUrl": "https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": true,
    "isNew": false,
    "rating": 4,
    "playCount": 1336
  },
  {
    "title": "Fours",
    "description": "Challenge yourself with this challenging arcade game and test your skills!",
    "category": "action",
    "secondaryCategory": "racing",
    "thumbnailUrl": "https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": false,
    "rating": 4,
    "playCount": 5063
  },
  {
    "title": "Free Kick",
    "description": "Challenge yourself with this engaging sports game and test your skills!",
    "category": "adventure",
    "secondaryCategory": "puzzle",
    "thumbnailUrl": "https://images.unsplash.com/photo-1614681817039-bc3e5b650321?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": true,
    "rating": 4,
    "playCount": 1963
  },
  {
    "title": "Fruit Master",
    "description": "Play this addictive sports game and test your skills!",
    "category": "multiplayer",
    "secondaryCategory": "casual",
    "thumbnailUrl": "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": false,
    "rating": 5,
    "playCount": 3024
  },
  {
    "title": "Happy Connect",
    "description": "Experience this exciting board game and test your skills!",
    "category": "arcade",
    "secondaryCategory": "action",
    "thumbnailUrl": "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": true,
    "isNew": false,
    "rating": 4,
    "playCount": 4281
  },
  {
    "title": "Happy Glass 1",
    "description": "Enjoy this addictive board game and test your skills!",
    "category": "strategy",
    "secondaryCategory": "card",
    "thumbnailUrl": "https://images.unsplash.com/photo-1626170733248-39b929943827?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": false,
    "rating": 4,
    "playCount": 4967
  },
  {
    "title": "Happy Glass 2",
    "description": "Challenge yourself with this fun strategy game and test your skills!",
    "category": "puzzle",
    "secondaryCategory": "strategy",
    "thumbnailUrl": "https://images.unsplash.com/photo-1626170733248-39b929943827?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": false,
    "rating": 5,
    "playCount": 1066
  },
  {
    "title": "Happy Glass 3",
    "description": "Play this fun sports game and test your skills!",
    "category": "board",
    "secondaryCategory": "adventure",
    "thumbnailUrl": "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": true,
    "isNew": false,
    "rating": 4,
    "playCount": 5876
  },
  {
    "title": "House Paint",
    "description": "Play this entertaining multiplayer game and test your skills!",
    "category": "racing",
    "secondaryCategory": "educational",
    "thumbnailUrl": "https://images.unsplash.com/photo-1614681817039-bc3e5b650321?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": false,
    "rating": 4,
    "playCount": 5932
  },
  {
    "title": "Jelly Manager",
    "description": "Play this fun casual game and test your skills!",
    "category": "strategy",
    "secondaryCategory": "board",
    "thumbnailUrl": "https://images.unsplash.com/photo-1520642413789-218e04661ad2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": false,
    "rating": 5,
    "playCount": 3190
  },
  {
    "title": "Knots",
    "description": "Experience this challenging strategy game and test your skills!",
    "category": "multiplayer",
    "secondaryCategory": "adventure",
    "thumbnailUrl": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": true,
    "isNew": false,
    "rating": 5,
    "playCount": 5267
  },
  {
    "title": "Ludo",
    "description": "Play this entertaining racing game and test your skills!",
    "category": "casual",
    "secondaryCategory": "racing",
    "thumbnailUrl": "https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": true,
    "isNew": true,
    "rating": 4,
    "playCount": 1168
  },
  {
    "title": "Make 5",
    "description": "Experience this addictive adventure game and test your skills!",
    "category": "racing",
    "secondaryCategory": "card",
    "thumbnailUrl": "https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": true,
    "isNew": false,
    "rating": 4,
    "playCount": 2248
  },
  {
    "title": "Make 7",
    "description": "Enjoy this fun educational game and test your skills!",
    "category": "sports",
    "secondaryCategory": "strategy",
    "thumbnailUrl": "https://images.unsplash.com/photo-1517957754642-2870518e16f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": false,
    "rating": 4,
    "playCount": 2851
  },
  {
    "title": "Match 4",
    "description": "Dive into this addictive card game and test your skills!",
    "category": "arcade",
    "secondaryCategory": "action",
    "thumbnailUrl": "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": true,
    "rating": 4,
    "playCount": 3894
  },
  {
    "title": "Merge Face",
    "description": "Dive into this exciting strategy game and test your skills!",
    "category": "strategy",
    "secondaryCategory": "educational",
    "thumbnailUrl": "https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": false,
    "rating": 5,
    "playCount": 2811
  },
  {
    "title": "Merge Push",
    "description": "Experience this entertaining adventure game and test your skills!",
    "category": "educational",
    "secondaryCategory": "arcade",
    "thumbnailUrl": "https://images.unsplash.com/photo-1520642413789-218e04661ad2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": true,
    "isNew": true,
    "rating": 5,
    "playCount": 2278
  },
  {
    "title": "Mini Golf",
    "description": "Experience this fun puzzle game and test your skills!",
    "category": "action",
    "secondaryCategory": "sports",
    "thumbnailUrl": "https://images.unsplash.com/photo-1626170733248-39b929943827?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": false,
    "rating": 5,
    "playCount": 2112
  },
  {
    "title": "Mr Gun",
    "description": "Challenge yourself with this engaging multiplayer game and test your skills!",
    "category": "board",
    "secondaryCategory": "adventure",
    "thumbnailUrl": "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": false,
    "rating": 5,
    "playCount": 1846
  },
  {
    "title": "Node",
    "description": "Play this addictive adventure game and test your skills!",
    "category": "board",
    "secondaryCategory": "educational",
    "thumbnailUrl": "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": true,
    "isNew": false,
    "rating": 5,
    "playCount": 1257
  },
  {
    "title": "Number Maze",
    "description": "Play this engaging strategy game and test your skills!",
    "category": "racing",
    "secondaryCategory": "strategy",
    "thumbnailUrl": "https://images.unsplash.com/photo-1520642413789-218e04661ad2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": true,
    "isNew": false,
    "rating": 5,
    "playCount": 2004
  },
  {
    "title": "Omino",
    "description": "Dive into this engaging casual game and test your skills!",
    "category": "sports",
    "secondaryCategory": "board",
    "thumbnailUrl": "https://images.unsplash.com/photo-1517957754642-2870518e16f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": true,
    "isNew": false,
    "rating": 5,
    "playCount": 1187
  },
  {
    "title": "Pattern",
    "description": "Challenge yourself with this fun card game and test your skills!",
    "category": "puzzle",
    "secondaryCategory": "arcade",
    "thumbnailUrl": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": false,
    "rating": 4,
    "playCount": 1349
  },
  {
    "title": "Pixel Slide",
    "description": "Dive into this entertaining action game and test your skills!",
    "category": "adventure",
    "secondaryCategory": "multiplayer",
    "thumbnailUrl": "https://images.unsplash.com/photo-1614681817039-bc3e5b650321?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": true,
    "rating": 4,
    "playCount": 1289
  },
  {
    "title": "Plus Puzzle",
    "description": "Experience this exciting racing game and test your skills!",
    "category": "sports",
    "secondaryCategory": "arcade",
    "thumbnailUrl": "https://images.unsplash.com/photo-1517957754642-2870518e16f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": false,
    "rating": 4,
    "playCount": 5764
  },
  {
    "title": "Pool 8",
    "description": "Dive into this addictive action game and test your skills!",
    "category": "sports",
    "secondaryCategory": "strategy",
    "thumbnailUrl": "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": true,
    "isNew": false,
    "rating": 4,
    "playCount": 1042
  },
  {
    "title": "Puzzle Color",
    "description": "Challenge yourself with this challenging board game and test your skills!",
    "category": "puzzle",
    "secondaryCategory": "sports",
    "thumbnailUrl": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": false,
    "rating": 4,
    "playCount": 1232
  },
  {
    "title": "R U I N",
    "description": "Challenge yourself with this entertaining adventure game and test your skills!",
    "category": "educational",
    "secondaryCategory": "action",
    "thumbnailUrl": "https://images.unsplash.com/photo-1614681817039-bc3e5b650321?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": true,
    "isNew": false,
    "rating": 5,
    "playCount": 1366
  },
  {
    "title": "Release",
    "description": "Play this addictive educational game and test your skills!",
    "category": "multiplayer",
    "secondaryCategory": "puzzle",
    "thumbnailUrl": "https://images.unsplash.com/photo-1517957754642-2870518e16f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": true,
    "isNew": false,
    "rating": 4,
    "playCount": 5674
  },
  {
    "title": "Rolly Vortex",
    "description": "Dive into this addictive adventure game and test your skills!",
    "category": "sports",
    "secondaryCategory": "card",
    "thumbnailUrl": "https://images.unsplash.com/photo-1614681817039-bc3e5b650321?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": false,
    "rating": 4,
    "playCount": 4939
  },
  {
    "title": "Sorting Balls",
    "description": "Experience this exciting multiplayer game and test your skills!",
    "category": "puzzle",
    "secondaryCategory": "sports",
    "thumbnailUrl": "https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": true,
    "isNew": false,
    "rating": 4,
    "playCount": 1602
  },
  {
    "title": "Space Shooter",
    "description": "Enjoy this engaging card game and test your skills!",
    "category": "multiplayer",
    "secondaryCategory": "casual",
    "thumbnailUrl": "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": true,
    "rating": 5,
    "playCount": 4433
  },
  {
    "title": "Sporos",
    "description": "Play this exciting educational game and test your skills!",
    "category": "card",
    "secondaryCategory": "adventure",
    "thumbnailUrl": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": false,
    "rating": 4,
    "playCount": 3593
  },
  {
    "title": "Squ Area 1",
    "description": "Experience this addictive educational game and test your skills!",
    "category": "racing",
    "secondaryCategory": "board",
    "thumbnailUrl": "https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": true,
    "rating": 5,
    "playCount": 2924
  },
  {
    "title": "Swipe Cubes",
    "description": "Experience this challenging board game and test your skills!",
    "category": "racing",
    "secondaryCategory": "strategy",
    "thumbnailUrl": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": false,
    "rating": 4,
    "playCount": 3399
  },
  {
    "title": "Take Off",
    "description": "Dive into this entertaining racing game and test your skills!",
    "category": "educational",
    "secondaryCategory": "action",
    "thumbnailUrl": "https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": false,
    "rating": 4,
    "playCount": 5106
  },
  {
    "title": "Tangram",
    "description": "Dive into this engaging card game and test your skills!",
    "category": "sports",
    "secondaryCategory": "card",
    "thumbnailUrl": "https://images.unsplash.com/photo-1520642413789-218e04661ad2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": false,
    "rating": 5,
    "playCount": 1899
  },
  {
    "title": "Taxi Pickup",
    "description": "Dive into this addictive adventure game and test your skills!",
    "category": "educational",
    "secondaryCategory": "racing",
    "thumbnailUrl": "https://images.unsplash.com/photo-1626170733248-39b929943827?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": false,
    "rating": 5,
    "playCount": 4116
  },
  {
    "title": "Tiny Cars",
    "description": "Play this entertaining sports game and test your skills!",
    "category": "educational",
    "secondaryCategory": "strategy",
    "thumbnailUrl": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": true,
    "isNew": false,
    "rating": 4,
    "playCount": 5149
  },
  {
    "title": "Toops",
    "description": "Challenge yourself with this exciting multiplayer game and test your skills!",
    "category": "racing",
    "secondaryCategory": "board",
    "thumbnailUrl": "https://images.unsplash.com/photo-1517957754642-2870518e16f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": true,
    "isNew": false,
    "rating": 4,
    "playCount": 2239
  },
  {
    "title": "Two Dots G 1",
    "description": "Dive into this exciting puzzle game and test your skills!",
    "category": "board",
    "secondaryCategory": "action",
    "thumbnailUrl": "https://images.unsplash.com/photo-1517957754642-2870518e16f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": false,
    "rating": 5,
    "playCount": 5817
  },
  {
    "title": "Two Dots G 2",
    "description": "Experience this challenging casual game and test your skills!",
    "category": "adventure",
    "secondaryCategory": "casual",
    "thumbnailUrl": "https://images.unsplash.com/photo-1517957754642-2870518e16f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": false,
    "rating": 5,
    "playCount": 5603
  },
  {
    "title": "Two Dots G 3",
    "description": "Play this engaging sports game and test your skills!",
    "category": "adventure",
    "secondaryCategory": "puzzle",
    "thumbnailUrl": "https://images.unsplash.com/photo-1614681817039-bc3e5b650321?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": false,
    "rating": 5,
    "playCount": 2544
  },
  {
    "title": "Two Dots G 4",
    "description": "Challenge yourself with this exciting action game and test your skills!",
    "category": "adventure",
    "secondaryCategory": "educational",
    "thumbnailUrl": "https://images.unsplash.com/photo-1626170733248-39b929943827?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": false,
    "rating": 5,
    "playCount": 3292
  },
  {
    "title": "Two Tiles",
    "description": "Dive into this exciting racing game and test your skills!",
    "category": "arcade",
    "secondaryCategory": "racing",
    "thumbnailUrl": "https://images.unsplash.com/photo-1517957754642-2870518e16f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": false,
    "rating": 5,
    "playCount": 4595
  },
  {
    "title": "Type Shift",
    "description": "Enjoy this exciting action game and test your skills!",
    "category": "educational",
    "secondaryCategory": "action",
    "thumbnailUrl": "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": false,
    "rating": 4,
    "playCount": 2804
  },
  {
    "title": "Word Scapes",
    "description": "Challenge yourself with this fun board game and test your skills!",
    "category": "action",
    "secondaryCategory": "arcade",
    "thumbnailUrl": "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": false,
    "rating": 4,
    "playCount": 4483
  },
  {
    "title": "Word Story",
    "description": "Dive into this entertaining arcade game and test your skills!",
    "category": "sports",
    "secondaryCategory": "adventure",
    "thumbnailUrl": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": true,
    "isNew": false,
    "rating": 5,
    "playCount": 4964
  },
  {
    "title": "Word Swipe",
    "description": "Dive into this exciting board game and test your skills!",
    "category": "casual",
    "secondaryCategory": "racing",
    "thumbnailUrl": "https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": false,
    "rating": 5,
    "playCount": 3173
  },
  {
    "title": "Word Wood",
    "description": "Play this entertaining educational game and test your skills!",
    "category": "sports",
    "secondaryCategory": "action",
    "thumbnailUrl": "https://images.unsplash.com/photo-1517957754642-2870518e16f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": true,
    "rating": 4,
    "playCount": 1071
  },
  {
    "title": "Zero 21",
    "description": "Enjoy this exciting multiplayer game and test your skills!",
    "category": "arcade",
    "secondaryCategory": "strategy",
    "thumbnailUrl": "https://images.unsplash.com/photo-1520642413789-218e04661ad2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": true,
    "rating": 5,
    "playCount": 2961
  },
  {
    "title": "Speed Racer",
    "description": "Race against time in this high-speed arcade game",
    "category": "strategy",
    "secondaryCategory": "casual",
    "thumbnailUrl": "https://images.unsplash.com/photo-1520642413789-218e04661ad2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": true,
    "rating": 4,
    "playCount": 3359
  },
  {
    "title": "Battle Royale",
    "description": "Compete in this intense connection-based battle game",
    "category": "action",
    "secondaryCategory": "sports",
    "thumbnailUrl": "https://images.unsplash.com/photo-1614681817039-bc3e5b650321?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80",
    "isFeatured": false,
    "isNew": false,
    "rating": 5,
    "playCount": 5385
  }
];
    
    // Add all games
    allGames.forEach(game => this.createGame(game));
    
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
