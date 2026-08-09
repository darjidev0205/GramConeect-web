import React from 'react';

export const GramConnectLogo = ({
  variant = 'full',
  size = 'md',
  showSubtitle = false,
  className = '',
  onClick,
}) => {
  // Height map for predefined sizes (optimized for mobile & desktop)
  const sizeMap = {
    sm: { mark: 'w-[24px] h-[24px]', full: 'h-6', text: 'text-sm sm:text-base', sub: 'text-[8px]' },
    md: { mark: 'w-[26px] h-[26px] sm:w-8 sm:h-8', full: 'h-8', text: 'text-base sm:text-xl', sub: 'text-[9px]' },
    lg: { mark: 'w-[32px] h-[32px] sm:w-10 sm:h-10', full: 'h-10', text: 'text-xl sm:text-2xl', sub: 'text-[10px]' },
    xl: { mark: 'w-12 h-12 sm:w-16 sm:h-16', full: 'h-14', text: 'text-2xl sm:text-4xl', sub: 'text-xs' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  // Mark-only variant
  if (variant === 'mark') {
    return (
      <div 
        onClick={onClick}
        className={`relative inline-flex items-center justify-center ${currentSize.mark} shrink-0 select-none ${className} ${onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
      >
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
          <defs>
            <linearGradient id="gcMarkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d1ee" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            <filter id="markGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* G Network Path */}
          <path 
            d="M 68 24 A 32 32 0 1 0 74 68 L 52 68 L 52 50 L 78 50" 
            stroke="url(#gcMarkGrad)" 
            strokeWidth="9" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />

          {/* Inner Connectivity Arc */}
          <path 
            d="M 32 38 A 20 20 0 0 1 68 38" 
            stroke="#38bdf8" 
            strokeWidth="5" 
            strokeLinecap="round" 
            strokeDasharray="4 3" 
            opacity="0.85" 
          />

          {/* Village, Hub, Destination Nodes */}
          <circle cx="32" cy="38" r="5" fill="#22d1ee" filter="url(#markGlow)" />
          <circle cx="68" cy="38" r="5" fill="#3b82f6" filter="url(#markGlow)" />
          <circle cx="78" cy="50" r="5.5" fill="#38bdf8" filter="url(#markGlow)" />
        </svg>
      </div>
    );
  }

  // Full Wordmark variant (Color or White)
  const isWhite = variant === 'white';

  return (
    <div 
      onClick={onClick}
      className={`inline-flex items-center gap-2 sm:gap-3 select-none ${className} ${onClick ? 'cursor-pointer group' : ''}`}
    >
      {/* Icon Symbol */}
      <div className={`relative ${currentSize.mark} shrink-0`}>
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
          <defs>
            <linearGradient id="gcFullMarkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d1ee" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            <filter id="fullGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <path 
            d="M 68 24 A 32 32 0 1 0 74 68 L 52 68 L 52 50 L 78 50" 
            stroke={isWhite ? "#ffffff" : "url(#gcFullMarkGrad)"} 
            strokeWidth="9" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          <path 
            d="M 32 38 A 20 20 0 0 1 68 38" 
            stroke={isWhite ? "#ffffff" : "#38bdf8"} 
            strokeWidth="5" 
            strokeLinecap="round" 
            strokeDasharray="4 3" 
            opacity="0.85" 
          />
          <circle cx="32" cy="38" r="5" fill={isWhite ? "#ffffff" : "#22d1ee"} filter={isWhite ? "" : "url(#fullGlow)"} />
          <circle cx="68" cy="38" r="5" fill={isWhite ? "#ffffff" : "#3b82f6"} filter={isWhite ? "" : "url(#fullGlow)"} />
          <circle cx="78" cy="50" r="5.5" fill={isWhite ? "#ffffff" : "#38bdf8"} filter={isWhite ? "" : "url(#fullGlow)"} />
        </svg>
      </div>

      {/* Typography */}
      <div className="flex flex-col text-left">
        <span 
          className={`font-black tracking-widest leading-none font-display ${currentSize.text} ${
            isWhite 
              ? 'text-white' 
              : 'bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-cyan-400 group-hover:to-cyan-300 transition-colors'
          }`}
        >
          GRAMCONNECT
        </span>
        {showSubtitle && (
          <span className={`font-mono font-bold tracking-widest text-slate-400 uppercase leading-none mt-1 ${currentSize.sub}`}>
            Rural Logistics Engine
          </span>
        )}
      </div>
    </div>
  );
};

export default GramConnectLogo;
