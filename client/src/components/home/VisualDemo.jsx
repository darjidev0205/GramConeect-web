import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export function VisualDemo() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -60]);

  return (
    <section className="py-16 md:py-28 relative overflow-hidden flex justify-center items-center">
      <div className="container px-5 mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-10 md:gap-16">
          <div className="flex-1 text-center lg:text-left w-full">
            <h2 className="text-[28px] sm:text-4xl md:text-5xl font-bold mb-3 md:mb-6 leading-tight">Designed for simplicity. Built for speed.</h2>
            <p className="text-[16px] md:text-xl text-muted-foreground mb-6 md:mb-8 leading-[1.6]">
              The GramConnect agent app works offline-first. Agents sync updates when they reach network zones, providing seamless uninterrupted handoffs.
            </p>
            <ul className="space-y-3 text-left max-w-md mx-auto lg:mx-0">
              <li className="flex items-center gap-3 text-sm sm:text-base md:text-lg font-medium text-foreground">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">✓</div>
                One-tap delivery confirmation
              </li>
              <li className="flex items-center gap-3 text-sm sm:text-base md:text-lg font-medium text-foreground">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold shrink-0">✓</div>
                Voice-assisted route navigation
              </li>
              <li className="flex items-center gap-3 text-sm sm:text-base md:text-lg font-medium text-foreground">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">✓</div>
                Local language support
              </li>
            </ul>
          </div>
          
          <div className="flex-1 relative flex justify-center w-full mt-6 lg:mt-0">
            {/* The Mockup phone container - width: 260-280px on mobile */}
            <motion.div 
              style={{ y: typeof window !== 'undefined' && window.innerWidth >= 1024 ? y : 0 }}
              className="w-[260px] sm:w-[280px] md:w-[300px] h-[490px] sm:h-[540px] md:h-[580px] bg-black rounded-[36px] md:rounded-[40px] border-[6px] md:border-8 border-gray-800 shadow-2xl shadow-black/50 relative overflow-hidden mx-auto shrink-0"
            >
              {/* iPhone Notch */}
              <div className="absolute top-0 inset-x-0 h-5 md:h-6 flex justify-center z-50">
                <div className="w-28 md:w-32 h-5 md:h-6 bg-gray-800 rounded-b-xl md:rounded-b-2xl"></div>
              </div>
              
              {/* App UI Simulated inside */}
              <div className="w-full h-full bg-[#0a0a0a] flex flex-col items-center pt-9 px-3.5 pb-4">
                
                {/* Header */}
                <div className="w-full flex justify-between items-center mb-5">
                  <div>
                    <div className="text-[10px] text-muted-foreground">Current Hub</div>
                    <div className="text-xs font-bold text-white">Palghar Center Node</div>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">JD</div>
                </div>

                {/* Dashboard Card */}
                <div className="w-full bg-primary rounded-lg md:rounded-xl p-3 mb-4 shadow-md shadow-primary/20 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl transform translate-x-1/2 -translate-y-1/2" />
                   <div className="text-primary-foreground/80 text-[11px] mb-0.5">Active Deliveries</div>
                   <div className="text-3xl font-extrabold text-primary-foreground">24</div>
                   <div className="mt-2 bg-black/20 rounded text-[10px] py-0.5 px-2 text-white w-max">Syncing offline queue 🟢</div>
                </div>

                {/* List of items */}
                <div className="w-full flex-1 overflow-hidden space-y-2.5">
                  <div className="text-[10px] font-semibold text-gray-400 mb-1">NEXT STOPS</div>
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="w-full p-2.5 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded bg-accent/20 flex items-center justify-center text-accent text-[10px]">P{item}</div>
                        <div>
                          <div className="text-xs font-semibold text-white">Ramesh Kumar</div>
                          <div className="text-[10px] text-gray-400">Node #A14</div>
                        </div>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    </div>
                  ))}
                </div>

                {/* Bottom Bar */}
                <div className="w-full h-12 bg-white/5 border-t border-white/10 mt-auto rounded-lg flex justify-around items-center px-3 backdrop-blur-md">
                   <div className="w-5 h-5 rounded-md bg-white/20"></div>
                   <div className="w-5 h-5 rounded-md bg-primary/50 pointer-events-none"></div>
                   <div className="w-5 h-5 rounded-md bg-white/20"></div>
                </div>

              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
