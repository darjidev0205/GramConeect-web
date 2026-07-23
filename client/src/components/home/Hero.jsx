import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Navigation, ShieldCheck, Zap, Radio, CheckCircle2 } from 'lucide-react';

export const Hero = ({ onOpenAuth }) => {
  return (
    <section className="relative min-h-screen pt-32 pb-20 overflow-hidden bg-[#050816] flex items-center">
      {/* Dynamic Background Glows & Grid */}
      <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none" />
      
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/15 to-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 flex flex-col items-start">
            
            {/* Funding Announcement Pill */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md mb-8 hover:border-blue-500/30 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-medium text-slate-300">
                GramConnect raises $50M Series A to digitize Bharat's Last Mile
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </motion.div>

            {/* Massive Editorial Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08] mb-6 font-display"
            >
              Delivering Every Village.{' '}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent block mt-2">
                Not Every Address.
              </span>
            </motion.h1>

            {/* Paragraph Subtitle */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg sm:text-xl text-slate-400 max-w-2xl font-normal leading-relaxed mb-10"
            >
              India’s first hyper-localized rural distribution network. We bridge tier-1 fulfillment centers to deep village clusters using smart offline technology, micro-hubs, and local village entrepreneurs.
            </motion.p>

            {/* Call to Actions */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto"
            >
              <button
                onClick={() => onOpenAuth('user')}
                className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white font-semibold text-sm shadow-xl shadow-blue-600/30 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
              >
                Track Your Parcel
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onOpenAuth('agent')}
                className="px-8 py-4 rounded-full bg-white/[0.05] hover:bg-white/[0.08] text-white font-semibold text-sm border border-white/10 backdrop-blur-md hover:border-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Become Village Delivery Partner
              </button>
            </motion.div>

            {/* Trust Metrics Bar */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-14 pt-8 border-t border-white/10 grid grid-cols-3 gap-6 w-full max-w-lg"
            >
              <div>
                <div className="text-2xl font-bold text-white font-display">500+</div>
                <div className="text-xs text-slate-400 mt-0.5">Villages Connected</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white font-display">2,500+</div>
                <div className="text-xs text-slate-400 mt-0.5">Village Delivery Agents</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white font-display">99.8%</div>
                <div className="text-xs text-slate-400 mt-0.5">On-Time Completion</div>
              </div>
            </motion.div>

          </div>

          {/* Right Visual Focus: Cinematic 3D Isometric Logistics Network & Floating App */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            
            {/* Outer Decorative Halo */}
            <div className="absolute w-[460px] h-[460px] rounded-full border border-blue-500/20 animate-pulse-glow pointer-events-none" />
            <div className="absolute w-[360px] h-[360px] rounded-full border border-indigo-500/15 pointer-events-none" />

            {/* Main Interactive Logistics Card Mockup */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2 }}
              className="relative w-full max-w-md glass-card rounded-3xl p-6 border border-white/15 bg-[#090d24]/80 backdrop-blur-2xl shadow-2xl shadow-blue-950/80"
            >
              {/* Card Header Status */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                    Live Dispatch Routing
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
                  HUB-IN-8892
                </div>
              </div>

              {/* Simulated Map & Route Grid Visual */}
              <div className="relative h-64 w-full rounded-2xl overflow-hidden bg-[#040612] border border-white/10 p-4 flex flex-col justify-between">
                <div className="absolute inset-0 dot-pattern opacity-60" />
                
                {/* SVG Live Animated Route Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <defs>
                    <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                      <stop offset="50%" stopColor="#6366f1" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#34d399" stopOpacity="1" />
                    </linearGradient>
                  </defs>
                  
                  {/* Arc Paths */}
                  <path 
                    d="M 40 50 Q 150 20 280 100 T 360 210" 
                    fill="none" 
                    stroke="url(#routeGrad)" 
                    strokeWidth="3" 
                    strokeDasharray="6 6"
                    className="animate-pulse"
                  />
                  <path 
                    d="M 40 50 Q 200 140 360 210" 
                    fill="none" 
                    stroke="url(#routeGrad)" 
                    strokeWidth="2"
                    strokeOpacity="0.4"
                  />
                </svg>

                {/* Map Nodes */}
                {/* Node 1: City Warehouse */}
                <div className="relative z-10 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-400 shadow-md">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Metro Central Hub</div>
                    <div className="text-[10px] text-slate-400">Dispatch Time: 05:30 AM</div>
                  </div>
                </div>

                {/* Node 2: Regional Hub */}
                <div className="relative z-10 self-center flex items-center gap-3 bg-white/5 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
                  <Radio className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                  <span className="text-[11px] font-medium text-slate-200">Transit: Taluka Hub (Zone B)</span>
                </div>

                {/* Node 3: Village Agent */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-md">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Rampur Village Agent</div>
                      <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Last 1.2 KM via EV Bike
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-300 font-mono bg-emerald-500/10 text-emerald-300 px-2 py-1 rounded">
                    ETA 12m
                  </span>
                </div>
              </div>

              {/* Floating Live Tracking Card Overlay */}
              <motion.div 
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="mt-4 p-3.5 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                    RA
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Ramesh Patel (Agent)</div>
                    <div className="text-[10px] text-slate-400">Verified Local Logistics Partner</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400">OTP Auth</div>
                  <div className="text-xs font-bold text-cyan-400 font-mono">#9842</div>
                </div>
              </motion.div>

            </motion.div>

          </div>

        </div>
      </div>
    </section>
  );
};
