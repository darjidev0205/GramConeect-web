import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote, Star, MapPin } from 'lucide-react';

export const Testimonials = () => {
  const stories = [
    {
      id: 1,
      name: 'Sunita Devi',
      role: 'Delivery Partner',
      village: 'Rampur, UP',
      quote: 'Tripled my family income. I deliver to 40 families daily with full confidence.',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      rating: 5,
    },
    {
      id: 2,
      name: 'Ramesh Patel',
      role: 'Organic Farmer',
      village: 'Koppal, KA',
      quote: 'Seeds and electronics reach my farm doorstep in under 24 hours.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      rating: 5,
    },
    {
      id: 3,
      name: 'Priya Sharma',
      role: 'Pharmacy Owner',
      village: 'Burdwan, WB',
      quote: 'Temperature-sensitive medicines reach our village without cold chain breakdown.',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
      rating: 5,
    },
  ];

  return (
    <section id="impact" className="py-12 md:py-32 bg-[#050816] relative overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="flex flex-col items-center text-center mb-8 md:mb-16">
          <span className="text-[11px] sm:text-xs uppercase font-semibold tracking-widest text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full mb-3">
            Voices of Rural India
          </span>
          <h2 className="text-2xl sm:text-5xl font-extrabold text-white tracking-tight font-display max-w-3xl">
            Empowering Real People Across Every Pincode
          </h2>
        </div>

        {/* Swipeable Horizontal Mini Cards (1.3 Card Preview on Mobile) */}
        <div className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4 -mx-4 sm:mx-0 px-4 sm:px-0">
          {stories.map((story) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="snap-center flex-shrink-0 w-[270px] md:w-auto glass-card rounded-2xl p-4 border border-white/10 flex flex-col justify-between h-[180px] sm:h-auto"
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <img 
                    src={story.image} 
                    alt={story.name} 
                    className="w-10 h-10 rounded-full object-cover border border-cyan-400/50"
                  />
                  <div>
                    <div className="text-xs font-bold text-white">{story.name}</div>
                    <div className="text-[10px] text-cyan-400 font-semibold">{story.role}</div>
                  </div>
                </div>

                <p className="text-[11px] sm:text-sm text-slate-300 font-medium leading-snug line-clamp-3">
                  "{story.quote}"
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-white/10">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-500" /> {story.village}</span>
                <div className="flex text-amber-400">★★★★★</div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
