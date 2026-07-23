import React from 'react';
import { Button } from "../ui/button";
import { motion } from 'framer-motion';

export function CTA({ onOpenAuth }) {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <div className="container px-5 mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35 }}
          className="bg-gradient-to-br from-primary/20 via-primary/5 to-accent/10 border border-primary/20 rounded-[24px] md:rounded-3xl p-6 sm:p-10 md:p-16 text-center max-w-5xl mx-auto shadow-xl relative overflow-hidden"
        >
          {/* Inner Glow Backgrounds */}
          <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-primary/20 rounded-full blur-[60px] md:blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 sm:w-64 h-48 sm:h-64 bg-accent/20 rounded-full blur-[60px] md:blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-[28px] sm:text-4xl md:text-6xl font-extrabold mb-4 md:mb-6 tracking-tight leading-tight">
              Join the rural delivery <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">revolution.</span>
            </h2>
            <p className="text-[16px] md:text-xl text-muted-foreground mb-6 md:mb-10 max-w-2xl mx-auto leading-[1.6]">
              Whether you want to receive packages at your farm or become the logistics hero of your village, we have a place for you.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <Button 
                onClick={() => onOpenAuth('user')} 
                size="lg" 
                className="rounded-2xl w-full sm:w-auto text-base h-[52px] px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_4px_20px_rgba(59,130,246,0.3)] hover:shadow-[0_4px_25px_rgba(59,130,246,0.5)] active:scale-[0.98] transition-all duration-200"
              >
                Get Started Now
              </Button>
              <Button 
                onClick={() => onOpenAuth('agent')} 
                size="lg" 
                variant="outline" 
                className="rounded-2xl w-full sm:w-auto text-base h-[52px] px-8 border-border/80 dark:border-white/20 bg-background/50 dark:bg-white/5 backdrop-blur-md hover:bg-accent/50 dark:hover:bg-white/10 active:scale-[0.98] transition-all duration-200"
              >
                Become an Agent
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
