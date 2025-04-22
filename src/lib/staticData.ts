import { Game, User, Comment } from '@shared/schema';

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

// Helper functions for common data types
export async function getAllGames(): Promise<Game[]> {
  return loadStaticData<Game[]>('games.json');
}

export async function getFeaturedGames(): Promise<Game[]> {
  return loadStaticData<Game[]>('featured-games.json');
}

export async function getNewGames(): Promise<Game[]> {
  return loadStaticData<Game[]>('new-games.json');
}

export async function getPopularGames(): Promise<Game[]> {
  return loadStaticData<Game[]>('popular-games.json');
}

export async function getLeaderboard(): Promise<User[]> {
  return loadStaticData<User[]>('leaderboard.json');
}

export async function getGame(id: number): Promise<Game> {
  return loadStaticData<Game>(`games/${id}.json`);
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