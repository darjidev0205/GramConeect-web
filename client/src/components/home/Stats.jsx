import React from 'react';
import { motion } from 'framer-motion';

const stats = [
  { label: "Villages Covered", value: "500+" },
  { label: "Active Agents", value: "2,500+" },
  { label: "Deliveries Completed", value: "1M+" }
];

export function Stats() {
  return (
    <section className="py-10 md:py-16 relative z-20 -mt-6 md:-mt-10">
      <div className="container px-5 mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
              className="glass dark:glass-dark rounded-2xl p-5 md:p-8 text-center"
            >
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-1 md:mb-2">
                {stat.value}
              </div>
              <div className="text-muted-foreground font-medium uppercase tracking-wider text-[12px] sm:text-sm">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
