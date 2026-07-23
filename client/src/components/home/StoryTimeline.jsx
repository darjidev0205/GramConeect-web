import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Truck, Warehouse, UserCheck, Home } from 'lucide-react';

export const StoryTimeline = () => {
  const steps = [
    {
      id: '01',
      title: 'City Warehouse',
      location: 'Central Hub',
      desc: 'Sorting and barcode allocation for dispatches.',
      icon: Building2,
      badge: 'Step 1',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: '02',
      title: 'Regional Hub',
      location: 'District Point',
      desc: 'Automated sorting into sub-district cluster routes.',
      icon: Warehouse,
      badge: 'Step 2',
      image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: '03',
      title: 'Village Hub',
      location: 'Panchayat Micro',
      desc: 'Consolidated drop-off point with offline sync.',
      icon: Truck,
      badge: 'Step 3',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: '04',
      title: 'Local Agent',
      location: 'Village Partner',
      desc: 'Local village partner assigned for doorstep delivery.',
      icon: UserCheck,
      badge: 'Step 4',
      image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: '05',
      title: 'Farmer & Resident',
      location: 'Doorstep',
      desc: 'OTP & voice verification upon successful handover.',
      icon: Home,
      badge: 'Final',
      image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
    },
  ];

  return (
    <section id="network" className="py-12 md:py-28 bg-[#050816] relative overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8 md:mb-20">
          <span className="text-[11px] sm:text-xs uppercase font-semibold tracking-widest text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full mb-3">
            Supply Chain Network
          </span>
          <h2 className="text-2xl sm:text-5xl font-extrabold text-white tracking-tight font-display max-w-3xl">
            From Warehouse to Rural Doorstep
          </h2>
        </div>

        {/* Horizontal Snap Slider on Mobile / Grid on Desktop */}
        <div className="flex md:grid md:grid-cols-5 gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4 px-1 -mx-4 sm:mx-0 px-4 sm:px-0">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="snap-center flex-shrink-0 w-[240px] md:w-auto glass-card rounded-2xl p-4 border border-white/10 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-24 w-full rounded-xl overflow-hidden mb-3 border border-white/10">
                    <img 
                      src={step.image} 
                      alt={step.title}
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-transparent to-transparent opacity-80" />
                    <span className="absolute top-2 left-2 text-[9px] font-bold text-white font-mono bg-blue-600/80 px-2 py-0.5 rounded">
                      {step.badge}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1 rounded bg-blue-500/10 text-cyan-400">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-mono font-semibold text-slate-400">{step.id}</span>
                  </div>

                  <h3 className="text-sm font-bold text-white tracking-tight">{step.title}</h3>
                  <div className="text-[10px] font-medium text-cyan-400 mb-1">{step.location}</div>
                  <p className="text-[11px] text-slate-400 leading-snug">{step.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
