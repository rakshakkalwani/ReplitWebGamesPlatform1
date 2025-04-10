import { useQuery } from "@tanstack/react-query";
import { Game } from "@shared/schema";
import { Link } from "wouter";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "../../components/ui/skeleton";

export default function PopularAndNewGames() {
  const { data: popularGames, isLoading: popularLoading } = useQuery<Game[]>({
    queryKey: ['/api/games/popular'],
  });

  const { data: newGames, isLoading: newLoading } = useQuery<Game[]>({
    queryKey: ['/api/games/new'],
  });

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Popular Games */}
          <div className="w-full md:w-1/2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Most Popular</h2>
              <Link href="/games" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                See All
              </Link>
            </div>
            
            <motion.div 
              className="space-y-4"
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
            >
              {popularLoading ? (
                // Loading skeletons
                Array(3).fill(0).map((_, i) => (
                  <div key={`popular-skeleton-${i}`} className="flex bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm">
                    <Skeleton className="w-24 h-24" />
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start">
                        <Skeleton className="w-1/3 h-6 mb-2" />
                        <Skeleton className="w-10 h-4" />
                      </div>
                      <Skeleton className="w-2/3 h-4 mb-2" />
                      <div className="flex items-center justify-between mt-2">
                        <Skeleton className="w-1/4 h-4" />
                        <Skeleton className="w-12 h-5" />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                popularGames?.slice(0, 3).map((game) => (
                  <motion.div
                    key={game.id}
                    variants={item}
                    className="flex bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <img 
                      src={game.thumbnailUrl} 
                      alt={game.title} 
                      className="w-24 h-24 object-cover" 
                    />
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{game.title}</h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm capitalize">
                            {game.category} {game.secondaryCategory && `• ${game.secondaryCategory}`}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-medium ml-1">{game.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {((game.playCount || 0) / 1000).toFixed(1)}K+ players
                        </span>
                        <Link href={`/games/${game.id}`} className="text-indigo-600 dark:text-indigo-400 text-sm font-medium">
                          Play
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          </div>
          
          {/* New Games */}
          <div className="w-full md:w-1/2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">New Releases</h2>
              <Link href="/games" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                See All
              </Link>
            </div>
            
            <motion.div 
              className="space-y-4"
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
            >
              {newLoading ? (
                // Loading skeletons
                Array(3).fill(0).map((_, i) => (
                  <div key={`new-skeleton-${i}`} className="flex bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm">
                    <Skeleton className="w-24 h-24" />
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start">
                        <Skeleton className="w-1/3 h-6 mb-2" />
                        <Skeleton className="w-10 h-4" />
                      </div>
                      <Skeleton className="w-2/3 h-4 mb-2" />
                      <div className="flex items-center justify-between mt-2">
                        <Skeleton className="w-1/4 h-4" />
                        <Skeleton className="w-12 h-5" />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                newGames?.slice(0, 3).map((game) => (
                  <motion.div
                    key={game.id}
                    variants={item}
                    className="flex bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <img 
                      src={game.thumbnailUrl} 
                      alt={game.title} 
                      className="w-24 h-24 object-cover" 
                    />
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{game.title}</h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm capitalize">
                            {game.category} {game.secondaryCategory && `• ${game.secondaryCategory}`}
                          </p>
                        </div>
                        <span className="bg-pink-500 text-white text-xs px-2 py-1 rounded-full">NEW</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-medium ml-1">{game.rating}</span>
                        </div>
                        <Link href={`/games/${game.id}`} className="text-indigo-600 dark:text-indigo-400 text-sm font-medium">
                          Play
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
