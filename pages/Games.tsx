import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Game, gameCategories } from "@shared/schema";
import GameCard from "@/components/ui/game-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Games() {
  const [location] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  // Parse any category from URL query params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get("category");
    if (category) {
      setActiveCategory(category);
    } else {
      setActiveCategory("all");
    }
  }, [location]);

  // Set page title
  useEffect(() => {
    document.title = "Games Library | GameZone";
  }, []);

  // Fetch all games
  const { data: allGames, isLoading } = useQuery<Game[]>({
    queryKey: ['/api/games'],
  });

  // Filter games based on search and category
  const filteredGames = allGames?.filter(game => {
    const matchesSearch = searchTerm.trim() === "" ||
      game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = activeCategory === "all" ||
      game.category === activeCategory ||
      game.secondaryCategory === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Handler for category change
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);

    // Update URL to reflect category filter (for bookmarking/sharing)
    const url = new URL(window.location.href);
    if (category === "all") {
      url.searchParams.delete("category");
    } else {
      url.searchParams.set("category", category);
    }
    window.history.pushState({}, "", url.toString());
  };

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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Games Library</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover and play our collection of web games - from puzzles to action, solo to multiplayer
        </p>
      </div>

      {/* Search bar */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
        <Input
          type="text"
          placeholder="Search games..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Category tabs */}
      <Tabs value={activeCategory} onValueChange={handleCategoryChange} className="mb-8">
        <TabsList className="w-full overflow-x-auto flex justify-start space-x-2 sm:justify-center sm:space-x-1 p-1">
          <TabsTrigger value="all" className="px-3 py-1.5 text-sm">
            All
          </TabsTrigger>
          {gameCategories.map(category => (
            <TabsTrigger 
              key={category.id} 
              value={category.id}
              className="px-3 py-1.5 text-sm"
            >
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Games grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array(8).fill(0).map((_, i) => (
            <div key={`skeleton-${i}`} className="rounded-xl overflow-hidden">
              <Skeleton className="w-full h-40" />
              <div className="p-4 space-y-3">
                <Skeleton className="w-3/4 h-6" />
                <Skeleton className="w-full h-12" />
                <div className="flex justify-between">
                  <Skeleton className="w-1/3 h-6" />
                  <Skeleton className="w-1/4 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredGames && filteredGames.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {filteredGames.map(game => (
            <motion.div key={game.id} variants={item}>
              <GameCard game={game} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">No games found</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search or filter to find what you're looking for
          </p>
        </div>
      )}
    </div>
  );
}
