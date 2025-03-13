// Script to add all games from the public/games directory to the database
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

// Get current file path in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all game directories
const gamesDir = path.join(__dirname, '../public/games');
const gameFolders = fs.readdirSync(gamesDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .filter(dirent => dirent.name !== '.git' && dirent.name !== '.DS_Store') // Filter out hidden folders
  .map(dirent => dirent.name);

// Function to get random category
function getRandomCategory() {
  const categories = [
    'arcade', 'puzzle', 'strategy', 'adventure', 'action', 'multiplayer', 
    'racing', 'sports', 'card', 'board', 'casual', 'educational'
  ];
  return categories[Math.floor(Math.random() * categories.length)];
}

// Function to get random secondary category (different from primary)
function getRandomSecondaryCategory(primary) {
  const categories = [
    'arcade', 'puzzle', 'strategy', 'adventure', 'action', 'multiplayer', 
    'racing', 'sports', 'card', 'board', 'casual', 'educational'
  ].filter(cat => cat !== primary);
  return categories[Math.floor(Math.random() * categories.length)];
}

// Function to get random thumbnail URL
function getRandomThumbnailUrl() {
  const imageUrls = [
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80',
    'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80',
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80',
    'https://images.unsplash.com/photo-1517957754642-2870518e16f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80',
    'https://images.unsplash.com/photo-1520642413789-218e04661ad2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80',
    'https://images.unsplash.com/photo-1626170733248-39b929943827?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80',
    'https://images.unsplash.com/photo-1614681817039-bc3e5b650321?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=170&q=80'
  ];
  return imageUrls[Math.floor(Math.random() * imageUrls.length)];
}

// Function to format game name
function formatGameName(folderName) {
  // Special case for testgame (Battle Royale)
  if (folderName === 'testgame') {
    return 'Battle Royale';
  }
  
  // Special case for speed-racer
  if (folderName === 'speed-racer') {
    return 'Speed Racer';
  }
  
  // Format folder name to title case
  return folderName
    .replace(/([A-Z])/g, ' $1') // Add spaces before capital letters
    .replace(/(\d+)/g, ' $1')   // Add spaces before numbers
    .replace(/^./, match => match.toUpperCase()) // Capitalize first letter
    .trim();
}

// Function to get game description
function getGameDescription(gameName) {
  const descriptions = {
    'AlphaBalls': 'Roll, bounce, and match balls to form words in this exciting vocabulary game',
    'BasketSlide': 'Slide and shoot baskets in this fast-paced basketball challenge',
    'Blocks8': 'Arrange blocks in rows and columns to clear the board and score points',
    'Blocky360': 'Rotate blocks in a 360-degree environment to build structures',
    'BlueBlock': 'Clear the blue blocks while avoiding obstacles in this puzzle game',
    'Bounce': 'Bounce your way through challenging levels with physics-based gameplay',
    'Bridges': 'Build bridges to connect islands and solve tricky puzzles',
    'Cards2048': 'Combine cards with the same number to reach 2048 in this addictive card game',
    'Circle_S': 'Draw perfect circles to pass levels in this precision puzzle',
    'ColorStrings': 'Connect colorful strings to create patterns and clear the board',
    'Battle Royale': 'Compete in this intense connection-based battle game',
    'Speed Racer': 'Race against time in this high-speed arcade game',
  };
  
  // Return custom description if available
  if (descriptions[gameName]) {
    return descriptions[gameName];
  }
  
  // Generate generic description
  const actions = ['Play', 'Enjoy', 'Challenge yourself with', 'Experience', 'Dive into'];
  const adjectives = ['exciting', 'fun', 'addictive', 'challenging', 'engaging', 'entertaining'];
  const action = actions[Math.floor(Math.random() * actions.length)];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  
  return `${action} this ${adjective} ${getRandomCategory()} game and test your skills!`;
}

// Generate game entries
const gameEntries = gameFolders.map(folder => {
  const gameName = formatGameName(folder);
  const primaryCategory = getRandomCategory();
  
  // Random attributes
  const isFeatured = Math.random() < 0.3; // 30% chance of being featured
  const isNew = Math.random() < 0.25; // 25% chance of being new
  const rating = Math.floor(Math.random() * 2) + 4; // Rating between 4-5
  const playCount = Math.floor(Math.random() * 5000) + 1000; // Play count between 1000-6000
  
  return {
    title: gameName,
    description: getGameDescription(gameName),
    category: primaryCategory,
    secondaryCategory: getRandomSecondaryCategory(primaryCategory),
    thumbnailUrl: getRandomThumbnailUrl(),
    isFeatured,
    isNew,
    rating,
    playCount
  };
});

// Log generated game entries
console.log(`Generated ${gameEntries.length} game entries`);

// Create a new storage file with the updated game entries
const updatedStorage = `import { 
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
    const allGames = ${JSON.stringify(gameEntries, null, 2)};
    
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
`;

// Write the updated storage.ts file
fs.writeFileSync(path.join(__dirname, '../server/storage.ts'), updatedStorage);

console.log('Updated storage.ts with all game entries!');