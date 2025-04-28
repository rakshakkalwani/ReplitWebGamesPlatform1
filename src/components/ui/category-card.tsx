import { GameCategory } from "@shared/schema";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  Puzzle, PlayCircle, Globe, Flame, Users, Zap,
  Trophy, Text,
  LucideIcon 
} from "lucide-react";

interface CategoryCardProps {
  category: GameCategory;
}

const iconMap: Record<string, LucideIcon> = {
  puzzle: Puzzle,
  "play-circle": PlayCircle,
  globe: Globe,
  flame: Flame,
  users: Users,
  zap: Zap,
  trophy: Trophy,
  text: Text,
};

const colorMap: Record<string, string> = {
  indigo: "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400",
  pink: "bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-400 group-hover:text-pink-600 dark:group-hover:text-pink-400",
  emerald: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400",
  red: "bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 group-hover:text-red-600 dark:group-hover:text-red-400",
  violet: "bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400 group-hover:text-violet-600 dark:group-hover:text-violet-400",
  amber: "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 group-hover:text-amber-600 dark:group-hover:text-amber-400",
};

export function CategoryCard({ category }: CategoryCardProps) {
  const { id, name, count, icon, color } = category;
  const Icon = iconMap[icon];
  const colorClass = colorMap[color];

  return (
    <Link href={`/games?category=${id}`}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="category-card bg-white dark:bg-gray-700 rounded-xl p-4 text-center hover:shadow-md transition-shadow cursor-pointer group"
      >
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${colorClass}`}>
          <Icon className="h-8 w-8" />
        </div>
        <h3 className={`font-semibold ${colorClass}`}>{name}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{count} Games</p>
      </motion.div>
    </Link>
  );
}

export default CategoryCard;
