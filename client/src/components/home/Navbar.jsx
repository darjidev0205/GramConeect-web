import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Menu, X, ChevronRight } from 'lucide-react';

export const Navbar = ({ onOpenAuth }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    // Max tilt range: 2 degrees
    const rotateX = Math.max(-2, Math.min(2, (-mouseY / (rect.height / 2)) * 2));
    const rotateY = Math.max(-2, Math.min(2, (mouseX / (rect.width / 2)) * 2));
    
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  const navLinks = [
    { name: 'Mission', href: '#mission' },
    { name: 'Logistics Network', href: '#network' },
    { name: 'App Experience', href: '#app' },
    { name: 'Impact', href: '#impact' },
    { name: 'Partners', href: '#partners' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 lg:px-[28px] pt-4 pb-2 transition-all duration-300 pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo Container with Brand Name & Series A Badge */}
        <div className="pointer-events-auto flex items-center gap-[12px] group focus:outline-none cursor-pointer">
          <a
            href="#"
            ref={containerRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative inline-flex items-center justify-center cursor-pointer group/logo"
            style={{ perspective: '1000px' }}
          >
            {/* Background Radial Glow Effect */}
            <div 
              className="absolute -inset-4 rounded-full pointer-events-none transition-opacity duration-500"
              style={{
                background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
                opacity: isHovered ? 1 : scrolled ? 0.9 : 0.7
              }}
            />

            {/* Glass Container */}
            <div
              className={`relative flex items-center justify-center p-[10px] rounded-[14px] backdrop-blur-[18px] transition-all animate-logo-float ${
                isHovered
                  ? 'border-[rgba(59,130,246,0.45)] bg-[rgba(255,255,255,0.05)] shadow-lg shadow-blue-500/20'
                  : scrolled
                  ? 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)]'
                  : 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]'
              }`}
              style={{
                borderWidth: '1px',
                borderStyle: 'solid',
                transitionDuration: '350ms',
                transitionTimingFunction: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
                transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? 1.05 : 1}) rotate(${isHovered ? 0.5 : 0}deg)`,
              }}
            >
              {/* Dual Glow Layer behind logo */}
              <div 
                className="absolute inset-0 rounded-[14px] pointer-events-none transition-opacity duration-300"
                style={{
                  boxShadow: isHovered
                    ? '0 0 18px 2px rgba(59,130,246,0.50), 0 0 18px 2px rgba(16,185,129,0.35)'
                    : scrolled
                    ? '0 0 18px 2px rgba(59,130,246,0.385), 0 0 18px 2px rgba(16,185,129,0.275)'
                    : '0 0 18px 2px rgba(59,130,246,0.35), 0 0 18px 2px rgba(16,185,129,0.25)',
                  opacity: 0.85
                }}
              />

              {/* Logo Image */}
              <img
                src="/gramconnect-logo-transparent.png"
                alt="GramConnect - Next-Gen Rural Logistics Infrastructure"
                className="h-[36px] md:h-[40px] lg:h-[44px] w-auto object-contain select-none transition-all duration-300 filter drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]"
                style={{
                  maxHeight: '100%',
                }}
              />
            </div>
          </a>

          {/* Brand Name & Series A Badge with Optical Alignment */}
          <a href="#" className="flex items-center gap-[14px] focus:outline-none">
            <span className="font-bold text-lg md:text-xl tracking-tight text-white flex items-center font-sans">
              GramConnect
            </span>
            <span className="text-[10px] font-semibold tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 backdrop-blur-md shadow-sm">
              Series A
            </span>
          </a>
        </div>

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

