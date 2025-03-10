import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

const colors = [
  "text-indigo-600 dark:text-indigo-400",
  "text-pink-600 dark:text-pink-400",
  "text-yellow-600 dark:text-yellow-400",
  "text-gray-600 dark:text-gray-400",
  "text-gray-600 dark:text-gray-400"
];

const bgColors = [
  "bg-indigo-100 dark:bg-indigo-900",
  "bg-pink-100 dark:bg-pink-900",
  "bg-yellow-100 dark:bg-yellow-900",
  "bg-gray-100 dark:bg-gray-900",
  "bg-gray-100 dark:bg-gray-900"
];

export default function Leaderboard() {
  const { data: topPlayers, isLoading } = useQuery<User[]>({
    queryKey: ['/api/leaderboard'],
  });

  return (
    <section className="py-12 bg-gray-100 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-8">Top Players This Week</h2>
        
        <motion.div 
          className="bg-white dark:bg-gray-700 rounded-xl overflow-hidden shadow-md"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Player</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Games</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Wins</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {isLoading ? (
                  // Loading skeletons
                  Array(5).fill(0).map((_, i) => (
                    <tr key={`skeleton-${i}`} className="hover:bg-gray-50 dark:hover:bg-gray-600 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-6 w-6" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="ml-4">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-4 w-16 mt-1" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-4 w-8" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-4 w-8" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-5 w-16" />
                      </td>
                    </tr>
                  ))
                ) : (
                  topPlayers?.slice(0, 5).map((player, index) => (
                    <tr key={player.id} className="hover:bg-gray-50 dark:hover:bg-gray-600 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={colors[index] + " font-bold"}>{index + 1}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className={`h-10 w-10 rounded-full ${bgColors[index]} flex items-center justify-center`}>
                              <span className={`font-bold ${colors[index]}`}>{player.avatar || player.username.substring(0, 2).toUpperCase()}</span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{player.username}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Level {player.level}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {/* Mock data for games played - in a real app this would come from the user's game history */}
                        {Math.floor(Math.random() * 50) + 50}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {/* Mock data for wins - in a real app this would come from the user's game history */}
                        {Math.floor(Math.random() * 40) + 30}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100 font-semibold">
                          {player.points.toLocaleString()}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600 text-center">
            <Link href="/leaderboard">
              <button className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                View Complete Leaderboard
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
