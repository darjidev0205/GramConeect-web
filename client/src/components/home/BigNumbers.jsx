import React from 'react';
import { motion } from 'framer-motion';

export const BigNumbers = () => {
  const stats = [
    { value: '500+', label: 'Villages Connected', desc: 'Active panchayat distribution hubs' },
    { value: '2,500+', label: 'Local Delivery Partners', desc: 'Rural micro-entrepreneurs earning daily' },
    { value: '1,000,000+', label: 'Parcel Deliveries', desc: 'Zero-loss doorstep dispatches completed' },
  ];

  return (
    <section className="py-32 bg-[#050816] relative overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: idx * 0.15 }}
              className="flex flex-col items-center justify-center p-8 rounded-3xl glass-card border border-white/10"
            >
              <div className="text-5xl sm:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 font-display mb-2">
                {stat.value}
              </div>
              <div className="text-lg font-bold text-white tracking-tight">{stat.label}</div>
              <div className="text-xs text-slate-400 mt-1 max-w-xs">{stat.desc}</div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
