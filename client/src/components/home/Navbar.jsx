import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Menu, X, ChevronRight } from 'lucide-react';

export const Navbar = ({ onOpenAuth }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Mission', href: '#mission' },
    { name: 'Logistics Network', href: '#network' },
    { name: 'App Experience', href: '#app' },
    { name: 'Impact', href: '#impact' },
    { name: 'Partners', href: '#partners' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 lg:px-8 pt-4 pb-2 transition-all duration-300 pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo */}
        <a 
          href="#" 
          className="pointer-events-auto flex items-center gap-3 group focus:outline-none"
        >
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-[1px] shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300">
            <div className="w-full h-full bg-[#050816] rounded-[11px] flex items-center justify-center">
              <span className="font-bold text-lg bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">G</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
              GramConnect
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Series A
              </span>
            </span>
          </div>
        </a>

        {/* Desktop Navigation Pills */}
        <nav className={`pointer-events-auto hidden md:flex items-center gap-1 px-4 py-1.5 rounded-full transition-all duration-300 ${
          scrolled 
            ? 'glass-nav shadow-2xl border border-white/10 bg-[#050816]/80' 
            : 'bg-white/[0.03] border border-white/10 backdrop-blur-md'
        }`}>
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="px-4 py-2 text-xs uppercase tracking-widest font-medium text-slate-300 hover:text-white transition-colors rounded-full hover:bg-white/[0.06]"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="pointer-events-auto hidden md:flex items-center gap-3">
          <button
            onClick={() => onOpenAuth('user')}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </button>
          
          <button
            onClick={() => onOpenAuth('agent')}
            className="relative group overflow-hidden rounded-full p-[1px] font-semibold text-xs transition-all duration-300 shadow-lg shadow-blue-600/25 hover:shadow-blue-500/40"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-400 transition-all duration-300 group-hover:opacity-90"></span>
            <span className="relative px-5 py-2.5 rounded-full bg-[#050816] transition-colors duration-300 group-hover:bg-transparent flex items-center gap-2 text-white">
              Partner Portal
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="pointer-events-auto md:hidden p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-200"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="pointer-events-auto md:hidden mt-3 p-6 rounded-2xl glass-card border border-white/10 bg-[#050816]/95 backdrop-blur-2xl flex flex-col gap-4 shadow-2xl"
          >
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-200 hover:text-blue-400 py-1 flex items-center justify-between"
              >
                {link.name}
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </a>
            ))}
            <div className="pt-4 border-t border-white/10 flex flex-col gap-2.5">
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenAuth('user'); }}
                className="w-full py-2.5 text-center text-xs font-semibold text-slate-200 bg-white/5 rounded-xl border border-white/10"
              >
                Sign In
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenAuth('agent'); }}
                className="w-full py-2.5 text-center text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/25"
              >
                Partner Portal
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
