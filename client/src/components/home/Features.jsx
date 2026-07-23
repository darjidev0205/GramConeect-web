import React from 'react';
import { motion } from 'framer-motion';
import { Map, Users, Clock, WifiOff, Mic } from 'lucide-react';
import { GlassCard } from '../ui/glass-card';

const features = [
  {
    icon: <Map className="w-6 h-6 text-primary" />,
    title: "Smart Address System",
    description: "Our proprietary Plus Code style system assigns exact drop-off nodes for unmapped homes."
  },
  {
    icon: <Users className="w-6 h-6 text-accent" />,
    title: "Local Delivery Agents",
    description: "Empowering villagers to act as the final mile delivery node, bringing trust and local knowledge."
  },
  {
    icon: <Clock className="w-6 h-6 text-primary" />,
    title: "Real-time Tracking",
    description: "Even in low bandwidth areas, keep track of package movements up to the village terminal."
  },
  {
    icon: <WifiOff className="w-6 h-6 text-accent" />,
    title: "Offline Support",
    description: "Scan payloads and update ledgers offline, syncing with the hub automatically when reconnected."
  },
  {
    icon: <Mic className="w-6 h-6 text-primary" />,
    title: "Voice Assistance",
    description: "Multilingual voice-guided delivery instructions built for rural demographics."
  }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

export function Features() {
  return (
    <section id="features" className="py-16 md:py-24 relative overflow-hidden">
      <div className="container px-5 mx-auto relative z-10">
        
        <div className="text-center mb-10 md:mb-16 max-w-3xl mx-auto">
          <h2 className="text-[12px] sm:text-sm font-bold text-primary uppercase tracking-widest mb-2">Our Platform</h2>
          <h3 className="text-[28px] sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 leading-tight">Designed specifically for the challenges of <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">India's rural landscape.</span></h3>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
        >
          {features.map((feature, i) => (
            <GlassCard key={i} animationProps={{ variants: item }} glow={true} className="p-5 md:p-6 rounded-2xl">
              <div className="mb-4 w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center border border-primary/20 shadow-sm">
                {feature.icon}
              </div>
              <h4 className="text-[18px] md:text-xl font-bold mb-2 text-foreground">{feature.title}</h4>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                {feature.description}
              </p>
            </GlassCard>
          ))}
        </motion.div>
      </div>
      
      {/* Background radial gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[1000px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
    </section>
  );
}
