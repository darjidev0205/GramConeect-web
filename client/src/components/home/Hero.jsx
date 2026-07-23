import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Navigation, ShieldCheck, Zap, Radio, CheckCircle2 } from 'lucide-react';

export const Hero = ({ onOpenAuth }) => {
  return (
    <section className="relative min-h-[85vh] md:min-h-screen pt-24 md:pt-32 pb-12 md:pb-20 overflow-hidden bg-[#050816] flex items-center">
      {/* Dynamic Background Glows & Grid */}
      <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none" />
      
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[800px] h-[350px] sm:h-[500px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/15 to-cyan-500/10 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            
            {/* Funding Announcement Pill */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md mb-4 sm:mb-8 hover:border-blue-500/30 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[11px] sm:text-xs font-medium text-slate-300">
                GramConnect raises $50M Series A
              </span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400" />
            </motion.div>

            {/* Headline: Responsive size 36px-42px on mobile */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-3.5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.12] mb-4 sm:mb-6 font-display"
            >
              Delivering Every Village.{' '}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent block mt-1">
                Not Every Address.
              </span>
            </motion.h1>

            {/* Paragraph Subtitle */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-sm sm:text-xl text-slate-400 max-w-2xl font-normal leading-relaxed mb-6 sm:mb-10"
            >
              India’s first hyper-localized rural distribution network. We bridge tier-1 fulfillment centers to deep village clusters using smart offline tech.
            </motion.p>

            {/* Call to Actions */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mb-6 sm:mb-0"
            >
              <button
                onClick={() => onOpenAuth('user')}
                className="w-full sm:w-auto h-14 sm:h-auto px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white font-semibold text-sm shadow-xl shadow-blue-600/30 hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2 group"
              >
                Track Your Parcel
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onOpenAuth('agent')}
                className="w-full sm:w-auto h-14 sm:h-auto px-8 py-4 rounded-full bg-white/[0.05] hover:bg-white/[0.08] text-white font-semibold text-sm border border-white/10 backdrop-blur-md transition-all flex items-center justify-center gap-2"
              >
                Become Partner
              </button>
            </motion.div>

          </div>

          {/* Right Visual Focus: Compact Mobile Card */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative w-full max-w-md glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/15 bg-[#090d24]/80 backdrop-blur-2xl shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-emerald-400">
                    Live Dispatch Routing
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                  HUB-IN-8892
                </div>
              </div>

              <div className="relative h-44 sm:h-64 w-full rounded-xl overflow-hidden bg-[#040612] border border-white/10 p-3 sm:p-4 flex flex-col justify-between">
                <div className="absolute inset-0 dot-pattern opacity-60" />
                
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <path d="M 30 40 Q 150 10 260 80 T 320 150" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="5 5" className="animate-pulse" />
                </svg>

                <div className="relative z-10 flex items-center gap-2.5">
                  <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-400">
                    <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Metro Central Hub</div>
                    <div className="text-[9px] sm:text-[10px] text-slate-400">Dispatch: 05:30 AM</div>
                  </div>
                </div>

                <div className="relative z-10 self-center flex items-center gap-2 bg-white/5 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                  <Radio className="w-3 h-3 text-indigo-400 animate-spin" />
                  <span className="text-[10px] font-medium text-slate-200">Taluka Hub Transit</span>
                </div>

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                      <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Rampur Agent</div>
                      <div className="text-[9px] sm:text-[10px] text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> EV Bike
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] sm:text-xs font-semibold text-emerald-300 font-mono bg-emerald-500/10 px-2 py-0.5 rounded">
                    ETA 12m
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};
