import { Game, User, Comment } from '../../shared/schema';

// Function to load data from static JSON files
export async function loadStaticData<T>(path: string): Promise<T> {
  try {
    const response = await fetch(`/data/${path}`);
    if (!response.ok) {
      throw new Error(`Failed to load static data: ${path}`);
    }
    return await response.json() as T;
  } catch (error) {
    console.error(`Error loading static data (${path}):`, error);
    throw error;
  }
}

// Cache the games data to avoid multiple fetches
let gamesCache: Game[] | null = null;
const cacheTimeout = 60000; // 1 minute cache
let lastCacheTime = 0;

// Get all games and apply filtering
async function getFilteredGames(): Promise<Game[]> {
  const now = Date.now();
  if (!gamesCache || now - lastCacheTime > cacheTimeout) {
    const games = await loadStaticData<Game[]>('games.json');
    gamesCache = games.filter(game => !game.hidden);
    lastCacheTime = now;
    console.log(`Loaded ${gamesCache.length} games from games.json`);
  }
  return gamesCache;
}

// Helper functions for common data types
export async function getAllGames(): Promise<Game[]> {
  return getFilteredGames();
}

export async function getFeaturedGames(): Promise<Game[]> {
  const games = await getFilteredGames();
  return games.filter(game => game.isFeatured);
}

export async function getNewGames(): Promise<Game[]> {
  const games = await getFilteredGames();
  return games.filter(game => game.isNew);
}

export async function getPopularGames(): Promise<Game[]> {
  const games = await getFilteredGames();
  // Sort by play count and take top 10 games
  return games
    .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
    .slice(0, 10);
}

export async function getLeaderboard(): Promise<User[]> {
  return loadStaticData<User[]>('leaderboard.json');
}

export async function getGame(id: number): Promise<Game> {
  // Try to find the game in the cache first
  if (gamesCache) {
    const game = gamesCache.find(g => g.id === id);
    if (game) return game;
  }
  
  // If not in cache or cache is empty, try to get from all games
  const allGames = await getFilteredGames();
  const game = allGames.find(g => g.id === id);
  
  if (!game) {
    throw new Error(`Game with ID ${id} not found`);
  }
  
  return game;
}

export async function getSimilarGames(gameId: number, limit: number = 3): Promise<Game[]> {
  const game = await getGame(gameId);
  if (!game || !game.category) return [];
  
  const allGames = await getFilteredGames();
  
  // Get games from the same category, excluding the current game
  const sameCategory = allGames.filter(g => 
    g.id !== gameId && 
    g.category === game.category
  );
  
  // Shuffle the array to get random games each time
  const shuffled = [...sameCategory].sort(() => 0.5 - Math.random());
  
  // Return the specified number of games
  return shuffled.slice(0, limit);
}

export async function getGameComments(gameId: number): Promise<Comment[]> {
  try {
    return await loadStaticData<Comment[]>(`comments/${gameId}.json`);
  } catch (error) {
    // Return empty array if comments file doesn't exist
    console.log(`No comments found for game ${gameId}`);
    return [];
  }
}

// Static mock functions for operations that would normally write to server
// These functions maintain the same interface but don't perform any server operations

export async function recordGamePlay(gameId: number): Promise<Game> {
  const game = await getGame(gameId);
  console.log(`Game play recorded (static): ${game.title}`);
  return game;
}

export async function rateGame(gameId: number, rating: number): Promise<void> {
  console.log(`Game rated (static): ID ${gameId}, Rating: ${rating}`);
  return;
}

export async function addComment(gameId: number, comment: string): Promise<void> {
  console.log(`Comment added (static): ID ${gameId}, Comment: ${comment}`);
  return;
}