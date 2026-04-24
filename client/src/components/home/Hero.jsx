import React from 'react';
import { Button } from "../ui/button";
import { motion } from 'framer-motion';
import { ArrowRight, MapPinOff, Truck, Navigation } from 'lucide-react';

export function Hero({ onOpenAuth }) {
  return (
    <section id="home" className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden w-full flex items-center min-h-[90vh]">
      {/* Background Animated Blobs */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-blob mix-blend-screen opacity-50 dark:opacity-30"></div>
      <div className="absolute top-1/3 right-1/4 translate-x-1/4 -translate-y-1/4 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-screen opacity-50 dark:opacity-30"></div>
      
      <div className="container px-4 mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-primary font-medium text-sm mb-6 border border-primary/20 shadow-sm shadow-primary/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Smart Rural Delivery Network
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
              Delivering to Every Village, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">No Address Needed.</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto lg:mx-0">
              GramConnect solves last-mile delivery in rural areas. 
              We connect villagers with local delivery agents to ensure packages reach places Amazon and Flipkart can't.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Button 
                onClick={() => onOpenAuth('user')}
                size="lg" 
                className="rounded-full w-full sm:w-auto text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(74,222,128,0.4)] hover:shadow-[0_0_30px_rgba(74,222,128,0.6)] hover:-translate-y-1 transition-all duration-300"
              >
                Get Started <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                onClick={() => onOpenAuth('agent')}
                size="lg" 
                variant="outline" 
                className="rounded-full w-full sm:w-auto text-lg px-8 py-6 border-white/10 dark:border-white/20 bg-white/5 dark:bg-white/5 backdrop-blur-md hover:bg-white/10 dark:hover:bg-white/10 transition-all"
              >
                Become a Partner
              </Button>
            </div>
          </motion.div>

          {/* Visual Illustration Elements */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="flex-1 relative w-full max-w-lg lg:max-w-none mx-auto h-[400px]"
          >
            {/* Main Center Sphere representing Hub */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-gradient-to-br from-primary/80 to-accent/80 backdrop-blur-3xl shadow-[0_0_60px_rgba(74,222,128,0.3)] flex items-center justify-center z-20">
              <Truck className="w-20 h-20 text-primary-foreground drop-shadow-md" />
            </div>

            {/* Orbiting Delivery Points */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full border border-dashed border-primary/30 z-10"
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full glass flex items-center justify-center shadow-lg shadow-primary/20">
                <MapPinOff className="w-5 h-5 text-primary" />
              </div>
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full glass flex items-center justify-center shadow-lg shadow-accent/20">
               <Navigation className="w-5 h-5 text-accent" />
              </div>
            </motion.div>
            
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full border border-primary/10 z-0"
            >
              <div className="absolute top-1/4 -right-4 w-10 h-10 rounded-full bg-primary/20 backdrop-blur-md flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
              </div>
              <div className="absolute bottom-1/4 -left-4 w-10 h-10 rounded-full bg-accent/20 backdrop-blur-md flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
              </div>
            </motion.div>
          </motion.div>
          
        </div>
      </div>
      
      {/* Soft gradient divider at bottom */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
}
