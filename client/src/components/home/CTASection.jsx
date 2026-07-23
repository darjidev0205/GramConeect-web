import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Package, Truck, ShieldCheck } from 'lucide-react';

export const CTASection = ({ onOpenAuth }) => {
  return (
    <section className="py-32 bg-[#050816] relative overflow-hidden border-t border-white/5">
      
      {/* Massive Gradient Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 via-indigo-900/30 to-purple-900/30 opacity-70 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/20 to-cyan-400/20 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="glass-card rounded-[40px] p-8 sm:p-16 border border-white/15 bg-[#090d24]/90 backdrop-blur-2xl text-center flex flex-col items-center relative overflow-hidden shadow-2xl">
          
          {/* Floating Visual Accent Elements */}
          <motion.div 
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-6 -left-6 p-4 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-cyan-400 hidden sm:block"
          >
            <Package className="w-8 h-8" />
          </motion.div>

          <motion.div 
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-6 -right-6 p-4 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-400 hidden sm:block"
          >
            <Truck className="w-8 h-8" />
          </motion.div>

          <span className="text-xs uppercase font-semibold tracking-widest text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-4 py-1.5 rounded-full mb-6">
            Join the Next-Gen Logistics Movement
          </span>

          <h2 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight font-display max-w-3xl leading-[1.1] mb-6">
            Ready to Connect Your Village to the Global Economy?
          </h2>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mb-10 leading-relaxed">
            Whether you are an enterprise seller wanting last-mile reach, a local shopkeeper ready to earn, or a customer expecting timely deliveries — GramConnect is your bridge.
          </p>

          {/* Action Buttons Trio */}
          <div className="flex flex-wrap items-center justify-center gap-4 w-full sm:w-auto">
            <button
              onClick={() => onOpenAuth('agent')}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-semibold text-sm shadow-xl shadow-blue-600/30 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              Become Partner
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onOpenAuth('agent')}
              className="px-8 py-4 rounded-full bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/15 backdrop-blur-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              Start Delivery
            </button>

            <button
              onClick={() => onOpenAuth('user')}
              className="px-8 py-4 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white font-semibold text-sm border border-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              Track Package
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};
