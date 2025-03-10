import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { User, Game, GameHistory } from "@shared/schema";
import { 
  UserCircle, 
  Trophy, 
  Clock, 
  Calendar, 
  Star, 
  Gamepad2,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

export default function Profile() {
  const { id } = useParams<{ id?: string }>();
  const { user: authUser } = useAuth();
  const userId = id ? parseInt(id) : authUser?.id;
  const isOwnProfile = authUser?.id === userId;

  // Set page title
  useEffect(() => {
    document.title = isOwnProfile ? "My Profile | GameZone" : "User Profile | GameZone";
  }, [isOwnProfile]);

  // Fetch user details
  const {
    data: user,
    isLoading: userLoading,
    error: userError
  } = useQuery<User>({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId
  });

  // Fetch user's game history
  const { 
    data: gameHistory,
    isLoading: historyLoading
  } = useQuery<GameHistory[]>({
    queryKey: [`/api/users/${userId}/history`],
    enabled: !!userId
  });

  // Calculate next level progress
  const calculateLevelProgress = () => {
    if (!user) return 0;
    
    const pointsForCurrentLevel = user.level * 1000;
    const pointsForNextLevel = (user.level + 1) * 1000;
    const pointsNeeded = pointsForNextLevel - pointsForCurrentLevel;
    const currentLevelPoints = user.points - pointsForCurrentLevel;
    
    return Math.floor((currentLevelPoints / pointsNeeded) * 100);
  };

  // If user not found
  if (userError || (!userLoading && !user)) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">User not found</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The user you're looking for doesn't exist or has been removed.
        </p>
        <Link href="/">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {userLoading ? (
                <Skeleton className="h-24 w-24 rounded-full" />
              ) : (
                <Avatar className="h-24 w-24 text-2xl">
                  <AvatarFallback className="bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400">
                    {user?.avatar || user?.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div className="flex-1 text-center md:text-left">
                {userLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-8 w-48 mx-auto md:mx-0" />
                    <Skeleton className="h-4 w-32 mx-auto md:mx-0" />
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold">{user?.username}</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "recently"}
                    </p>
                    
                    <div className="flex flex-wrap gap-4 mt-4">
                      <div className="flex items-center">
                        <Trophy className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                        <span className="font-semibold">{user?.points.toLocaleString()} points</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-yellow-500 mr-2" />
                        <span className="font-semibold">Level {user?.level}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Gamepad2 className="h-5 w-5 text-pink-500 mr-2" />
                        <span className="font-semibold">{gameHistory?.length || 0} games played</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              {isOwnProfile && (
                <div className="mt-4 md:mt-0">
                  <Button variant="outline">Edit Profile</Button>
                </div>
              )}
            </div>
            
            {/* Level Progress */}
            {!userLoading && user && (
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>Level {user.level}</span>
                  <span>Level {user.level + 1}</span>
                </div>
                <Progress value={calculateLevelProgress()} className="h-2" />
                <p className="text-xs text-center mt-2 text-gray-600 dark:text-gray-400">
                  {calculateLevelProgress()}% to next level • {((user.level + 1) * 1000) - user.points} points needed
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Profile Content */}
        <Tabs defaultValue="activity">
          <TabsList className="mb-6">
            <TabsTrigger value="activity">
              <Clock className="h-4 w-4 mr-2" />
              Recent Activity
            </TabsTrigger>
            <TabsTrigger value="stats">
              <Trophy className="h-4 w-4 mr-2" />
              Stats & Achievements
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Recent Game Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="space-y-6">
                    {Array(5).fill(0).map((_, i) => (
                      <div key={`activity-skeleton-${i}`} className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                        <Skeleton className="h-8 w-16" />
                      </div>
                    ))}
                  </div>
                ) : gameHistory && gameHistory.length > 0 ? (
                  <div className="space-y-6">
                    {gameHistory.map((history) => (
                      <motion.div 
                        key={history.id} 
                        className="flex items-center space-x-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900 rounded flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                          <Gamepad2 className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">Played Game #{history.gameId}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="h-3 w-3 inline-block mr-1" />
                            {history.playedAt ? new Date(history.playedAt).toLocaleString() : "Recently"}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-indigo-600 dark:text-indigo-400">
                            {history.score.toLocaleString()} pts
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <Gamepad2 className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <h3 className="font-medium text-lg mb-1">No games played yet</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Start playing games to see your activity here!
                    </p>
                    <Link href="/games">
                      <Button>Browse Games</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Player Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  {userLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Total Points</span>
                        <span className="font-semibold">{user?.points.toLocaleString()}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Games Played</span>
                        <span className="font-semibold">{gameHistory?.length || 0}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Average Score</span>
                        <span className="font-semibold">
                          {gameHistory && gameHistory.length > 0
                            ? Math.round(
                                gameHistory.reduce((sum, game) => sum + game.score, 0) / gameHistory.length
                              ).toLocaleString()
                            : "N/A"}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Highest Score</span>
                        <span className="font-semibold">
                          {gameHistory && gameHistory.length > 0
                            ? Math.max(...gameHistory.map(game => game.score)).toLocaleString()
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  {userLoading ? (
                    <div className="space-y-4">
                      {Array(3).fill(0).map((_, i) => (
                        <div key={`achievement-skeleton-${i}`} className="flex items-center space-x-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-3 w-full" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {user && (
                        <>
                          {/* Level achievement */}
                          <div className="flex items-start space-x-3">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                              <Trophy className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                              <h4 className="font-medium">{`Level ${user.level} ${user.level >= 10 ? 'Veteran' : 'Player'}`}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Reached level {user.level} with {user.points.toLocaleString()} points
                              </p>
                            </div>
                          </div>
                          
                          {/* Games played achievement */}
                          {gameHistory && gameHistory.length > 0 && (
                            <div className="flex items-start space-x-3">
                              <div className="h-10 w-10 rounded-full bg-pink-100 dark:bg-pink-900 flex items-center justify-center">
                                <Gamepad2 className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                              </div>
                              <div>
                                <h4 className="font-medium">
                                  {gameHistory.length >= 50 ? 'Gaming Enthusiast' : 'Game Explorer'}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Played {gameHistory.length} different games
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {/* High score achievement */}
                          {gameHistory && gameHistory.length > 0 && (
                            <div className="flex items-start space-x-3">
                              <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                                <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                              </div>
                              <div>
                                <h4 className="font-medium">High Scorer</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Achieved a high score of {Math.max(...gameHistory.map(game => game.score)).toLocaleString()} points
                                </p>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
