import React from 'react';
import { motion } from 'framer-motion';

export const BigNumbers = () => {
  const stats = [
    { value: '500+', label: 'Villages Connected', desc: 'Active panchayat hubs' },
    { value: '2,500+', label: 'Local Delivery Agents', desc: 'Earning daily payouts' },
    { value: '1M+', label: 'Parcel Deliveries', desc: 'Doorstep completion' },
    { value: '99.8%', label: 'Live SLA Status', desc: 'Verified OTP handovers' },
  ];

  return (
    <section className="py-12 md:py-24 bg-[#050816] relative overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Responsive 2-column grid on mobile (Section 2 design requirement) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 text-center">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl sm:rounded-3xl glass-card border border-white/10"
            >
              <div className="text-3xl sm:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 font-display mb-1">
                {stat.value}
              </div>
              <div className="text-xs sm:text-base font-bold text-white tracking-tight leading-tight">{stat.label}</div>
              <div className="text-[10px] sm:text-xs text-slate-400 mt-1 max-w-xs leading-snug">{stat.desc}</div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
