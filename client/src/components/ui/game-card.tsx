import { Game } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

interface GameCardProps {
  game: Game;
  featured?: boolean;
}

export function GameCard({ game, featured = false }: GameCardProps) {
  const {
    id,
    title,
    description,
    thumbnailUrl,
    category,
    rating,
    isFeatured,
    isNew,
  } = game;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full overflow-hidden group">
        <div className="relative">
          <img 
            src={thumbnailUrl} 
            alt={title} 
            className="w-full h-40 object-cover"
          />
          {(isFeatured || isNew) && (
            <div className="absolute top-0 left-0 m-2">
              <span className={`text-white text-xs font-bold px-2 py-1 rounded ${isNew ? 'bg-pink-500' : 'bg-indigo-600'}`}>
                {isNew ? 'NEW' : 'Featured'}
              </span>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {title}
            </h3>
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium ml-1">{rating}</span>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
            {description}
          </p>
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded capitalize">
              {category}
            </span>
            <Link href={`/games/${id}`}>
              <button className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline text-sm">
                Play Now
              </button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default GameCard;
