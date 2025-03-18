import Hero from "../components/home/Hero";
import FeaturedGames from "../components/home/FeaturedGames";
import Categories from "../components/home/Categories";
import PopularAndNewGames from "../components/home/PopularAndNewGames";
import Leaderboard from "../components/home/Leaderboard";
import CTA from "../components/home/CTA";
import { useEffect } from "react";

export default function Home() {
  // Set page title
  useEffect(() => {
    document.title = "GameZone - Play Web Games Instantly";
  }, []);
  
  return (
    <main>
      <Hero />
      <FeaturedGames />
      <Categories />
      <PopularAndNewGames />
      <Leaderboard />
      <CTA />
    </main>
  );
}
