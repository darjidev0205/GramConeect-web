import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote, Star, MapPin } from 'lucide-react';

export const Testimonials = () => {
  const stories = [
    {
      id: 1,
      name: 'Sunita Devi',
      role: 'GramConnect Delivery Partner',
      village: 'Rampur, Uttar Pradesh',
      quote: 'Becoming a GramConnect agent tripled my monthly family income. Now I deliver essentials to over 40 families in my village every day with full confidence.',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      rating: 5,
    },
    {
      id: 2,
      name: 'Ramesh Patel',
      role: 'Organic Farmer & Resident',
      village: 'Koppal, Karnataka',
      quote: 'Before GramConnect, getting specialized seeds or electronics took a full day trip to the city. Today, parcels reach my farm doorstep in under 24 hours.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      rating: 5,
    },
    {
      id: 3,
      name: 'Priya Sharma',
      role: 'Local Pharmacy Owner',
      village: 'Burdwan, West Bengal',
      quote: 'Temperature-sensitive medicines reach our village health hub without any breakdown in cold storage. GramConnect is literally saving lives here.',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
      rating: 5,
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextStory = () => {
    setCurrentIndex((prev) => (prev + 1) % stories.length);
  };

  const prevStory = () => {
    setCurrentIndex((prev) => (prev - 1 + stories.length) % stories.length);
  };

  const current = stories[currentIndex];

  return (
    <section id="impact" className="py-32 bg-[#050816] relative overflow-hidden border-t border-white/5">
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-purple-600/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <span className="text-xs uppercase font-semibold tracking-widest text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3.5 py-1 rounded-full mb-4">
            Voices of Rural India
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display max-w-3xl">
            Empowering Real People Across Every Pincode
          </h2>
        </div>

        {/* Testimonial Showcase Box */}
        <div className="max-w-4xl mx-auto relative">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="glass-card rounded-3xl p-8 sm:p-12 border border-white/10 relative overflow-hidden bg-[#090d24]/90 shadow-2xl flex flex-col md:flex-row items-center gap-8"
            >
              <Quote className="absolute top-6 right-8 w-16 h-16 text-white/5 pointer-events-none" />

              {/* Left Profile Avatar Image */}
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-2 border-cyan-400/50 p-1 flex-shrink-0 shadow-xl shadow-cyan-500/20">
                <img 
                  src={current.image} 
                  alt={current.name}
                  className="w-full h-full object-cover rounded-full" 
                />
              </div>

              {/* Right Content */}
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                
                {/* Rating Stars */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(current.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Quote Text */}
                <p className="text-lg sm:text-xl text-slate-200 font-medium leading-relaxed mb-6 font-display">
                  "{current.quote}"
                </p>

                {/* Author Info */}
                <div>
                  <h4 className="text-base font-bold text-white tracking-tight">{current.name}</h4>
                  <div className="text-xs text-cyan-400 font-semibold mt-0.5">{current.role}</div>
                  <div className="text-xs text-slate-400 flex items-center gap-1 mt-1 justify-center md:justify-start">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {current.village}
                  </div>
                </div>

              </div>

            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prevStory}
              className="p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors"
              aria-label="Previous Testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              {stories.map((s, idx) => (
                <div
                  key={s.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full cursor-pointer transition-all ${
                    currentIndex === idx ? 'w-8 bg-cyan-400' : 'w-2 bg-white/20'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={nextStory}
              className="p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors"
              aria-label="Next Testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
