import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Game } from "@shared/schema";
import GameCard from "@/components/ui/game-card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function FeaturedGames() {
  const { data: games, isLoading } = useQuery<Game[]>({
    queryKey: ['/api/games/featured'],
  });

  const [startIndex, setStartIndex] = useState(0);
  const itemsPerPage = 4;

  const handlePrevious = () => {
    setStartIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    if (games) {
      setStartIndex((prev) => Math.min(prev + 1, games.length - itemsPerPage));
    }
  };

  const displayedGames = games?.slice(startIndex, startIndex + itemsPerPage);
  const canGoNext = games && startIndex < games.length - itemsPerPage;
  const canGoPrevious = startIndex > 0;

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Featured Games</h2>
          <Link href="/games">
            <a className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">View All</a>
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
            <AnimatePresence mode="wait">
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
                displayedGames?.map((game) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="w-64 md:w-full flex-shrink-0"
                  >
                    <GameCard game={game} featured />
                  </motion.div>
                ))
              )}
            </AnimatePresence>
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
