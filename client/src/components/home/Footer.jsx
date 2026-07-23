import React from 'react';
import { MapPin, Globe, ArrowUpRight, Share2, MessageCircle, Send } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-[#03050e] text-slate-400 border-t border-white/10 pt-20 pb-12 relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-white/10">
          
          {/* Brand Column */}
          <div className="md:col-span-4 flex flex-col items-start">
            <a href="#" className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-[1px] shadow-lg shadow-blue-500/20">
                <div className="w-full h-full bg-[#050816] rounded-[11px] flex items-center justify-center">
                  <span className="font-bold text-lg bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">G</span>
                </div>
              </div>
              <span className="font-bold text-xl tracking-tight text-white font-display">GramConnect</span>
            </a>
            
            <p className="text-sm text-slate-400 leading-relaxed mb-6 max-w-sm">
              Digitizing last-mile delivery across rural India through localized technology, village micro-entrepreneurs, and intelligent supply routing.
            </p>

            <div className="flex items-center gap-3">
              <a href="#" className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-cyan-400/50 transition-colors">
                <Share2 className="w-4 h-4" />
              </a>
              <a href="#" className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-cyan-400/50 transition-colors">
                <MessageCircle className="w-4 h-4" />
              </a>
              <a href="#" className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-cyan-400/50 transition-colors">
                <Send className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links Column 1: Company */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-mono uppercase font-bold text-white tracking-wider mb-5">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#mission" className="hover:text-cyan-400 transition-colors">About Mission</a></li>
              <li><a href="#network" className="hover:text-cyan-400 transition-colors">Logistics Network</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Careers <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-mono">Hiring</span></a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Press & Series A</a></li>
            </ul>
          </div>

          {/* Links Column 2: Resources */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-mono uppercase font-bold text-white tracking-wider mb-5">Platform</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#app" className="hover:text-cyan-400 transition-colors">Agent Android App</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Enterprise API Integrations</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">E-commerce Plugins</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Developer Docs</a></li>
            </ul>
          </div>

          {/* Mini Interactive Map & Newsletter */}
          <div className="md:col-span-4 flex flex-col justify-between p-6 rounded-2xl glass-card border border-white/10">
            <div>
              <h4 className="text-xs font-mono uppercase font-bold text-white tracking-wider mb-2 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                Coverage Radar
              </h4>
              <p className="text-xs text-slate-400 mb-4">
                Operating active hubs in Maharashtra, Karnataka, Uttar Pradesh, West Bengal, and Rajasthan.
              </p>
            </div>

            <div className="relative h-20 w-full rounded-xl overflow-hidden bg-[#040612] border border-white/10 p-2 flex items-center justify-center">
              <div className="absolute inset-0 dot-pattern opacity-40" />
              <div className="relative z-10 text-center">
                <div className="text-xs font-bold text-white">500+ Active Hubs</div>
                <div className="text-[10px] text-cyan-400 font-mono">24/7 Live Parcel Dispatch</div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} GramConnect Logistics Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Security & Compliance</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
