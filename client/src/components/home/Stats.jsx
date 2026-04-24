import React from 'react';
import { motion } from 'framer-motion';

const stats = [
  { label: "Villages Covered", value: "500+" },
  { label: "Active Agents", value: "2,500+" },
  { label: "Deliveries Completed", value: "1M+" }
];

export function Stats() {
  return (
    <section className="py-16 relative z-20 -mt-10">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 0.6 }}
              className="glass dark:glass-dark rounded-2xl p-8 text-center"
            >
              <div className="text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-2">
                {stat.value}
              </div>
              <div className="text-muted-foreground font-medium uppercase tracking-wider text-sm">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
