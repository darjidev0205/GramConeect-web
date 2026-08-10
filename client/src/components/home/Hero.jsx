import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Zap, Radio, CheckCircle2, Navigation, Layers, ShieldCheck } from 'lucide-react';

export const Hero = ({ onOpenAuth }) => {
  return (
    <section className="relative min-h-[700px] lg:min-h-[780px] pt-24 pb-16 lg:pt-32 lg:pb-20 overflow-hidden bg-[#050816] flex items-center justify-center">
      
      {/* 1. Photographic Indian Village Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-[center_right_20%] lg:bg-center-right bg-no-repeat transition-transform duration-1000 scale-[1.02]"
        style={{ backgroundImage: `url('/hero-village-bg.png')` }}
      />

      {/* 2. Multi-Layer Dark Navy Gradient Overlay System */}
      {/* Left-to-Right Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#050816] via-[#050816]/90 to-[#050816]/30 pointer-events-none z-1" />
      
      {/* Radial Top & Center Lighting Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(5,8,22,0.95)_0%,rgba(5,8,22,0.7)_50%,transparent_100%)] pointer-events-none z-1" />

      {/* 3. Subtle Faint Connectivity Topographic Grid Overlay */}
      <div className="absolute inset-0 dot-pattern opacity-20 pointer-events-none z-2" />

      {/* 4. Animated Cyan Logistics Route Beam Line through the environment */}
      <div className="absolute inset-0 pointer-events-none opacity-40 z-2">
        <svg className="w-full h-full" viewBox="0 0 1440 800" fill="none">
          <path d="M-50 450 C 300 350, 600 550, 950 380 C 1200 250, 1350 400, 1500 320" stroke="url(#villageRouteGrad)" strokeWidth="2.5" strokeDasharray="8 6" className="animate-pulse" />
          <circle cx="380" cy="410" r="5" fill="#22d1ee" />
          <circle cx="950" cy="380" r="6" fill="#3b82f6" />
          <circle cx="1280" cy="360" r="5" fill="#38bdf8" />
          <defs>
            <linearGradient id="villageRouteGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22d1ee" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.4" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* 5. Hero Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Hero Content Column */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            
            {/* Funding / Network Badge Pill */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0d1428]/80 border border-cyan-500/20 backdrop-blur-xl mb-5 hover:border-cyan-400/40 transition-colors shadow-lg shadow-black/40"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-mono font-semibold text-slate-200">
                GramConnect Rural Logistics Network
              </span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-mono px-2 py-0.5 rounded-full font-bold">Series A</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12] mb-5 font-display text-left"
            >
              Delivering Every Village.{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-300 to-indigo-400 bg-clip-text text-transparent block mt-1.5">
                Not Every Address.
              </span>
            </motion.h1>

            {/* Subtitle Description */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed mb-8 text-left"
            >
              India’s first hyper-localized rural distribution network. We bridge tier-1 fulfillment centers to deep village clusters using smart offline tech.
            </motion.p>

            {/* Call to Actions */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto mb-8"
            >
              <button
                onClick={() => onOpenAuth('user')}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-semibold text-sm shadow-xl shadow-blue-600/30 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 group cursor-pointer"
              >
                Track Your Parcel
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onOpenAuth('agent')}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#0d1428]/80 hover:bg-[#111a32] text-white font-semibold text-sm border border-white/15 backdrop-blur-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:border-cyan-400/40"
              >
                Become Partner
              </button>
            </motion.div>

            {/* Micro Route Topology Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-slate-400 pt-2 border-t border-white/10 w-full"
            >
              <span className="text-slate-400">Route Flow:</span>
              <span className="text-slate-200 font-bold">Warehouse</span>
              <span className="text-cyan-400">→</span>
              <span className="text-slate-200 font-bold">Regional Hub</span>
              <span className="text-cyan-400">→</span>
              <span className="text-slate-200 font-bold">Village Cluster</span>
              <span className="text-cyan-400">→</span>
              <span className="text-cyan-400 font-bold">Doorstep</span>
            </motion.div>

          </div>

          {/* Right Visual Focus: Integrated Floating Logistics Card over Rural Landscape */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative w-full max-w-md rounded-3xl p-5 border border-white/15 bg-[#080d26]/85 backdrop-blur-3xl shadow-2xl shadow-black/80 hover:border-cyan-400/40 transition-all duration-500"
            >
              {/* Header Bar */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3.5 mb-3.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-emerald-400" />
                    LIVE DISPATCH ROUTING
                  </span>
                </div>
                <div className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
                  HUB-RURAL-9842
                </div>
              </div>

              {/* Network Node Map Screen */}
              <div className="relative h-52 sm:h-60 w-full rounded-2xl overflow-hidden bg-[#040714] border border-white/10 p-4 flex flex-col justify-between">
                <div className="absolute inset-0 dot-pattern opacity-40 pointer-events-none" />
                
                {/* SVG Route Connector */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <path d="M 40 45 Q 160 15 250 90 T 320 160" fill="none" stroke="#22d1ee" strokeWidth="2.5" strokeDasharray="5 5" className="animate-pulse" />
                </svg>

                {/* Node 1: Origin Hub */}
                <div className="relative z-10 flex items-center justify-between bg-white/[0.03] p-2 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-cyan-400">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-white">Central Logistics Hub</div>
                      <div className="text-[10px] text-slate-400">Dispatch: 06:00 AM • Batch #982</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-blue-300 bg-blue-500/20 font-mono font-bold px-2 py-0.5 rounded">
                    TRANSIT
                  </span>
                </div>

                {/* Mid Status Pill */}
                <div className="relative z-10 self-center flex items-center gap-2 bg-cyan-500/10 backdrop-blur-md px-3.5 py-1 rounded-full border border-cyan-500/20 shadow-lg">
                  <Navigation className="w-3 h-3 text-cyan-400 animate-spin" />
                  <span className="text-[10px] font-mono font-bold text-cyan-300 tracking-wide">
                    En Route to Rampur Village Cluster
                  </span>
                </div>

                {/* Node 2: Destination Village Agent */}
                <div className="relative z-10 flex items-center justify-between bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/25">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-white">Rampur Village Partner</div>
                      <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3 h-3" /> Doorstep EV Bike Delivery
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-extrabold text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-md border border-emerald-500/30">
                    ETA 14m
                  </span>
                </div>
              </div>

              {/* Card Footer Metrics */}
              <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> 100% Offline Verified
                </span>
                <span className="text-slate-300 font-bold">54 Parcels Active</span>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      {/* 6. Smooth Bottom Atmospheric Gradient Fade into Next Section */}
      <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 bg-gradient-to-b from-transparent via-[#050816]/80 to-[#050816] pointer-events-none z-10" />

    </section>
  );
};

