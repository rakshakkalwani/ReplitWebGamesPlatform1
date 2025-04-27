import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Game } from "../../shared/schema";
import { GameCard } from "../ui/game-card";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "../ui/skeleton";

export default function FeaturedGames() {
  const { data: games, isLoading } = useQuery<Game[]>({
    queryKey: ['/api/games/featured'],
  });

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 4;

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    if (games) {
      const maxPage = Math.ceil(games.length / itemsPerPage) - 1;
      setCurrentPage((prev) => Math.min(prev + 1, maxPage));
    }
  };

  // Calculate the start and end indices for the current page
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  // Get games for the current page
  const displayedGames = games?.slice(startIndex, endIndex);
  
  // Determine if we can navigate to previous or next page
  const canGoNext = games && endIndex < games.length;
  const canGoPrevious = currentPage > 0;

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Featured Games</h2>
          <Link 
            href="/games"
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            View All
          </Link>
        </div>
        
        <div className="relative">
          {/* Arrow Navigation */}
          <Button
            variant="secondary"
            size="icon"
            className={`absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 rounded-full z-10 hidden md:flex ${
              !canGoPrevious ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handlePrevious}
            disabled={!canGoPrevious}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          
          {/* Game Cards Container */}
          <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 md:space-x-0">
            {isLoading ? (
              // Loading skeletons
              Array(4).fill(0).map((_, i) => (
                <div key={`skeleton-${i}`} className="w-64 md:w-full flex-shrink-0">
                  <Skeleton className="w-full h-40 rounded-t-xl" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="w-3/4 h-6" />
                    <Skeleton className="w-full h-12" />
                    <div className="flex justify-between">
                      <Skeleton className="w-1/3 h-6" />
                      <Skeleton className="w-1/4 h-6" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <AnimatePresence mode="wait">
                <motion.div 
                  key={`page-${currentPage}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full"
                >
                  {displayedGames?.map((game) => (
                    <div key={game.id} className="w-64 md:w-full flex-shrink-0">
                      <GameCard game={game} featured />
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
          
          <Button
            variant="secondary"
            size="icon"
            className={`absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 rounded-full z-10 hidden md:flex ${
              !canGoNext ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handleNext}
            disabled={!canGoNext}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </section>
  );
}
