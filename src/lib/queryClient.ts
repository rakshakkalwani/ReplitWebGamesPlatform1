import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { 
  getAllGames, 
  getFeaturedGames, 
  getNewGames, 
  getPopularGames, 
  getLeaderboard, 
  getGame, 
  getGameComments,
  recordGamePlay,
  rateGame,
  addComment
} from './staticData';
import { Game, Comment, User } from '@shared/schema';

// Static version of apiRequest that doesn't make actual API calls
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  console.log(`Static API request: ${method} ${url}`);
  
  let responseData: any = null;
  
  // Route the request to the appropriate static data handler
  if (url.startsWith('/api/games')) {
    if (url === '/api/games') {
      responseData = await getAllGames();
    } 
    else if (url === '/api/games/featured') {
      responseData = await getFeaturedGames();
    }
    else if (url === '/api/games/new') {
      responseData = await getNewGames();
    }
    else if (url === '/api/games/popular') {
      responseData = await getPopularGames();
    }
    else if (url.includes('/comments')) {
      const gameId = parseInt(url.split('/')[3]);
      if (method === 'GET') {
        responseData = await getGameComments(gameId);
      } else if (method === 'POST') {
        await addComment(gameId, (data as any)?.content || '');
        responseData = { success: true };
      }
    }
    else if (url.includes('/rate')) {
      const gameId = parseInt(url.split('/')[3]);
      await rateGame(gameId, (data as any)?.rating || 5);
      responseData = { success: true };
    }
    else if (url.includes('/play')) {
      const gameId = parseInt(url.split('/')[3]);
      responseData = await recordGamePlay(gameId);
    }
    else {
      // Individual game request
      const gameId = parseInt(url.split('/')[3]);
      if (!isNaN(gameId)) {
        responseData = await getGame(gameId);
      }
    }
  }
  else if (url === '/api/leaderboard') {
    responseData = await getLeaderboard();
  }
  
  // Create a mock response
  const mockResponse = new Response(JSON.stringify(responseData), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
  
  // Make the json method return our data directly
  mockResponse.json = async () => responseData;
  
  return mockResponse;
}

// Static version of the query function that routes to our static data
export const getQueryFn: <T>(options: {
  on401: "returnNull" | "throw";
}) => QueryFunction<T> =
  () =>
  async ({ queryKey }) => {
    const path = queryKey[0] as string;
    console.log(`Static query for: ${path}`);
    
    // Route the query to the appropriate static data handler
    if (path === '/api/games') {
      return await getAllGames() as any;
    }
    else if (path === '/api/games/featured') {
      return await getFeaturedGames() as any;
    }
    else if (path === '/api/games/new') {
      return await getNewGames() as any;
    }
    else if (path === '/api/games/popular') {
      return await getPopularGames() as any;
    }
    else if (path === '/api/leaderboard') {
      return await getLeaderboard() as any;
    }
    else if (path.includes('/api/games/') && path.includes('/comments')) {
      const gameId = parseInt(path.split('/')[3]);
      return await getGameComments(gameId) as any;
    }
    else if (path.startsWith('/api/games/')) {
      const gameId = parseInt(path.split('/')[3]);
      if (!isNaN(gameId)) {
        return await getGame(gameId) as any;
      }
    }
    
    // Return empty data for any unhandled routes
    console.warn(`Unhandled static data path: ${path}`);
    return [] as any;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
