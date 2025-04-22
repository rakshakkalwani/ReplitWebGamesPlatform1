import { motion } from "framer-motion";

export default function CTA() {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <motion.div 
          className="bg-gradient-to-r from-indigo-600 to-indigo-800 dark:from-indigo-700 dark:to-indigo-900 rounded-2xl overflow-hidden shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row items-center p-6 md:p-8">
            <div className="w-full md:w-2/3 text-white mb-6 md:mb-0">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Explore Amazing Games</h2>
              <p className="text-indigo-100 mb-6">Browse our collection of free online games! Find your favorites in various categories and enjoy endless gaming on our static website.</p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <motion.a
                  href="/games"
                  className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-lg hover:bg-gray-100 transition shadow-md text-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Browse Games
                </motion.a>
                <motion.button 
                  className="px-6 py-3 border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Learn More
                </motion.button>
              </div>
            </div>
            <div className="w-full md:w-1/3 flex justify-center">
              <svg 
                className="rounded-lg shadow-2xl w-full max-w-xs"
                viewBox="0 0 300 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="300" height="200" rx="8" fill="#6366F1" />
                <circle cx="150" cy="70" r="30" fill="white" />
                <rect x="110" y="110" width="80" height="10" rx="5" fill="white" />
                <rect x="130" y="130" width="40" height="10" rx="5" fill="white" />
                <rect x="85" y="150" width="130" height="15" rx="7.5" fill="white" />
                <circle cx="60" cy="60" r="15" fill="#F472B6" />
                <circle cx="240" cy="60" r="15" fill="#F472B6" />
                <circle cx="60" cy="140" r="15" fill="#F472B6" />
                <circle cx="240" cy="140" r="15" fill="#F472B6" />
              </svg>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
