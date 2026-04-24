import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export function VisualDemo() {
  const { scrollYProgress } = useScroll();
  // We'll subtly translate the mockup up as we scroll
  const y = useTransform(scrollYProgress, [0, 1], [0, -150]);

  return (
    <section className="py-32 relative overflow-hidden flex justify-center items-center">
      <div className="container px-4 mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-center lg:text-left">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Designed for simplicity. Built for speed.</h2>
            <p className="text-xl text-muted-foreground mb-8">
              The GramConnect agent app works offline-first. Agents sync updates when they reach network zones, providing seamless uninterrupted handoffs.
            </p>
            <ul className="space-y-4 text-left max-w-md mx-auto lg:mx-0">
              <li className="flex items-center gap-3 text-lg font-medium">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm">✓</div>
                One-tap delivery confirmation
              </li>
              <li className="flex items-center gap-3 text-lg font-medium">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm">✓</div>
                Voice-assisted route navigation
              </li>
              <li className="flex items-center gap-3 text-lg font-medium">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm">✓</div>
                Local language support
              </li>
            </ul>
          </div>
          
          <div className="flex-1 relative flex justify-center h-[600px] w-full">
            {/* The Mockup phone container */}
            <motion.div 
              style={{ y }}
              className="w-[300px] h-[600px] bg-black rounded-[40px] border-8 border-gray-800 shadow-2xl relative overflow-hidden"
            >
              {/* iPhone Notch */}
              <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50">
                <div className="w-32 h-6 bg-gray-800 rounded-b-2xl"></div>
              </div>
              
              {/* App UI Simulated inside */}
              <div className="w-full h-full bg-[#0a0a0a] flex flex-col items-center pt-12 px-4 pb-6">
                
                {/* Header */}
                <div className="w-full flex justify-between items-center mb-8">
                  <div>
                    <div className="text-xs text-muted-foreground">Current Hub</div>
                    <div className="text-sm font-bold text-white">Palghar Center Node</div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">JD</div>
                </div>

                {/* Dashboard Card */}
                <div className="w-full bg-primary rounded-xl p-4 mb-6 shadow-lg shadow-primary/20 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2" />
                   <div className="text-primary-foreground/80 text-sm mb-1">Active Deliveries</div>
                   <div className="text-4xl font-extrabold text-primary-foreground">24</div>
                   <div className="mt-4 bg-black/20 rounded text-xs py-1 px-2 text-white w-max">Syncing offline queue 🟢</div>
                </div>

                {/* List of items */}
                <div className="w-full flex-1 overflow-hidden space-y-3">
                  <div className="text-xs font-semibold text-gray-400 mb-2">NEXT STOPS</div>
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="w-full p-3 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-accent/20 flex items-center justify-center text-accent text-xs">P{item}</div>
                        <div>
                          <div className="text-sm font-semibold text-white">Ramesh Kumar</div>
                          <div className="text-xs text-gray-400">Node #A14</div>
                        </div>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    </div>
                  ))}
                </div>

                {/* Bottom Bar */}
                <div className="w-full h-16 bg-white/5 border-t border-white/10 mt-auto rounded-xl flex justify-around items-center px-4 backdrop-blur-md">
                   <div className="w-6 h-6 rounded-md bg-white/20"></div>
                   <div className="w-6 h-6 rounded-md bg-primary/50 pointer-events-none"></div>
                   <div className="w-6 h-6 rounded-md bg-white/20"></div>
                </div>

              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
