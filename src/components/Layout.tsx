import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, Instagram, Linkedin } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/projects', label: 'Project' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
    { path: '/admin', label: 'Admin' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="fixed top-0 w-full bg-white/90 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="text-2xl font-normal tracking-tighter">
            <span className="text-accent">CSK</span> <span className="text-gray-900 font-light">architects</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm uppercase tracking-widest transition-colors ${
                  location.pathname === link.path ? 'text-accent font-medium' : 'text-gray-500 hover:text-black'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white pt-24 px-6 md:hidden"
          >
            <nav className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-2xl font-light ${
                    location.pathname === link.path ? 'text-accent' : 'text-gray-900'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow pt-20">
        <Outlet />
      </main>

      <footer className="bg-gray-50 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} CSK architects. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="text-gray-400 hover:text-accent transition-colors">
              <Instagram size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-accent transition-colors">
              <Linkedin size={20} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
