import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Game } from "../../shared/schema";
import { 
  Star, 
  Users, 
  ArrowLeft, 
  Clock,
  Loader2,
  ThumbsUp
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { useToast } from "../hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "../components/ui/skeleton";
import { recordGamePlay } from "../lib/staticData";
import TutorialButton from "../components/tutorial/TutorialButton";

// Helper function to determine game path based on the game title
const getGamePath = (gameTitle?: string): string => {
  if (!gameTitle) return '';
  
  // Special case for Battle Royale (testgame)
  if (gameTitle.toLowerCase() === "battle royale") {
    return "/games/testgame/index.html";
  }
  
  // Special case for Speed Racer
  if (gameTitle.toLowerCase() === "speed racer") {
    return "/games/speed-racer/index.html";
  }
  
  // For the folder name, replace spaces with hyphens or underscores
  // This makes the folder name match the game title format in the file system
  const folderName = gameTitle
    .replace(/\s+/g, '') // Remove spaces for AlphaBalls style
    .replace(/([A-Z])/g, '$1') // Keep camelCase
    .replace(/\d+/g, '$&'); // Keep numbers
  
  // Try HTML5 subfolder first (for newer games)
  return `/games/${folderName}/HTML5/index.html`;
};

export default function GameDetails() {
  const { id } = useParams<{ id: string }>();
  const gameId = parseInt(id);
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameLoading, setIsGameLoading] = useState(false);
  const [score, setScore] = useState(0);

  // Fetch game details
  const {
    data: game,
    isLoading: gameLoading,
    error: gameError
  } = useQuery<Game>({
    queryKey: [`/api/games/${gameId}`],
    enabled: !isNaN(gameId)
  });

  // Set page title
  useEffect(() => {
    if (game) {
      document.title = `${game.title} | GameZone`;
    } else {
      document.title = "Game Details | GameZone";
    }
    return () => {
      document.title = "GameZone";
    };
  }, [game]);

  // Handle play button click
  const handlePlay = () => {
    if (isPlaying) {
      // End game
      setIsPlaying(false);
      
      // Remove body overflow hidden
      document.body.style.overflow = '';
      
      // Record play in static data
      recordGamePlay(gameId);
      
      toast({
        title: "Game completed",
        description: `You scored ${score} points!`
      });
    } else {
      // Start loading the game
      setIsGameLoading(true);
      
      // Start game after a short delay to show loading animation
      setTimeout(() => {
        setIsPlaying(true);
        setScore(0);
        
        // Prevent scrolling when in fullscreen mode
        document.body.style.overflow = 'hidden';
        
        // Record that user started a game
        recordGamePlay(gameId);
        
        // Remove loading state after game is shown
        setTimeout(() => {
          setIsGameLoading(false);
        }, 1000);
      }, 1500);
    }
  };
  
  // Handle messages from game iframe
  useEffect(() => {
    const handleGameMessage = (event: MessageEvent) => {
      // Make sure the message is from our game
      if (event.data && typeof event.data === 'object' && event.data.type === 'gameScore') {
        // Update score from game
        setScore(event.data.score);
      }
    };
    
    window.addEventListener('message', handleGameMessage);
    
    return () => {
      window.removeEventListener('message', handleGameMessage);
      // Clean up body overflow style if component unmounts while playing
      document.body.style.overflow = '';
    };
  }, []);

  // If game not found
  if (gameError) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Game not found</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The game you're looking for doesn't exist or has been removed.
        </p>
        <Link href="/games">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Games
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="container mx-auto px-4 py-8"
      >
        <div className="mb-6">
          <Link href="/games">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Games
            </Button>
          </Link>
          
          {gameLoading ? (
            <Skeleton className="h-10 w-2/3 mb-4" />
          ) : (
            <div className="flex items-center">
              <h1 className="text-3xl md:text-4xl font-bold">{game?.title}</h1>
              {game && (
                <TutorialButton 
                  tutorialId={game?.id === 6 ? 'bounce-tutorial' : 
                               game?.id === 2 ? 'basket-slide-tutorial' : ''}
                  className="ml-2" 
                />
              )}
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Game Display */}
            <Card className="mb-8 overflow-hidden">
              {gameLoading ? (
                <Skeleton className="w-full aspect-video" />
              ) : (
                <div className="relative">
                  <img 
                    src={game?.thumbnailUrl} 
                    alt={game?.title} 
                    className="w-full aspect-video object-cover"
                  />
                  {isPlaying ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="fixed inset-0 z-50 flex flex-col items-center bg-black"
                    >
                      <div className="flex justify-between items-center w-full p-2 bg-gray-800">
                        <div className="text-white font-bold">Score: {score}</div>
                        <Button 
                          onClick={handlePlay}
                          variant="destructive"
                          size="sm"
                        >
                          End Game
                        </Button>
                      </div>
                      <iframe 
                        src={getGamePath(game?.title)}
                        className="w-full h-full border-0"
                        title={game?.title}
                        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                        allowFullScreen
                      />
                    </motion.div>
                  ) : isGameLoading ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center"
                    >
                      <Loader2 className="h-16 w-16 text-indigo-500 animate-spin mb-4" />
                      <h3 className="text-2xl font-bold text-white">Loading Game...</h3>
                      <p className="text-gray-300 mt-2">Please wait while we prepare your gaming experience</p>
                    </motion.div>
                  ) : (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <Button 
                          onClick={handlePlay}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-xl shadow-lg"
                          size="lg"
                        >
                          Play Now
                        </Button>
                      </motion.div>
                    </div>
                  )}
                </div>
              )}
              
              <CardContent className="p-6">
                {gameLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline" className="capitalize">
                        {game?.category}
                      </Badge>
                      {game?.secondaryCategory && (
                        <Badge variant="outline" className="capitalize">
                          {game.secondaryCategory}
                        </Badge>
                      )}
                      {game?.isFeatured && (
                        <Badge className="bg-indigo-600">Featured</Badge>
                      )}
                      {game?.isNew && (
                        <Badge className="bg-pink-500">New</Badge>
                      )}
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 mb-6">
                      {game?.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-6 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <Users className="mr-2 h-4 w-4" />
                        <span>{game?.playCount ? game.playCount.toLocaleString() : 0} plays</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="mr-2 h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span>{game?.rating ?? 0} / 5 rating</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        <span>Added {game?.createdAt ? new Date(game.createdAt).toLocaleDateString() : "recently"}</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            
            {/* Game Info Card */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <h3 className="text-lg font-semibold mb-4 mr-2">How to Play</h3>
                  {game && (game.id === 6 || game.id === 2) && (
                    <TutorialButton 
                      tutorialId={game.id === 6 ? 'bounce-tutorial' : 'basket-slide-tutorial'} 
                    />
                  )}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Click the "Play Now" button to start playing. Use your keyboard and mouse to control the game.
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Press the "End Game" button when you're done to exit full-screen mode and return to the website.
                </p>
                {game && (game.id === 6 || game.id === 2) && (
                  <p className="text-indigo-600 dark:text-indigo-400 flex items-center">
                    <span className="mr-2">New to this game?</span>
                    <TutorialButton 
                      tutorialId={game.id === 6 ? 'bounce-tutorial' : 'basket-slide-tutorial'} 
                      className="text-indigo-600 dark:text-indigo-400"
                    />
                    <span className="ml-2">Click to view the tutorial!</span>
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div>
            <div className="md:sticky md:top-24">
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Similar Games</h3>
                  
                  {gameLoading ? (
                    <div className="space-y-4">
                      {Array(3).fill(0).map((_, i) => (
                        <div key={`similar-skeleton-${i}`} className="flex items-center space-x-3">
                          <Skeleton className="h-16 w-24 rounded-md" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {game?.category && (
                        <div className="flex items-center space-x-3">
                          <ThumbsUp className="h-10 w-10 p-2 bg-indigo-100 dark:bg-indigo-900 rounded-md text-indigo-600 dark:text-indigo-400" />
                          <div>
                            <p className="font-medium">Check out more games</p>
                            <Link href={`/games/category/${game.category}`} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                              Browse {game.category} games
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}