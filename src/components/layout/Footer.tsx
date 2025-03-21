import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <Link href="/">
              <div className="flex items-center space-x-2 mb-4 cursor-pointer">
                <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">G</span>
                </div>
                <span className="font-bold text-xl text-white">GameZone</span>
              </div>
            </Link>
            <p className="mb-4">The best platform for casual gaming with friends. Play instantly without downloads or installations.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Github className="h-6 w-6" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Games</h3>
            <ul className="space-y-2">
              <li><Link href="/games?category=arcade" className="hover:text-white transition">Arcade</Link></li>
              <li><Link href="/games?category=puzzle" className="hover:text-white transition">Puzzle</Link></li>
              <li><Link href="/games?category=action" className="hover:text-white transition">Action</Link></li>
              <li><Link href="/games?category=adventure" className="hover:text-white transition">Adventure</Link></li>
              <li><Link href="/games?category=multiplayer" className="hover:text-white transition">Multiplayer</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition">Blog</a></li>
              <li><a href="#" className="hover:text-white transition">Developers</a></li>
              <li><a href="#" className="hover:text-white transition">Support</a></li>
              <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition">About Us</a></li>
              <li><a href="#" className="hover:text-white transition">Careers</a></li>
              <li><a href="#" className="hover:text-white transition">Press</a></li>
              <li><a href="#" className="hover:text-white transition">Contact</a></li>
              <li><a href="#" className="hover:text-white transition">Partners</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
          <p>&copy; {new Date().getFullYear()} GameZone. All rights reserved.</p>
          <p className="text-xs mt-2 text-gray-500">v1.0.0-{import.meta.env.PROD ? 'p' : 'd'}</p>
        </div>
      </div>
    </footer>
  );
}
