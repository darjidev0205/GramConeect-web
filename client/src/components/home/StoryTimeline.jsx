import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Truck, Warehouse, UserCheck, Home, ArrowRight, Check } from 'lucide-react';

export const StoryTimeline = () => {
  const steps = [
    {
      id: '01',
      title: 'City Warehouse',
      location: 'Central Fulfillment Hub',
      desc: 'High-volume sorting and barcode allocation for rural dispatches.',
      icon: Building2,
      badge: 'Step 1',
      delay: 0,
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: '02',
      title: 'Regional Hub',
      location: 'District Distribution Center',
      desc: 'Automated sorting into sub-district cluster routes.',
      icon: Warehouse,
      badge: 'Step 2',
      delay: 0.1,
      image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: '03',
      title: 'Village Hub',
      location: 'Panchayat Micro Point',
      desc: 'Consolidated drop-off point managed with offline sync tech.',
      icon: Truck,
      badge: 'Step 3',
      delay: 0.2,
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: '04',
      title: 'Local Agent',
      location: 'GramConnect Delivery Partner',
      desc: 'Local village partner assigned for last-mile doorstep delivery.',
      icon: UserCheck,
      badge: 'Step 4',
      delay: 0.3,
      image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: '05',
      title: 'Farmer & Resident',
      location: 'Doorstep Village Delivery',
      desc: 'OTP & voice verification upon successful package handover.',
      icon: Home,
      badge: 'Final Step',
      delay: 0.4,
      image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
    },
  ];

  return (
    <section id="network" className="py-28 bg-[#050816] relative overflow-hidden border-t border-white/5">
      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[400px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-20">
          <span className="text-xs uppercase font-semibold tracking-widest text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3.5 py-1 rounded-full mb-4">
            How The Supply Chain Moves
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display max-w-3xl">
            From Metro Warehouses directly into Rural Homes
          </h2>
          <p className="text-slate-400 text-base sm:text-lg mt-4 max-w-2xl">
            An uninterrupted 5-stage logistics pipeline engineered for terrain, bandwidth, and trust.
          </p>
        </div>

        {/* Horizontal Storytelling Steps Container */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: step.delay }}
                className="group relative flex flex-col justify-between p-5 rounded-3xl glass-card border border-white/10 hover:border-blue-500/40 transition-all duration-300 min-h-[340px]"
              >
                {/* Step Top */}
                <div>
                  <div className="relative h-32 w-full rounded-2xl overflow-hidden mb-4 border border-white/10">
                    <img 
                      src={step.image} 
                      alt={step.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-transparent to-transparent opacity-80" />
                    <span className="absolute top-2 left-2 text-[10px] font-bold text-white font-mono bg-blue-600/80 px-2 py-0.5 rounded backdrop-blur-md">
                      {step.badge}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-blue-500/10 text-cyan-400 border border-blue-500/20">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-mono font-semibold text-slate-400">{step.id}</span>
                  </div>

                  <h3 className="text-lg font-bold text-white tracking-tight">{step.title}</h3>
                  <div className="text-[11px] font-medium text-cyan-400 mb-2">{step.location}</div>
                  <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                </div>

                {/* Bottom Connection Arrow Indicator for desktop */}
                {idx < steps.length - 1 && (
                  <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-[#050816] border border-blue-500/40 items-center justify-center text-cyan-400 shadow-md">
                    <ArrowRight className="w-3 h-3" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
