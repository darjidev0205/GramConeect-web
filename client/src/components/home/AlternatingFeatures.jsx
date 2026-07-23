import React from 'react';
import { motion } from 'framer-motion';
import { WifiOff, Mic, QrCode, ShieldCheck } from 'lucide-react';

export const AlternatingFeatures = () => {
  return (
    <section className="py-12 md:py-32 bg-[#050816] relative overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12 md:space-y-32">
        
        {/* ROW 1: Compact Split Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-16 items-center">
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="md:col-span-7 relative group"
          >
            <div className="relative rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 glass-card">
              <img 
                src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80" 
                alt="Rural Delivery Route Navigation" 
                className="w-full h-[180px] sm:h-[480px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-transparent to-transparent opacity-90" />

              <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-[#050816]/90 border border-white/15 backdrop-blur-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <WifiOff className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Offline Mesh Sync</div>
                    <div className="text-[10px] text-slate-400">Auto-syncs at village hub range</div>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">
                  Active
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="md:col-span-5 flex flex-col items-start"
          >
            <span className="text-[11px] font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-0.5 rounded-full mb-2">
              Patent-Pending Tech
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-display mb-3 leading-tight">
              Built Where Maps End and Signals Drop
            </h2>
            <p className="text-slate-400 text-xs sm:text-base leading-relaxed mb-4">
              GramConnect uses offline-first peer routing and voice-assisted navigation in regional dialects for 100% precision.
            </p>

            <div className="grid grid-cols-2 gap-2.5 w-full">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                <Mic className="w-4 h-4 text-blue-400 mb-1" />
                <h4 className="text-xs font-bold text-white">Voice Nav</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">5 Dialects</p>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                <WifiOff className="w-4 h-4 text-purple-400 mb-1" />
                <h4 className="text-xs font-bold text-white">Offline Store</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Auto-upload</p>
              </div>
            </div>
          </motion.div>

        </div>

        {/* ROW 2: Compact Split Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-16 items-center">
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="md:col-span-7 relative group md:order-2"
          >
            <div className="relative rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 glass-card">
              <img 
                src="https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80" 
                alt="Village Delivery Agent Handover" 
                className="w-full h-[180px] sm:h-[480px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-transparent to-transparent opacity-90" />

              <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-[#050816]/90 border border-white/15 backdrop-blur-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Verified Agent Handover</div>
                    <div className="text-[10px] text-slate-400">OTP Verified #7721</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-cyan-400 font-mono">
                  +₹45 Earned
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="md:col-span-5 flex flex-col items-start md:order-1"
          >
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-0.5 rounded-full mb-2">
              Empowerment
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-display mb-3 leading-tight">
              Village Delivery Partners
            </h2>
            <p className="text-slate-400 text-xs sm:text-base leading-relaxed mb-4">
              We turn local shopkeepers, youth, and farmers into delivery partners with over 99.8% delivery success rates.
            </p>

            <div className="grid grid-cols-2 gap-2.5 w-full">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                <QrCode className="w-4 h-4 text-emerald-400 mb-1" />
                <h4 className="text-xs font-bold text-white">OTP Handover</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">0% Fraud</p>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                <ShieldCheck className="w-4 h-4 text-cyan-400 mb-1" />
                <h4 className="text-xs font-bold text-white">Cold Storage</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Medicine Safety</p>
              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
};
