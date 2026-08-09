import React, { useState, useEffect } from 'react';
import { GramConnectLogo } from './GramConnectLogo';

export const GramConnectSplash = ({ onComplete }) => {
  const [stage, setStage] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // 1. Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsVisible(false);
      if (onComplete) onComplete();
      return;
    }

    // 2. Check if splash was already shown in this session
    const hasShown = sessionStorage.getItem('gramconnect_splash_shown');
    if (hasShown) {
      setIsVisible(false);
      if (onComplete) onComplete();
      return;
    }

    // Mark splash as shown for this session
    sessionStorage.setItem('gramconnect_splash_shown', 'true');

    // 3. Timed animation sequence (~1.8s total)
    const timer1 = setTimeout(() => setStage(1), 150);  // Logo Mark Reveal & Node Illumination
    const timer2 = setTimeout(() => setStage(2), 350);  // Network Node Sequential Illumination
    const timer3 = setTimeout(() => setStage(3), 650);  // Full Wordmark Reveal as ONE Complete Word
    const timer4 = setTimeout(() => setStage(4), 900);  // Tagline "Connecting Every Village"
    const timer5 = setTimeout(() => setStage(5), 1500); // Begin Smooth App Transition
    const timer6 = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 1850); // Unmount Splash

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      clearTimeout(timer6);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[999999] bg-[#050811] flex flex-col items-center justify-center select-none transition-opacity duration-400 ease-out ${
        stage === 5 ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background subtle radial glow */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-cyan-500/10 via-blue-600/10 to-transparent blur-3xl pointer-events-none" />

      {/* Main Logo & Motion Sequence Container */}
      <div className="relative flex flex-col items-center gap-5 z-10">
        {/* Logo Mark Reveal */}
        <div
          className={`transform transition-all duration-500 ease-out ${
            stage >= 1
              ? 'scale-100 opacity-100 blur-0'
              : 'scale-90 opacity-0 blur-md'
          }`}
        >
          <div className="relative p-2">
            <GramConnectLogo variant="mark" size="xl" />
          </div>
        </div>

        {/* Sequential Network Node Illumination (Village -> Hub -> City) */}
        <div 
          className={`flex items-center gap-3 transition-opacity duration-300 ${
            stage >= 2 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${stage >= 2 ? 'bg-cyan-400 shadow-[0_0_8px_#22d1ee]' : 'bg-slate-700'}`} />
          <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${stage >= 2 ? 'bg-blue-500 shadow-[0_0_8px_#3b82f6]' : 'bg-slate-700'}`} />
          <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${stage >= 2 ? 'bg-indigo-400 shadow-[0_0_8px_#6366f1]' : 'bg-slate-700'}`} />
        </div>

        {/* GRAMCONNECT Wordmark (Appears as ONE COMPLETE WORD) */}
        <div className="flex flex-col items-center gap-2">
          <h1
            className={`text-2xl sm:text-4xl font-black tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-400 font-display transform transition-all duration-500 ease-out ${
              stage >= 3
                ? 'translate-y-0 opacity-100'
                : 'translate-y-2 opacity-0'
            }`}
          >
            GRAMCONNECT
          </h1>

          {/* Subtitle Tagline with Pulsing Cyan Indicator */}
          <div
            className={`flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-slate-400 uppercase transform transition-all duration-400 ease-out ${
              stage >= 4
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-2'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,209,238,0.8)]" />
            <span>Connecting Every Village</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GramConnectSplash;
