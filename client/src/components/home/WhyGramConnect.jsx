import React from 'react';
import { motion } from 'framer-motion';
import { Mic, WifiOff, Map, QrCode, Globe, ShieldCheck } from 'lucide-react';

export const WhyGramConnect = () => {
  const highlights = [
    {
      title: 'Voice-Guided Dialect Navigation',
      desc: 'Hands-free turn-by-turn navigation pronounced clearly in local dialects for effortless village traversal.',
      icon: Mic,
      tag: 'Accessibility',
      image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Zero Connectivity Store-and-Forward',
      desc: 'Full app functionality without active cellular network signals. Encrypted proofs auto-upload at hub range.',
      icon: WifiOff,
      tag: 'Resilience',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Micro-Targeted Panchayat Maps',
      desc: 'Custom spatial map overlays mapping unindexed rural lanes, landmarks, and farm clusters.',
      icon: Map,
      tag: 'Spatial AI',
      image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Dual QR & OTP Proof of Handover',
      desc: 'Guaranteed 0% fraud rates via multi-factor authentication delivered directly to customer mobile phones.',
      icon: QrCode,
      tag: 'Security',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
    },
  ];

  return (
    <section className="py-32 bg-[#050816] relative overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-20">
          <span className="text-xs uppercase font-semibold tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3.5 py-1 rounded-full mb-4">
            Why GramConnect Leads
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display max-w-3xl">
            Engineered Specifically for the Next Billion Consumers
          </h2>
          <p className="text-slate-400 text-base sm:text-lg mt-4 max-w-2xl">
            Standard logistics platforms fail in rural India. Here is why enterprise e-commerce companies trust GramConnect.
          </p>
        </div>

        {/* Asymmetrical Assembled Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="group glass-card rounded-3xl p-6 sm:p-8 border border-white/10 hover:border-cyan-500/30 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600/20 to-cyan-400/20 border border-blue-500/30 flex items-center justify-center text-cyan-400">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-slate-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-3 font-display">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-6">
                    {item.desc}
                  </p>
                </div>

                <div className="relative h-44 w-full rounded-2xl overflow-hidden border border-white/10 mt-4">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-transparent to-transparent" />
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
