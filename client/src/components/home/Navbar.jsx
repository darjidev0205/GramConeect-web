import React from 'react';
import { Button } from "../ui/button";
import { useTheme } from "../theme-provider";
import { Sun, Moon, Package } from 'lucide-react';
import { motion } from 'framer-motion';

export function Navbar({ onOpenAuth }) {
  const { theme, setTheme } = useTheme();
  
  return (
    <nav className="fixed top-0 inset-x-0 z-50 glass dark:glass-dark border-b border-border/40 h-[56px] md:h-[64px] flex items-center transition-all duration-300">
      <div className="container px-5 mx-auto flex items-center justify-between h-full">
        <motion.div 
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2.5"
        >
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-md shadow-primary/20">
            <Package size={20} className="md:w-[22px] md:h-[22px]" />
          </div>
          <span className="text-lg md:text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 dark:from-white dark:to-white/70">
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
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2 sm:gap-3"
        >
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full hover:bg-secondary/80 transition-colors text-foreground"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <Button onClick={onOpenAuth} className="hidden sm:flex bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_4px_14px_rgba(59,130,246,0.3)] transition-all rounded-xl px-5 h-10">
            Get Started
          </Button>
        </motion.div>
      </div>
    </nav>
  );
}
