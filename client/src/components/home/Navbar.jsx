import React from 'react';
import { Button } from "../ui/button";
import { useTheme } from "../theme-provider";
import { Sun, Moon, Package } from 'lucide-react';
import { motion } from 'framer-motion';

export function Navbar({ onOpenAuth }) {
  const { theme, setTheme } = useTheme();
  
  return (
    <nav className="fixed top-0 inset-x-0 z-50 glass dark:glass-dark border-b-0 py-4 transition-all duration-300">
      <div className="container px-4 mx-auto flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Package size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 dark:from-white dark:to-white/70">
            GramConnect
          </span>
        </motion.div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#home" className="hover:text-primary transition-colors">Home</a>
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-primary transition-colors">How it Works</a>
          <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <Button onClick={onOpenAuth} className="hidden sm:flex bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(74,222,128,0.3)] hover:shadow-[0_0_25px_rgba(74,222,128,0.5)] transition-all rounded-full px-6">
            Get Started
          </Button>
        </motion.div>
      </div>
    </nav>
  );
}
