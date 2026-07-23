import React, { useState } from 'react';
import { ChevronDown, MapPin, Share2, MessageCircle, Send } from 'lucide-react';

export const Footer = () => {
  const [companyOpen, setCompanyOpen] = useState(false);
  const [platformOpen, setPlatformOpen] = useState(false);

  return (
    <footer className="bg-[#03050e] text-slate-400 border-t border-white/10 pt-10 pb-8 relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Mobile Accordion / Desktop Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-white/10">
          
          {/* Brand Column */}
          <div className="md:col-span-4 flex flex-col items-start">
            <a href="#" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-[1px]">
                <div className="w-full h-full bg-[#050816] rounded-[11px] flex items-center justify-center font-bold text-xs text-cyan-400">
                  G
                </div>
              </div>
              <span className="font-bold text-lg tracking-tight text-white font-display">GramConnect</span>
            </a>
            
            <p className="text-xs text-slate-400 leading-relaxed mb-4 max-w-sm">
              Digitizing last-mile delivery across rural India through localized technology and village micro-entrepreneurs.
            </p>
          </div>

          {/* Collapsible Accordion 1: Company */}
          <div className="md:col-span-2 border-b border-white/10 md:border-b-0 pb-4 md:pb-0">
            <button 
              onClick={() => setCompanyOpen(!companyOpen)}
              className="w-full flex items-center justify-between md:cursor-default text-xs font-mono uppercase font-bold text-white tracking-wider mb-2 md:mb-5"
            >
              Company
              <ChevronDown className={`w-4 h-4 text-slate-400 md:hidden transition-transform ${companyOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <ul className={`space-y-2.5 text-xs transition-all ${companyOpen ? 'block' : 'hidden md:block'}`}>
              <li><a href="#mission" className="hover:text-cyan-400 transition-colors">About Mission</a></li>
              <li><a href="#network" className="hover:text-cyan-400 transition-colors">Logistics Network</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Series A</a></li>
            </ul>
          </div>

          {/* Collapsible Accordion 2: Platform */}
          <div className="md:col-span-2 border-b border-white/10 md:border-b-0 pb-4 md:pb-0">
            <button 
              onClick={() => setPlatformOpen(!platformOpen)}
              className="w-full flex items-center justify-between md:cursor-default text-xs font-mono uppercase font-bold text-white tracking-wider mb-2 md:mb-5"
            >
              Platform
              <ChevronDown className={`w-4 h-4 text-slate-400 md:hidden transition-transform ${platformOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <ul className={`space-y-2.5 text-xs transition-all ${platformOpen ? 'block' : 'hidden md:block'}`}>
              <li><a href="#app" className="hover:text-cyan-400 transition-colors">Android Partner App</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Enterprise API</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">E-commerce Plugins</a></li>
            </ul>
          </div>

          {/* Mini Coverage Radar */}
          <div className="md:col-span-4 p-4 rounded-xl glass-card border border-white/10">
            <div className="text-xs font-mono uppercase font-bold text-white mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Coverage Radar
            </div>
            <p className="text-[11px] text-slate-400 mb-2">500+ Active Panchayat Hubs in Real-Time</p>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>© {new Date().getFullYear()} GramConnect Inc. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-slate-300">Privacy</a>
            <a href="#" className="hover:text-slate-300">Terms</a>
            <a href="#" className="hover:text-slate-300">Security</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
