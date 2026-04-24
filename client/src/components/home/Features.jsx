import React from 'react';
import { motion } from 'framer-motion';
import { Map, Users, Clock, WifiOff, Mic } from 'lucide-react';
import { GlassCard } from '../ui/glass-card';

const features = [
  {
    icon: <Map className="w-8 h-8 text-primary" />,
    title: "Smart Address System",
    description: "Our proprietary Plus Code style system assigns exact drop-off nodes for unmapped homes."
  },
  {
    icon: <Users className="w-8 h-8 text-accent" />,
    title: "Local Delivery Agents",
    description: "Empowering villagers to act as the final mile delivery node, bringing trust and local knowledge."
  },
  {
    icon: <Clock className="w-8 h-8 text-primary" />,
    title: "Real-time Tracking",
    description: "Even in low bandwidth areas, keep track of package movements up to the village terminal."
  },
  {
    icon: <WifiOff className="w-8 h-8 text-accent" />,
    title: "Offline Support",
    description: "Scan payloads and update ledgers offline, syncing with the hub automatically when reconnected."
  },
  {
    icon: <Mic className="w-8 h-8 text-primary" />,
    title: "Voice Assistance",
    description: "Multilingual voice-guided delivery instructions built for rural demographics."
  }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export function Features() {
  return (
    <section id="features" className="py-24 relative overflow-hidden">
      <div className="container px-4 mx-auto relative z-10">
        
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-3">Our Platform</h2>
          <h3 className="text-3xl md:text-5xl font-bold mb-6">Designed specifically for the challenges of <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">India's rural landscape.</span></h3>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, i) => (
            <GlassCard key={i} animationProps={{ variants: item }} glow={true}>
              <div className="mb-6 w-16 h-16 rounded-2xl glass-dark flex items-center justify-center">
                {feature.icon}
              </div>
              <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
              <p className="text-muted-foreground leading-relaxed">
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
