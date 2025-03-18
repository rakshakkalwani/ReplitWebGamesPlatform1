import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Game, User, Comment as CommentType } from "@shared/schema";
import { 
  Star, 
  Users, 
  ArrowLeft, 
  Clock, 
  ThumbsUp,
  Send,
  MessageSquare
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Textarea } from "../components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { queryClient, apiRequest } from "../lib/queryClient";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Skeleton } from "../components/ui/skeleton";
import { Badge } from "../components/ui/badge";

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
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);

  // Set page title
  useEffect(() => {
    if (game) {
      document.title = `${game.title} | GameZone`;
    } else {
      document.title = "Game Details | GameZone";
    }
  }, []);

  // Fetch game details
  const {
    data: game,
    isLoading: gameLoading,
    error: gameError
  } = useQuery<Game>({
    queryKey: [`/api/games/${gameId}`],
    enabled: !isNaN(gameId)
  });

  // Fetch game comments
  const {
    data: comments,
    isLoading: commentsLoading
  } = useQuery<CommentType[]>({
    queryKey: [`/api/games/${gameId}/comments`],
    enabled: !isNaN(gameId)
  });

  // Mutation to play game and record history
  const playMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/games/${gameId}/play`, 
        user ? { userId: user.id, score } : undefined
      );
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/games/${gameId}`] });
      if (user) {
        queryClient.invalidateQueries({ queryKey: [`/api/users/${user.id}/history`] });
        queryClient.invalidateQueries({ queryKey: ['/api/leaderboard'] });
      }
    }
  });

  // Mutation to add comment
  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error("You must be logged in to comment");
      const response = await apiRequest("POST", `/api/games/${gameId}/comments`, {
        userId: user.id,
        content
      });
      return await response.json();
    },
    onSuccess: () => {
      setComment("");
      queryClient.invalidateQueries({ queryKey: [`/api/games/${gameId}/comments`] });
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add comment",
        variant: "destructive"
      });
    }
  });

  // Mutation to rate game
  const rateMutation = useMutation({
    mutationFn: async (selectedRating: number) => {
      if (!user) throw new Error("You must be logged in to rate");
      const response = await apiRequest("POST", `/api/games/${gameId}/rate`, {
        userId: user.id,
        rating: selectedRating
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/games/${gameId}`] });
      toast({
        title: "Rating submitted",
        description: "Your rating has been submitted successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit rating",
        variant: "destructive"
      });
    }
  });

  // Handle play button click
  const handlePlay = () => {
    if (isPlaying) {
      // End game
      setIsPlaying(false);
      
      // Record play session with current score
      playMutation.mutate();
      
      toast({
        title: "Game completed",
        description: `You scored ${score} points!`
      });
    } else {
      // Start game
      setIsPlaying(true);
      setScore(0);
      
      // Record that user started a game
      playMutation.mutate();
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
    };
  }, []);

  // Handle comment submission
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "You need to be logged in to comment",
        variant: "destructive"
      });
      return;
    }
    
    commentMutation.mutate(comment);
  };

  // Handle rating submission
  const handleRateGame = (newRating: number) => {
    setRating(newRating);
    
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "You need to be logged in to rate games",
        variant: "destructive"
      });
      return;
    }
    
    rateMutation.mutate(newRating);
  };

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
            <h1 className="text-3xl md:text-4xl font-bold">{game?.title}</h1>
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
                    <div className="absolute inset-0 flex flex-col items-center bg-black">
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
                      />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Button 
                        onClick={handlePlay}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-xl"
                        size="lg"
                      >
                        Play Now
                      </Button>
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
            
            {/* Tabs for Comments & Ratings */}
            <Tabs defaultValue="comments">
              <TabsList className="mb-4">
                <TabsTrigger value="comments">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Comments
                </TabsTrigger>
                <TabsTrigger value="rate">
                  <Star className="h-4 w-4 mr-2" />
                  Rate This Game
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="comments">
                <Card>
                  <CardContent className="p-6">
                    {/* Comment Form */}
                    <form onSubmit={handleCommentSubmit} className="mb-6">
                      <Textarea
                        placeholder="Share your thoughts about this game..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="mb-3 min-h-[100px]"
                        disabled={commentMutation.isPending || !isAuthenticated}
                      />
                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          disabled={commentMutation.isPending || !comment.trim() || !isAuthenticated}
                        >
                          <Send className="mr-2 h-4 w-4" />
                          {commentMutation.isPending ? "Posting..." : "Post Comment"}
                        </Button>
                      </div>
                      {!isAuthenticated && (
                        <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                          You need to be logged in to comment
                        </p>
                      )}
                    </form>
                    
                    <Separator className="my-6" />
                    
                    {/* Comments List */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">
                        {commentsLoading 
                          ? "Loading comments..." 
                          : comments?.length 
                            ? `${comments.length} Comments` 
                            : "No comments yet"}
                      </h3>
                      
                      {commentsLoading ? (
                        Array(3).fill(0).map((_, i) => (
                          <div key={`comment-skeleton-${i}`} className="flex space-x-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-1/4" />
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-4 w-3/4" />
                            </div>
                          </div>
                        ))
                      ) : comments?.length === 0 ? (
                        <div className="text-center py-10">
                          <MessageSquare className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                          <p className="text-gray-500 dark:text-gray-400">
                            Be the first to comment on this game!
                          </p>
                        </div>
                      ) : (
                        comments?.map((comment) => (
                          <motion.div 
                            key={comment.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex space-x-4"
                          >
                            <Avatar>
                              <AvatarFallback className="bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400">
                                {comment.userId.toString().substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold">
                                  User {comment.userId}
                                </h4>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ""}
                                </span>
                              </div>
                              <p className="text-gray-700 dark:text-gray-300">
                                {comment.content}
                              </p>
                              <div className="flex items-center mt-2">
                                <button className="flex items-center text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                                  <ThumbsUp className="h-3 w-3 mr-1" />
                                  Like
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="rate">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Rate this game</h3>
                    <div className="flex flex-col items-center">
                      <div className="flex space-x-1 mb-6">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleRateGame(star)}
                            disabled={rateMutation.isPending || !isAuthenticated}
                            className={`text-2xl ${
                              star <= rating
                                ? "text-yellow-500"
                                : "text-gray-300 dark:text-gray-600"
                            } focus:outline-none`}
                          >
                            <Star className="h-8 w-8" fill={star <= rating ? "currentColor" : "none"} />
                          </button>
                        ))}
                      </div>
                      <p className="text-center mb-4">
                        {rating === 1 && "Poor"}
                        {rating === 2 && "Fair"}
                        {rating === 3 && "Good"}
                        {rating === 4 && "Very Good"}
                        {rating === 5 && "Excellent"}
                      </p>
                      
                      {!isAuthenticated && (
                        <p className="text-amber-600 dark:text-amber-400 text-sm">
                          You need to be logged in to rate games
                        </p>
                      )}
                      
                      {rateMutation.isPending && (
                        <p className="text-indigo-600 dark:text-indigo-400">
                          Submitting your rating...
                        </p>
                      )}
                      
                      {rateMutation.isSuccess && (
                        <p className="text-green-600 dark:text-green-400">
                          Thank you for rating this game!
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Sidebar */}
          <div>
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Similar Games</h3>
                {gameLoading ? (
                  <div className="space-y-4">
                    {Array(3).fill(0).map((_, i) => (
                      <div key={`similar-skeleton-${i}`} className="flex items-center space-x-4">
                        <Skeleton className="h-16 w-16 rounded" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* This would fetch similar games in a real app */}
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      Similar games would be shown here based on the current game's category
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">How to Play</h3>
                {gameLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-gray-700 dark:text-gray-300">
                      Click the "Play Now" button to start playing. Try to achieve the highest score possible!
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      This is where specific instructions for {game?.title} would be shown.
                    </p>
                    <p className="text-sm text-indigo-600 dark:text-indigo-400">
                      Playing games earns you points on the leaderboard!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
