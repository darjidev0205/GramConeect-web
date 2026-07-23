import React from 'react';
import { Button } from "../ui/button";
import { motion } from 'framer-motion';
import { ArrowRight, MapPinOff, Truck, Navigation } from 'lucide-react';

export function Hero({ onOpenAuth }) {
  return (
    <section id="home" className="relative pt-24 pb-16 md:pt-44 md:pb-28 overflow-hidden w-full flex items-center min-h-[85vh]">
      {/* Background Animated Blobs */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[280px] sm:w-[450px] h-[280px] sm:h-[450px] bg-primary/20 rounded-full blur-[80px] md:blur-[100px] animate-blob mix-blend-screen opacity-40 dark:opacity-25 pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 translate-x-1/4 -translate-y-1/4 w-[240px] sm:w-[380px] h-[240px] sm:h-[380px] bg-accent/20 rounded-full blur-[80px] md:blur-[100px] animate-blob animation-delay-2000 mix-blend-screen opacity-40 dark:opacity-25 pointer-events-none"></div>
      
      <div className="container px-5 mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex-1 text-center lg:text-left w-full"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-primary font-medium text-[12px] sm:text-sm mb-4 md:mb-6 border border-primary/20 shadow-sm shadow-primary/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Smart Rural Delivery Network
            </div>
            
            <h1 className="text-[34px] sm:text-[40px] md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4 md:mb-6 leading-[1.1]">
              Delivering to Every Village, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent block sm:inline">No Address Needed.</span>
            </h1>
            
            <p className="text-[16px] md:text-xl text-muted-foreground mb-6 md:mb-10 max-w-2xl mx-auto lg:mx-0 leading-[1.6]">
              GramConnect solves last-mile delivery in rural areas. 
              We connect villagers with local delivery agents to ensure packages reach places major e-commerce platforms can't.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 w-full sm:w-auto">
              <Button 
                onClick={() => onOpenAuth('user')}
                size="lg" 
                className="rounded-2xl w-full sm:w-auto text-base h-[52px] px-7 bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_4px_20px_rgba(59,130,246,0.3)] hover:shadow-[0_4px_25px_rgba(59,130,246,0.5)] active:scale-[0.98] transition-all duration-200"
              >
                Get Started <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                onClick={() => onOpenAuth('agent')}
                size="lg" 
                variant="outline" 
                className="rounded-2xl w-full sm:w-auto text-base h-[52px] px-7 border-border/80 dark:border-white/20 bg-background/50 dark:bg-white/5 backdrop-blur-md hover:bg-accent/50 dark:hover:bg-white/10 active:scale-[0.98] transition-all duration-200"
              >
                Become a Partner
              </Button>
            </div>
          </motion.div>

          {/* Visual Illustration Elements - Moved below CTA on mobile, reduced size by ~30% */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="flex-1 relative w-full max-w-[260px] sm:max-w-[340px] lg:max-w-none mx-auto h-[260px] sm:h-[320px] lg:h-[400px] mt-4 lg:mt-0 flex items-center justify-center"
          >
            {/* Main Center Sphere representing Hub */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full bg-gradient-to-br from-primary/80 to-accent/80 backdrop-blur-3xl shadow-[0_0_40px_rgba(59,130,246,0.3)] flex items-center justify-center z-20">
              <Truck className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-primary-foreground drop-shadow-md" />
            </div>

            {/* Inner Orbiting Delivery Points */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] sm:w-[280px] sm:h-[280px] lg:w-[340px] lg:h-[340px] rounded-full border border-dashed border-primary/30 z-10"
            >
              <div className="absolute -top-4 sm:-top-5 left-1/2 -translate-x-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full glass flex items-center justify-center shadow-md shadow-primary/20">
                <MapPinOff className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div className="absolute -bottom-4 sm:-bottom-5 left-1/2 -translate-x-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full glass flex items-center justify-center shadow-md shadow-accent/20">
               <Navigation className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
              </div>
            </motion.div>
            
            {/* Outer Orbiting Path */}
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[255px] h-[255px] sm:w-[330px] sm:h-[330px] lg:w-[440px] lg:h-[440px] rounded-full border border-primary/10 z-0"
            >
              <div className="absolute top-1/4 -right-2 sm:-right-3 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary/20 backdrop-blur-md flex items-center justify-center">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-primary animate-pulse" />
              </div>
              <div className="absolute bottom-1/4 -left-2 sm:-left-3 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-accent/20 backdrop-blur-md flex items-center justify-center">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-accent animate-pulse" />
              </div>
            </motion.div>
          </motion.div>
          
        </div>
      </div>
      
      {/* Soft gradient divider at bottom */}
      <div className="absolute bottom-0 inset-x-0 h-24 sm:h-32 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
    </section>
  );
}
