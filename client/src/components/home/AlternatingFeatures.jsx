import React from 'react';
import { motion } from 'framer-motion';
import { WifiOff, Mic, QrCode, ShieldCheck, MapPin, Smartphone } from 'lucide-react';

export const AlternatingFeatures = () => {
  return (
    <section className="py-32 bg-[#050816] relative overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-32">
        
        {/* ROW 1: LEFT IMAGE, RIGHT TEXT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Visual Focus: High Impact Photography */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-7 relative group"
          >
            <div className="relative rounded-3xl overflow-hidden border border-white/10 glass-card">
              <img 
                src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80" 
                alt="Rural Delivery Route Navigation" 
                className="w-full h-[420px] sm:h-[480px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-transparent to-transparent opacity-90" />

              {/* Floating UI Widget: Offline Mesh Status */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-[#050816]/90 border border-white/15 backdrop-blur-xl flex items-center justify-between shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <WifiOff className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Zero Cellular Signal Sync</div>
                    <div className="text-[11px] text-slate-400">Mesh protocol auto-syncs when agent reaches village hub</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-md">
                  Active
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right Text */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-5 flex flex-col items-start"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3.5 py-1 rounded-full mb-4">
              Patent-Pending Tech
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display mb-6 leading-tight">
              Built for Terrain Where Maps End and Signals Drop
            </h2>
            <p className="text-slate-400 text-base leading-relaxed mb-8">
              Rural deliveries fail when standard GPS models freeze. GramConnect uses offline-first peer routing and voice-assisted navigation in regional dialects so agents deliver with 100% precision.
            </p>

            <div className="space-y-4 w-full">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-4">
                <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 mt-0.5">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Voice & Dialect Navigation</h4>
                  <p className="text-xs text-slate-400 mt-1">Audio guidance in Hindi, Marathi, Bengali, Telugu & Kannada.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-4">
                <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400 mt-0.5">
                  <WifiOff className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Offline Store-and-Forward</h4>
                  <p className="text-xs text-slate-400 mt-1">Saves delivery proofs locally until connectivity restores.</p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* ROW 2: RIGHT IMAGE, LEFT TEXT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Text */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-5 flex flex-col items-start order-2 lg:order-1"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1 rounded-full mb-4">
              Micro-Entrepreneurship
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display mb-6 leading-tight">
              Empowering Local Village Agents as Delivery Partners
            </h2>
            <p className="text-slate-400 text-base leading-relaxed mb-8">
              We turn local shopkeepers, youth, and farmers into trusted delivery partners. By utilizing existing community relationships, delivery success rates soar to over 99.8%.
            </p>

            <div className="space-y-4 w-full">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-4">
                <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 mt-0.5">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Instant QR & OTP Verification</h4>
                  <p className="text-xs text-slate-400 mt-1">Zero fraud guarantee with secure two-factor delivery handover.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-4">
                <div className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Cold-Chain & Medicine Safety</h4>
                  <p className="text-xs text-slate-400 mt-1">Temperature-monitored pouches for critical medical dispatches.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Visual Focus: High Impact Photography */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-7 relative group order-1 lg:order-2"
          >
            <div className="relative rounded-3xl overflow-hidden border border-white/10 glass-card">
              <img 
                src="https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80" 
                alt="Village Delivery Agent Handover" 
                className="w-full h-[420px] sm:h-[480px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-transparent to-transparent opacity-90" />

              {/* Floating UI Widget: Verified Agent */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-[#050816]/90 border border-white/15 backdrop-blur-xl flex items-center justify-between shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Verified Delivery Handover</div>
                    <div className="text-[11px] text-slate-400">Package #GC-88391 • Verified by OTP 7721</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-cyan-400 font-mono">
                  +₹45 Earned
                </span>
              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
};
