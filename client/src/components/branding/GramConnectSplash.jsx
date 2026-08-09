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

    // 3. Timed animation sequence
    const timer1 = setTimeout(() => setStage(1), 180);  // Logo Mark Reveal & Node Illumination
    const timer2 = setTimeout(() => setStage(2), 600);  // Wordmark Fade/Slide
    const timer3 = setTimeout(() => setStage(3), 900);  // Tagline "Connecting Every Village"
    const timer4 = setTimeout(() => setStage(4), 1400); // Begin Smooth App Transition
    const timer5 = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 1850); // Unmount Splash

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[999999] bg-[#050811] flex flex-col items-center justify-center select-none transition-opacity duration-500 ease-out ${
        stage === 4 ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background subtle radial glow */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-cyan-500/10 via-blue-600/10 to-transparent blur-3xl pointer-events-none" />

      {/* Main Logo & Motion Sequence Container */}
      <div className="relative flex flex-col items-center gap-6 z-10">
        {/* Logo Mark & Animated Node Ring */}
        <div
          className={`transform transition-all duration-700 ease-out ${
            stage >= 1
              ? 'scale-100 opacity-100 blur-0'
              : 'scale-90 opacity-0 blur-md'
          }`}
        >
          <div className="relative p-4">
            <GramConnectLogo variant="mark" size="xl" />
            
            {/* Animated Connection Pulse Beam */}
            <div className="absolute inset-0 rounded-full border border-cyan-400/20 animate-ping opacity-40" />
          </div>
        </div>

        {/* GRAMCONNECT Wordmark */}
        <div
          className={`flex flex-col items-center gap-2 transform transition-all duration-600 ease-out ${
            stage >= 2
              ? 'translate-y-0 opacity-100'
              : 'translate-y-3 opacity-0'
          }`}
        >
          <h1 className="text-3xl sm:text-4xl font-black tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-400 font-display">
            GRAMCONNECT
          </h1>

          {/* Subtitle Tagline with Pulsing Cyan Dot */}
          <div
            className={`flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-slate-400 uppercase transform transition-all duration-500 ease-out ${
              stage >= 3
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-2'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,209,238,0.8)]" />
            <span>Connecting Every Village</span>
          </div>
        </div>
      </div>

      {/* Subtle Launch Progress Bar at bottom */}
      <div className="absolute bottom-12 w-32 h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 transition-all duration-1000 ease-out rounded-full"
          style={{
            width: stage === 0 ? '0%' : stage === 1 ? '35%' : stage === 2 ? '70%' : '100%',
          }}
        />
      </div>
    </div>
  );
};

export default GramConnectSplash;
