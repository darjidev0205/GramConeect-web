import React from 'react';
import { Button } from "../ui/button";
import { motion } from 'framer-motion';

export function CTA({ onOpenAuth }) {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container px-4 mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-primary/20 via-primary/5 to-accent/10 border border-primary/20 rounded-3xl p-10 md:p-16 text-center max-w-5xl mx-auto shadow-2xl relative overflow-hidden"
        >
          {/* Inner Glow Backgrounds */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/30 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/30 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
              Join the rural delivery <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">revolution.</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Whether you want to receive packages at your farm or become the logistics hero of your village, we have a place for you.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Button onClick={() => onOpenAuth('user')} size="lg" className="rounded-full w-full sm:w-auto text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(74,222,128,0.3)] transition-all">
                Get Started Now
              </Button>
              <Button onClick={() => onOpenAuth('agent')} size="lg" variant="outline" className="rounded-full w-full sm:w-auto text-lg px-8 py-6 border-white/20 glass hover:bg-white/10 transition-all">
                Become an Agent
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
