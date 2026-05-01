import { Link, useLocation } from 'react-router-dom';
import { Activity, Brain, FileBox, Info, History } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/', icon: <Activity className="w-4 h-4 mr-2" /> },
    { name: 'Diagnose', path: '/diagnose', icon: <Brain className="w-4 h-4 mr-2" /> },
    { name: 'History', path: '/history', icon: <History className="w-4 h-4 mr-2" /> },
    { name: 'Models', path: '/models', icon: <FileBox className="w-4 h-4 mr-2" /> },
    { name: 'About', path: '/about', icon: <Info className="w-4 h-4 mr-2" /> },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-med-navy/80 backdrop-blur-xl border-b border-white/5 h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-med-teal/10 flex items-center justify-center group-hover:bg-med-teal/20 transition-all duration-300">
              <Activity className="w-5 h-5 text-med-teal" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-white">
              Medi<span className="text-med-teal">Scan</span>
            </span>
          </Link>

          {/* Links */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative flex items-center px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${
                    isActive ? 'text-med-teal' : 'text-med-muted hover:text-white'
                  }`}
                >
                  {link.icon}
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute bottom-0 left-4 right-4 h-[2px] bg-med-teal rounded-t-full shadow-[0_0_15px_rgba(0,180,216,0.8)]"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
          
          {/* Mobile indicator */}
          <div className="md:hidden w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
            <div className="w-4 h-0.5 bg-med-teal rounded-full relative after:content-[''] after:absolute after:top-1.5 after:left-0 after:w-4 after:h-0.5 after:bg-med-teal before:content-[''] before:absolute before:-top-1.5 before:left-0 before:w-4 before:h-0.5 before:bg-med-teal" />
          </div>
        </div>
      </div>
    </nav>
  );
}
