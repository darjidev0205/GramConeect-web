import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Radio, ShieldCheck, Zap } from 'lucide-react';

export const InteractiveMap = () => {
  const [activeNode, setActiveNode] = useState(0);

  const nodes = [
    { id: 1, name: 'Rampur Cluster', x: '25%', y: '35%', count: '48 Villages', status: 'Active Dispatch' },
    { id: 2, name: 'Nashik Micro Hub', x: '38%', y: '55%', count: '120 Villages', status: 'High Volume' },
    { id: 3, name: 'Koppal Zone', x: '45%', y: '70%', count: '92 Villages', status: '99.9% SLA' },
    { id: 4, name: 'Burdwan East', x: '72%', y: '42%', count: '160 Villages', status: 'Expanding' },
    { id: 5, name: 'Jaipur Rural', x: '30%', y: '30%', count: '85 Villages', status: 'Optimal' },
  ];

  return (
    <section className="py-32 bg-[#050816] relative overflow-hidden border-t border-white/5">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <span className="text-xs uppercase font-semibold tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3.5 py-1 rounded-full mb-4">
            Live Network Topology
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display max-w-3xl">
            Connected Across 500+ Rural Hubs
          </h2>
          <p className="text-slate-400 text-base sm:text-lg mt-4 max-w-2xl">
            Explore live delivery routes, active regional hubs, and agent clusters operating in real-time.
          </p>
        </div>

        {/* Map Container Canvas Box */}
        <div className="relative w-full h-[520px] rounded-3xl glass-card border border-white/10 overflow-hidden bg-[#040718] p-6 flex flex-col justify-between">
          
          {/* Subtle Grid Map Canvas Background */}
          <div className="absolute inset-0 dot-pattern opacity-50 pointer-events-none" />

          {/* SVG Map Lines connecting nodes */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#6366f1" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.4" />
              </linearGradient>
            </defs>

            {/* Connecting lines between hubs */}
            <path d="M 25% 35% L 38% 55% L 45% 70%" fill="none" stroke="url(#mapGradient)" strokeWidth="2" strokeDasharray="5 5" className="animate-pulse" />
            <path d="M 30% 30% L 25% 35% L 72% 42%" fill="none" stroke="url(#mapGradient)" strokeWidth="2" strokeDasharray="4 4" />
          </svg>

          {/* Map Interactive Pins */}
          {nodes.map((node, index) => (
            <div
              key={node.id}
              style={{ left: node.x, top: node.y }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
              onMouseEnter={() => setActiveNode(index)}
            >
              {/* Outer Radar Ripple */}
              <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-400/50 flex items-center justify-center animate-ping absolute inset-0" />
              
              {/* Pin Center */}
              <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                activeNode === index ? 'bg-cyan-400 text-[#050816] scale-125 shadow-lg shadow-cyan-400/50' : 'bg-blue-600 text-white'
              }`}>
                <MapPin className="w-4 h-4" />
              </div>

              {/* Hover Tooltip Card */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-10 w-44 p-3 rounded-xl bg-[#090d24] border border-white/20 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
                <div className="text-xs font-bold text-white">{node.name}</div>
                <div className="text-[10px] text-cyan-400 font-mono mt-0.5">{node.count}</div>
                <div className="text-[9px] text-slate-400 mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {node.status}
                </div>
              </div>
            </div>
          ))}

          {/* Top Bar Overlay */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full backdrop-blur-md">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="text-xs font-mono text-slate-300">LIVE SATELLITE TELEMETRY</span>
            </div>
            <div className="text-xs font-mono text-slate-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              Coverage Rate: 99.4%
            </div>
          </div>

          {/* Bottom Live Metrics Bar */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10 bg-[#050816]/70 backdrop-blur-md rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/20">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold text-white font-display">500+</div>
                <div className="text-xs text-slate-400">Panchayat Hubs</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/20">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold text-white font-display">2,500+</div>
                <div className="text-xs text-slate-400 font-sans">Active Field Agents</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold text-white font-display">1,000,000+</div>
                <div className="text-xs text-slate-400">Successful Deliveries</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
