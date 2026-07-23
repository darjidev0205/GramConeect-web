import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, LayoutGrid, PackageCheck, Home } from 'lucide-react';

const steps = [
  {
    icon: <ShoppingCart className="w-6 h-6" />,
    title: "1. Order Online",
    desc: "Shop from any major e-commerce store with delivery to our nearest hub."
  },
  {
    icon: <LayoutGrid className="w-6 h-6" />,
    title: "2. Selection at Hub",
    desc: "Your package is sorted at the GramConnect terminal closest to your village."
  },
  {
    icon: <PackageCheck className="w-6 h-6" />,
    title: "3. Local Agent Pickup",
    desc: "A verified local village agent picks up batch deliveries for your specific area."
  },
  {
    icon: <Home className="w-6 h-6" />,
    title: "4. Delivered Safely",
    desc: "Hand-delivered to your door using our Smart Address and offline navigation system."
  }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 md:py-24 relative bg-black/20">
      <div className="container px-5 mx-auto">
        <div className="text-center mb-10 md:mb-16 max-w-2xl mx-auto">
          <h2 className="text-[28px] sm:text-4xl md:text-5xl font-bold mb-3 md:mb-6">How it works</h2>
          <p className="text-muted-foreground text-[16px] md:text-lg leading-relaxed">A seamless pipeline connecting urban logistics networks to rural handoffs.</p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-[24px] left-[10%] right-[10%] h-[2px] bg-white/10 z-0">
            <motion.div 
              initial={{ scaleX: 0, transformOrigin: "left" }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="w-full h-full bg-gradient-to-r from-primary to-accent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 relative z-10">
            {steps.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ delay: i * 0.1, duration: 0.3 }}
                className="flex flex-col items-center text-center p-5 md:p-4 rounded-2xl glass-dark border border-white/10 md:border-transparent"
              >
                <div className="w-12 h-12 rounded-full glass border border-primary/30 flex items-center justify-center bg-background/80 mb-4 relative group shadow-sm">
                  <div className="absolute inset-0 rounded-full bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
                  <div className="text-foreground group-hover:text-primary transition-colors relative z-10">
                    {step.icon}
                  </div>
                </div>
                <h4 className="text-[18px] md:text-xl font-bold mb-2 text-foreground">{step.title}</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
