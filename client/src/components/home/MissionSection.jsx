import React from 'react';
import { motion } from 'framer-motion';

export const MissionSection = () => {
  return (
    <section id="mission" className="py-32 bg-[#050816] relative overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: High Quality Authentic Rural Image */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6 relative rounded-3xl overflow-hidden border border-white/10 glass-card"
          >
            <img 
              src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1000&q=80" 
              alt="Rural India Sunset Fields"
              className="w-full h-[450px] object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-transparent to-transparent opacity-80" />
            
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-[#050816]/80 backdrop-blur-md border border-white/10">
              <div className="text-xs font-mono text-cyan-400">BHARAT FIRST VISION</div>
              <div className="text-sm font-bold text-white mt-0.5">Connecting 650,000+ Indian Villages</div>
            </div>
          </motion.div>

          {/* Right Statement */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6 flex flex-col justify-center"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1 rounded-full mb-6 w-fit">
              Our Core Purpose
            </span>

            <blockquote className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display leading-[1.15] mb-8">
              "Our mission is to ensure no village remains disconnected from modern commerce."
            </blockquote>

            <p className="text-slate-400 text-base leading-relaxed">
              We believe geographical remoteness should never dictate access to essential medicines, agricultural technology, or digital commerce. By building hyper-local supply chain technology, we empower rural citizens with the exact same speed and reliability as tier-1 metro hubs.
            </p>
          </motion.div>

        </div>

      </div>
    </section>
  );
};
