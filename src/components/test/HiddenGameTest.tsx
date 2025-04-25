import { useEffect, useState } from 'react';
import { Game } from '../../../shared/schema';
import { getAllGames } from '../../lib/staticData';

export default function HiddenGameTest() {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadGames() {
      try {
        const allGames = await getAllGames();
        setGames(allGames);
      } catch (error) {
        console.error("Error loading games:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadGames();
  }, []);

  const hasHiddenGame = games.some(game => game.title === "Hidden Test Game");

  return (
    <div className="p-4 border border-gray-200 rounded-md mb-4 bg-gray-50">
      <h3 className="font-bold mb-2">Hidden Game Test</h3>
      {isLoading ? (
        <p>Loading games...</p>
      ) : (
        <div>
          <p>Total games loaded: {games.length}</p>
          <p>Hidden test game found: {hasHiddenGame ? "Yes" : "No"}</p>
          <p className="text-sm mt-2">
            {hasHiddenGame 
              ? "❌ The hidden game filtering is NOT working - hidden games are still displaying"
              : "✅ The hidden game filtering is working - hidden games are being filtered out"}
          </p>
        </div>
      )}
    </div>
  );
}