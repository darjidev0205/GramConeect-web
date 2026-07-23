import React from 'react';
import { motion } from 'framer-motion';
import { Mic, WifiOff, Map, QrCode } from 'lucide-react';

export const WhyGramConnect = () => {
  const highlights = [
    {
      title: 'Voice Dialect Navigation',
      desc: 'Turn-by-turn regional dialects.',
      icon: Mic,
      tag: 'Voice',
    },
    {
      title: 'Zero Cellular Sync',
      desc: 'Store-and-forward mesh tech.',
      icon: WifiOff,
      tag: 'Offline',
    },
    {
      title: 'Panchayat Maps',
      desc: 'Unindexed lane navigation.',
      icon: Map,
      tag: 'Spatial AI',
    },
    {
      title: 'Dual QR OTP Proof',
      desc: 'Zero-fraud handover guarantee.',
      icon: QrCode,
      tag: 'Security',
    },
  ];

  return (
    <section className="py-12 md:py-32 bg-[#050816] relative overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8 md:mb-20">
          <span className="text-[11px] sm:text-xs uppercase font-semibold tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full mb-3">
            Why GramConnect Leads
          </span>
          <h2 className="text-2xl sm:text-5xl font-extrabold text-white tracking-tight font-display max-w-3xl">
            Engineered for Next Billion Consumers
          </h2>
        </div>

        {/* 2-Column Responsive Grid on Mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="group glass-card rounded-2xl p-3.5 sm:p-6 border border-white/10 flex flex-col justify-between h-[150px] sm:h-auto"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-cyan-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-mono uppercase font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-xl font-bold text-white tracking-tight leading-tight mb-1 font-display">
                    {item.title}
                  </h3>
                  <p className="text-[10px] sm:text-sm text-slate-400 leading-snug">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
