import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { MapPin, Package, Truck, Moon, Sun } from 'lucide-react';

const LandingPage = () => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <nav className="border-b border-border/40 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex gap-2 items-center font-bold text-xl tracking-tight">
            <span className="text-primary"><Truck className="w-6 h-6" /></span>
            GramConnect.
          </div>
          <div className="flex gap-4 items-center">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-accent hover:text-accent-foreground transition">
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <Link to="/login"><Button variant="ghost">Sign In</Button></Link>
            <Link to="/register"><Button className="rounded-full rounded-2xl shadow-lg">Get Started</Button></Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 pt-20 pb-16 relative overflow-hidden">
        {/* Decorative Blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 mix-blend-multiply opacity-50 dark:opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -z-10 mix-blend-multiply opacity-50 dark:opacity-20 animate-blob animation-delay-2000"></div>

        <section className="text-center max-w-4xl mx-auto space-y-8 mt-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/70"
          >
            Delivering to the <br className="hidden md:block"/> Unreachable.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            GramConnect bridges the gap between major e-commerce platforms and rural India. Smart hubs, local agents, zero hassle.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-center gap-4 pt-4"
          >
            <Link to="/register">
              <Button size="lg" className="rounded-full shadow-lg hover:shadow-primary/25 h-12 px-8 text-base transition-all hover:scale-105">
                Start Ordering Now
              </Button>
            </Link>
          </motion.div>
        </section>

        <section className="mt-32 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: MapPin, title: "Smart Hubs", desc: "Select a pickup hub near your village instead of a complex address." },
              { icon: Truck, title: "Local Agents", desc: "Villagers themselves become delivery partners, earning while they deliver." },
              { icon: Package, title: "Seamless Tracking", desc: "Track your package in real-time until it reaches your hands securely via OTP." }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative rounded-3xl border border-border/50 bg-card p-8 shadow-sm hover:shadow-md transition-all dark:bg-card/40 backdrop-blur-sm"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border mt-20">
        <div className="container flex items-center justify-between py-6 text-sm text-muted-foreground">
          <p>© 2026 GramConnect. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="#" className="hover:text-foreground transition">Privacy</Link>
            <Link to="#" className="hover:text-foreground transition">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
