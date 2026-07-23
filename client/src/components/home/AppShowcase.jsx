import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Navigation, QrCode, WifiOff, ShieldCheck, Bell, ChevronRight, CheckCircle2 } from 'lucide-react';

export const AppShowcase = () => {
  const [activeTab, setActiveTab] = useState('tracking');

  const tabs = [
    { id: 'tracking', label: 'Live Tracking', icon: Navigation },
    { id: 'qr', label: 'OTP & QR Handover', icon: QrCode },
    { id: 'offline', label: 'Offline Sync', icon: WifiOff },
    { id: 'earnings', label: 'Agent Earnings', icon: ShieldCheck },
  ];

  return (
    <section id="app" className="py-32 bg-[#050816] relative overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-20">
          <span className="text-xs uppercase font-semibold tracking-widest text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3.5 py-1 rounded-full mb-4">
            Agent & Resident App
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display max-w-3xl">
            Designed for Simplicity in Regional Languages
          </h2>
          <p className="text-slate-400 text-base sm:text-lg mt-4 max-w-2xl">
            A high-performance mobile application engineered to operate effortlessly under low RAM, high latency, and zero cellular signal.
          </p>

          {/* Tab Selector Buttons */}
          <div className="mt-10 flex flex-wrap justify-center gap-2 p-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold transition-all ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 scale-105' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Floating Realistic Mobile Phone Showcase */}
        <div className="flex justify-center items-center relative">
          
          {/* Subtle Ambient Glow Behind Phone */}
          <div className="absolute w-[340px] h-[600px] bg-gradient-to-tr from-blue-600/20 to-cyan-400/20 rounded-full blur-[100px] pointer-events-none" />

          {/* Smartphone Hardware Frame */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-[320px] sm:w-[360px] h-[680px] rounded-[48px] p-3 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 border-4 border-slate-700 shadow-2xl shadow-blue-950/80"
          >
            {/* Camera Dynamic Island Notch */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-4 rounded-full bg-black z-30 flex items-center justify-end px-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#0a0f29]" />
            </div>

            {/* Phone Screen Display Container */}
            <div className="w-full h-full rounded-[40px] bg-[#050816] overflow-hidden relative flex flex-col justify-between pt-10 pb-6 px-4 border border-white/10">
              
              {/* Top Mobile Status Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  GramConnect Partner
                </div>
                <div className="text-[10px] text-slate-400 font-mono">10:42 AM</div>
              </div>

              {/* Screen Tab Contents */}
              <div className="my-auto">
                <AnimatePresence mode="wait">
                  {activeTab === 'tracking' && (
                    <motion.div
                      key="tracking"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="space-y-4"
                    >
                      <div className="p-4 rounded-2xl bg-white/[0.05] border border-white/10">
                        <div className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider">Active Route • Task #4</div>
                        <div className="text-base font-bold text-white mt-1">Village Rampur Sector B</div>
                        <p className="text-xs text-slate-400 mt-1">Delivery to Farmer Suresh Kumar</p>
                        
                        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                          <span className="text-xs text-slate-300 font-mono">Distance: 450m</span>
                          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">EV Route</span>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-white">Voice Nav Active</div>
                          <div className="text-[10px] text-blue-300 mt-0.5">"Turn right after the Panchayat Well"</div>
                        </div>
                        <Navigation className="w-5 h-5 text-cyan-400 animate-pulse" />
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'qr' && (
                    <motion.div
                      key="qr"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="space-y-4 text-center"
                    >
                      <div className="p-5 rounded-2xl bg-white/[0.05] border border-white/10 flex flex-col items-center">
                        <div className="w-32 h-32 rounded-xl bg-white p-2 flex items-center justify-center shadow-lg">
                          <QrCode className="w-28 h-28 text-[#050816]" />
                        </div>
                        <div className="text-xs font-bold text-white mt-3">Scan Customer QR Code</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Or enter 4-digit OTP fallback</div>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                        OTP Code: 8 8 2 1
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'offline' && (
                    <motion.div
                      key="offline"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="space-y-3"
                    >
                      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                          <WifiOff className="w-4 h-4" />
                          Offline Queue Active
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1">12 Deliveries saved in secure encrypted vault.</p>
                      </div>

                      <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-300 flex items-center justify-between">
                        <span>Auto-Sync on Hub Connect</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'earnings' && (
                    <motion.div
                      key="earnings"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="space-y-4"
                    >
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-600/30 to-purple-600/30 border border-white/15">
                        <div className="text-[10px] text-slate-300 uppercase tracking-widest font-mono">Today's Payout</div>
                        <div className="text-3xl font-extrabold text-white font-display mt-1">₹1,450</div>
                        <div className="text-[10px] text-emerald-400 mt-1">32 Deliveries Completed</div>
                      </div>

                      <div className="p-3 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-between text-xs">
                        <span className="text-slate-300">Instant UPI Transfer</span>
                        <span className="text-cyan-400 font-mono font-bold">Paid Daily</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom Phone Bar */}
              <div className="pt-3 border-t border-white/10 text-center">
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">GramConnect OS v3.2</span>
              </div>

            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
};
