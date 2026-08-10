import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Package, Truck, ShieldCheck, Navigation } from 'lucide-react';

export const CTASection = ({ onOpenAuth }) => {
  return (
    <section className="py-16 sm:py-24 bg-[#050817] relative overflow-hidden border-t border-white/5">
      
      {/* Container with max width */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Translucent Glass Atmospheric Panel embedded into vibrant village scene */}
        <div className="relative rounded-[28px] sm:rounded-[36px] p-8 sm:p-14 lg:p-20 border border-white/15 bg-[#080e25]/55 backdrop-blur-md text-center flex flex-col items-center overflow-hidden shadow-2xl shadow-black/90">
          
          {/* 1. Cinematic Photographic Indian Village Background Image (60% Visible Environment) */}
          <div 
            className="absolute inset-0 bg-cover bg-[center_right_15%] lg:bg-center-right bg-no-repeat opacity-85 transition-transform duration-1000 scale-[1.02] pointer-events-none brightness-95 contrast-105"
            style={{ backgroundImage: `url('/cta-village-bg.png')` }}
          />

          {/* 2. Directional Readability Gradient Mask (Dark Left for Text Protection, Clear Right for Village) */}
          {/* Left-to-Right Directional Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#050817] via-[#050817]/80 via-45% to-transparent pointer-events-none z-1" />

          {/* Focused Dark Radial Mask Directly Behind Heading & Text */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left_center,rgba(5,8,23,0.88)_0%,rgba(5,8,23,0.45)_55%,transparent_85%)] pointer-events-none z-1" />

          {/* Subtle Ambient Indigo Radial Glow */}
          <div className="absolute -top-20 -left-20 w-[600px] h-[400px] bg-gradient-to-tr from-blue-600/15 via-indigo-600/15 to-transparent rounded-full blur-[120px] pointer-events-none z-1" />

          {/* 3. Subtle Technology Layer Route following the village road */}
          <div className="absolute inset-0 pointer-events-none opacity-45 z-2">
            <svg className="w-full h-full" viewBox="0 0 1200 500" fill="none">
              <path d="M 120 400 C 380 320, 680 440, 960 250 T 1150 140" stroke="url(#ctaRouteGrad)" strokeWidth="2.5" strokeDasharray="6 6" className="animate-pulse" />
              <circle cx="380" cy="340" r="4.5" fill="#22d1ee" />
              <circle cx="960" cy="250" r="5.5" fill="#38bdf8" />
              <defs>
                <linearGradient id="ctaRouteGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22d1ee" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Integrated Floating Technology Indicators */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-8 left-8 p-3.5 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 backdrop-blur-md hidden lg:flex items-center gap-2 text-xs font-mono font-bold z-10 shadow-lg"
          >
            <Package className="w-5 h-5 text-cyan-400" />
            <span>Village Cluster Hub</span>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-8 right-8 p-3.5 rounded-2xl bg-purple-600/25 border border-purple-500/35 text-purple-300 backdrop-blur-md hidden lg:flex items-center gap-2 text-xs font-mono font-bold z-10 shadow-lg"
          >
            <Truck className="w-5 h-5 text-purple-300" />
            <span>Last-Mile Dispatch</span>
          </motion.div>

          {/* Main Content Area */}
          <div className="relative z-10 flex flex-col items-center lg:items-start text-center lg:text-left max-w-2xl lg:max-w-xl mr-auto lg:ml-4">
            
            {/* Eyebrow Label */}
            <span className="text-xs uppercase font-mono font-bold tracking-widest text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-4 py-1.5 rounded-full mb-6 backdrop-blur-md shadow-sm">
              JOIN THE NEXT-GEN LOGISTICS MOVEMENT
            </span>

            {/* Main Section Hero Heading */}
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight font-display max-w-xl leading-[1.12] mb-6 text-center lg:text-left">
              Ready to Connect Your{' '}
              <span className="bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent block mt-1">
                Village to the Global Economy?
              </span>
            </h2>

            {/* Paragraph Subtitle */}
            <p className="text-slate-300 text-sm sm:text-base lg:text-lg max-w-[540px] mb-10 leading-relaxed font-normal text-center lg:text-left">
              Whether you are an enterprise seller wanting last-mile reach, a local shopkeeper ready to earn, or a customer expecting timely deliveries — GramConnect is your bridge.
            </p>

            {/* Action Buttons Trio (Horizontal on Desktop, Stacked on Mobile) */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 w-full sm:w-auto">
              <button
                onClick={() => onOpenAuth('agent')}
                className="w-full sm:w-auto h-13 px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-semibold text-sm shadow-xl shadow-blue-600/30 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                Become Partner
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onOpenAuth('agent')}
                className="w-full sm:w-auto h-13 px-8 py-4 rounded-full bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/15 backdrop-blur-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:border-cyan-400/40"
              >
                Start Delivery
              </button>

              <button
                onClick={() => onOpenAuth('user')}
                className="w-full sm:w-auto h-13 px-8 py-4 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white font-semibold text-sm border border-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Track Package
              </button>
            </div>

            {/* Micro Guarantee Badge */}
            <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-center lg:justify-start gap-2 text-xs text-slate-400 font-mono w-full">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Instant Setup • Zero Capital Investment Needed</span>
            </div>

          </div>

          {/* 4. Bottom Smooth Fade into Footer */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-[#050817] pointer-events-none z-10" />

        </div>
      </div>

    </section>
  );
};


