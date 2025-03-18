import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User } from "../../shared/schema";
import { Link } from "wouter";
import { 
  Trophy, 
  Star, 
  Medal, 
  Search,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Skeleton } from "../components/ui/skeleton";

type SortKey = "points" | "level" | "username";
type SortDirection = "asc" | "desc";

export default function Leaderboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("points");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Set page title
  useEffect(() => {
    document.title = "Leaderboard | GameZone";
  }, []);

  // Fetch top players
  const { data: players, isLoading } = useQuery<User[]>({
    queryKey: ['/api/leaderboard'],
  });

  // Function to sort players
  const sortPlayers = (a: User, b: User) => {
    let comparison = 0;

    if (sortKey === "points") {
      comparison = a.points - b.points;
    } else if (sortKey === "level") {
      comparison = a.level - b.level;
    } else if (sortKey === "username") {
      comparison = a.username.localeCompare(b.username);
    }

    return sortDirection === "desc" ? -comparison : comparison;
  };

  // Filter players based on search
  const filteredPlayers = players?.filter(player =>
    player.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort filtered players
  const sortedPlayers = filteredPlayers?.sort(sortPlayers);

  // Handle sort click
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      // Toggle direction if same key
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new key and default to descending
      setSortKey(key);
      setSortDirection("desc");
    }
  };

  // Get medal color for top 3 players
  const getMedalColor = (index: number) => {
    switch (index) {
      case 0: return "text-yellow-500 fill-yellow-500";
      case 1: return "text-gray-400 fill-gray-400";
      case 2: return "text-amber-700 fill-amber-700";
      default: return "";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Leaderboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Compete with other players and climb the ranks to become the top gamer on GameZone!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Top Players Cards */}
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <Card key={`top-player-skeleton-${i}`} className="lg:col-span-1">
                <CardContent className="pt-6 text-center">
                  <Skeleton className="h-16 w-16 rounded-full mx-auto mb-3" />
                  <Skeleton className="h-5 w-24 mx-auto mb-1" />
                  <Skeleton className="h-4 w-20 mx-auto mb-3" />
                  <Skeleton className="h-6 w-16 mx-auto" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              {/* Top 3 Players */}
              {sortedPlayers?.slice(0, 3).map((player, index) => (
                <Card key={player.id} className={`lg:col-span-1 ${index === 0 ? 'border-yellow-500 dark:border-yellow-500' : ''}`}>
                  <CardContent className="pt-6 text-center">
                    <div className="relative">
                      <Avatar className="h-16 w-16 mx-auto">
                        <AvatarFallback className="bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400">
                          {player.avatar || player.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {index < 3 && (
                        <div className="absolute -top-2 -right-2">
                          <Medal className={`h-8 w-8 ${getMedalColor(index)}`} />
                        </div>
                      )}
                    </div>
                    
                    <Link href={`/profile/${player.id}`}>
                      <h3 className="font-semibold text-lg mt-3 hover:text-indigo-600 dark:hover:text-indigo-400">
                        {player.username}
                      </h3>
                    </Link>
                    
                    <div className="flex items-center justify-center mt-1 text-gray-600 dark:text-gray-400">
                      <Star className="h-4 w-4 mr-1" />
                      <span>Level {player.level}</span>
                    </div>
                    
                    <div className="mt-3 font-bold text-lg text-indigo-600 dark:text-indigo-400">
                      {player.points.toLocaleString()} points
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Stat Card */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-center">Leaderboard Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-center">
                    <div>
                      <div className="text-2xl font-bold">{players?.length || 0}</div>
                      <div className="text-gray-600 dark:text-gray-400">Total Players</div>
                    </div>
                    
                    <div>
                      <div className="text-2xl font-bold">
                        {players?.[0]?.points?.toLocaleString() || 0}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">Highest Score</div>
                    </div>
                    
                    <div>
                      <div className="text-2xl font-bold">
                        {players?.[0]?.level || 0}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">Highest Level</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>All Players</CardTitle>
              
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search players..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <button 
                        className="flex items-center space-x-1"
                        onClick={() => handleSort("username")}
                      >
                        <span>Player</span>
                        {sortKey === "username" && (
                          sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <button 
                        className="flex items-center space-x-1"
                        onClick={() => handleSort("level")}
                      >
                        <span>Level</span>
                        {sortKey === "level" && (
                          sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <button 
                        className="flex items-center space-x-1"
                        onClick={() => handleSort("points")}
                      >
                        <span>Points</span>
                        {sortKey === "points" && (
                          sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {isLoading ? (
                    Array(10).fill(0).map((_, i) => (
                      <tr key={`player-skeleton-${i}`} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton className="h-5 w-5" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-5 w-24" />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton className="h-5 w-10" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton className="h-5 w-20" />
                        </td>
                      </tr>
                    ))
                  ) : (
                    sortedPlayers?.map((player, index) => (
                      <motion.tr 
                        key={player.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.03 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {index < 3 ? (
                              <Medal className={`h-5 w-5 ${getMedalColor(index)}`} />
                            ) : (
                              <span className="font-semibold text-gray-700 dark:text-gray-300">{index + 1}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400">
                                {player.avatar || player.username.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <Link href={`/profile/${player.id}`}>
                              <span className="font-medium hover:text-indigo-600 dark:hover:text-indigo-400">
                                {player.username}
                              </span>
                            </Link>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span>{player.level}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                          {player.points.toLocaleString()}
                        </td>
                      </motion.tr>
                    ))
                  )}
                  
                  {sortedPlayers?.length === 0 && !isLoading && (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center">
                        <div className="text-gray-500 dark:text-gray-400">
                          <Search className="h-10 w-10 mx-auto mb-3 opacity-50" />
                          <p className="font-medium">No players found</p>
                          <p className="text-sm">Try a different search term</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
