import { useQuery } from "@tanstack/react-query";
import { CategoryCard } from "../ui/category-card";
import { gameCategories, GameCategory } from "@shared/schema";
import { motion } from "framer-motion";
import { Skeleton } from "../ui/skeleton";

export default function Categories() {
  // For this demo, we're using the predefined categories from schema
  // In a real app, we might fetch this from the server
  const categories = gameCategories;

  // Animation variants for staggered animation
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
    <section className="py-12 bg-gray-100 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-8">Game Categories</h2>
        
        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {categories.map((category) => (
            <motion.div key={category.id} variants={item}>
              <CategoryCard category={category} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
