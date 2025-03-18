import { motion } from "framer-motion";
import { Link } from "wouter";

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-indigo-600 to-pink-500 dark:from-indigo-800 dark:to-pink-700">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="flex flex-col md:flex-row items-center">
          <motion.div 
            className="w-full md:w-1/2 text-white mb-10 md:mb-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Play the Best Web Games Instantly</h1>
            <p className="text-xl mb-6">No downloads. No installs. Just pure fun at your fingertips.</p>
            <div className="flex space-x-4">
              <Link href="/games">
                <motion.button 
                  className="py-3 px-6 rounded-lg bg-white text-indigo-600 font-bold hover:bg-gray-100 transition-colors shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Play Now
                </motion.button>
              </Link>
              <Link href="/games">
                <motion.button 
                  className="py-3 px-6 rounded-lg border-2 border-white text-white font-bold hover:bg-white/10 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Explore Games
                </motion.button>
              </Link>
            </div>
          </motion.div>
          <motion.div 
            className="w-full md:w-1/2 flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative w-full max-w-md">
              <motion.div 
                className="absolute inset-0 bg-indigo-800/20 blur-xl rounded-2xl"
                animate={{ 
                  scale: [1, 1.05, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
              <svg 
                className="relative rounded-2xl shadow-2xl w-full"
                viewBox="0 0 500 300"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="500" height="300" rx="16" fill="#4F46E5" />
                <path d="M125 150C125 122.386 147.386 100 175 100H325C352.614 100 375 122.386 375 150V200C375 227.614 352.614 250 325 250H175C147.386 250 125 227.614 125 200V150Z" fill="#EC4899" />
                <circle cx="150" cy="175" r="15" fill="white" />
                <circle cx="200" cy="175" r="15" fill="white" />
                <circle cx="250" cy="175" r="15" fill="white" />
                <circle cx="300" cy="175" r="15" fill="white" />
                <circle cx="350" cy="175" r="15" fill="white" />
                <rect x="150" y="50" width="200" height="30" rx="15" fill="white" />
                <rect x="175" y="225" width="150" height="25" rx="12.5" fill="white" />
              </svg>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
        <svg className="absolute bottom-0 w-full h-full transform" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path fill="currentColor" className="text-gray-50 dark:text-gray-900" d="M0,288L60,272C120,256,240,224,360,213.3C480,203,600,213,720,229.3C840,245,960,267,1080,266.7C1200,267,1320,245,1380,234.7L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
        </svg>
      </div>
    </section>
  );
}
