import React from 'react';

export const PartnersLogoCloud = () => {
  // Existing partner data preserved & structured into 2 independent vertical streams with varied card sizes & offsets
  const colA = [
    { 
      name: 'India Post', 
      category: 'Public Infrastructure', 
      shortLogo: 'IP', 
      tag: 'NET / 01', 
      coords: '28.6139° N • 77.2090° E',
      size: 'large', // 260x110
      offset: 'ml-0'
    },
    { 
      name: 'Meesho', 
      category: 'Enterprise Commerce', 
      shortLogo: 'MS', 
      tag: 'NET / 02', 
      coords: '12.9716° N • 77.5946° E',
      size: 'small', // 210x78
      offset: 'ml-4'
    },
    { 
      name: 'Amazon Logistics', 
      category: 'Enterprise Network', 
      shortLogo: 'AZ', 
      tag: 'NET / 03', 
      coords: '19.0760° N • 72.8777° E',
      size: 'medium', // 230x90
      offset: 'ml-2'
    },
    { 
      name: 'Govt of India', 
      category: 'Public Infrastructure', 
      shortLogo: 'GOI', 
      tag: 'NET / 04', 
      coords: '28.6145° N • 77.2100° E',
      size: 'large', // 260x110
      offset: 'ml-6'
    },
  ];

  const colB = [
    { 
      name: 'Delhivery', 
      category: 'National Logistics', 
      shortLogo: 'DL', 
      tag: 'NET / 05', 
      coords: '28.4595° N • 77.0266° E',
      size: 'medium', // 230x90
      offset: 'mr-2'
    },
    { 
      name: 'Flipkart Rural', 
      category: 'E-Commerce Network', 
      shortLogo: 'FK', 
      tag: 'NET / 06', 
      coords: '12.9352° N • 77.6245° E',
      size: 'large', // 260x110
      offset: 'mr-0'
    },
    { 
      name: 'JioMart', 
      category: 'National Commerce', 
      shortLogo: 'JM', 
      tag: 'NET / 07', 
      coords: '19.0176° N • 72.8561° E',
      size: 'small', // 210x78
      offset: 'mr-4'
    },
    { 
      name: 'Amazon Logistics', 
      category: 'Enterprise Network', 
      shortLogo: 'AZ', 
      tag: 'NET / 08', 
      coords: '19.0760° N • 72.8777° E',
      size: 'medium', // 230x90
      offset: 'mr-1'
    },
  ];

  // Quadruple arrays for smooth, seamless infinite loop
  const infiniteColA = [...colA, ...colA, ...colA, ...colA];
  const infiniteColB = [...colB, ...colB, ...colB, ...colB];

  return (
    <section id="partners" className="py-24 sm:py-32 lg:py-36 bg-[#05070D] relative overflow-hidden border-t border-b border-white/[0.08]">
      
      {/* Very Subtle Background Faint Atmospheric Lighting (No Heavy Purple Blobs!) */}
      <div className="absolute top-1/3 left-1/3 w-[600px] h-[600px] bg-[#16C7E8]/[0.03] rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-[#3977FF]/[0.03] rounded-full blur-[140px] pointer-events-none" />

      {/* Faint Abstract Grid Line Overlay (5% Opacity) */}
      <div className="absolute inset-0 grid-pattern opacity-[0.04] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-10 items-center">
          
          {/* LEFT EDITORIAL COLUMN (40% Width on Desktop) */}
          <div className="lg:col-span-5 flex flex-col items-start text-left">
            
            {/* Architectural Eyebrow */}
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16C7E8]" />
              <span className="text-xs uppercase font-mono font-semibold tracking-widest text-[#929AAA]">
                TRUSTED NETWORK
              </span>
              <span className="text-[10px] font-mono text-[#929AAA]/60 border-l border-white/10 pl-2">SYS/2026</span>
            </div>

            {/* Large Architectural Editorial Headline */}
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#F4F6FA] tracking-tight font-display leading-[1.1] mb-6">
              The infrastructure <br className="hidden sm:inline" />
              behind India's <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-[#F4F6FA] via-[#16C7E8] to-[#3977FF] bg-clip-text text-transparent">
                last mile.
              </span>
            </h2>

            {/* Editorial Subtitle */}
            <p className="text-[#9AA3B5] text-base sm:text-lg leading-relaxed mb-10 max-w-[560px] font-normal">
              GramConnect brings enterprise commerce, national logistics infrastructure and local village distribution together through one hyper-local delivery layer.
            </p>

            {/* Editorial Mini Index List (No Boxes, Clean Dividers) */}
            <div className="w-full space-y-5 pt-6 border-t border-white/[0.08] max-w-[560px]">
              <div className="flex items-start justify-between pb-4 border-b border-white/[0.06] group">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#16C7E8]">01</span>
                    <h4 className="text-xs font-bold text-[#F4F6FA] uppercase tracking-wider font-mono">ENTERPRISE COMMERCE</h4>
                  </div>
                  <p className="text-xs text-[#929AAA] mt-1 pl-6">Connecting large-scale sellers to rural consumers</p>
                </div>
                <span className="text-[10px] font-mono text-[#929AAA]/50 uppercase tracking-widest hidden sm:inline">LIVE</span>
              </div>

              <div className="flex items-start justify-between pb-4 border-b border-white/[0.06] group">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#16C7E8]">02</span>
                    <h4 className="text-xs font-bold text-[#F4F6FA] uppercase tracking-wider font-mono">NATIONAL LOGISTICS</h4>
                  </div>
                  <p className="text-xs text-[#929AAA] mt-1 pl-6">Extending last-mile reach for carrier networks</p>
                </div>
                <span className="text-[10px] font-mono text-[#929AAA]/50 uppercase tracking-widest hidden sm:inline">SYNCED</span>
              </div>

              <div className="flex items-start justify-between pb-2 group">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#16C7E8]">03</span>
                    <h4 className="text-xs font-bold text-[#F4F6FA] uppercase tracking-wider font-mono">VILLAGE DISTRIBUTION</h4>
                  </div>
                  <p className="text-xs text-[#929AAA] mt-1 pl-6">Reaching rural doorsteps via local village partners</p>
                </div>
                <span className="text-[10px] font-mono text-[#16C7E8] uppercase tracking-widest hidden sm:inline">ACTIVE</span>
              </div>
            </div>

            {/* Micro Infrastructure Network Status Badge */}
            <div className="mt-8 pt-4 border-t border-white/[0.08] flex items-center gap-2.5 text-xs text-[#929AAA] font-mono w-full">
              <span className="w-2 h-2 rounded-full bg-[#16C7E8] animate-pulse" />
              <span className="font-bold text-[#F4F6FA]">NETWORK ACTIVE</span>
              <span className="text-white/20">•</span>
              <span className="text-[11px] text-[#929AAA]/80">Connected across ENTERPRISE • LOGISTICS • VILLAGE</span>
            </div>

          </div>


          {/* RIGHT SIDE — ARCHITECTURAL NETWORK WALL (60% Width on Desktop) */}
          <div className="lg:col-span-7 relative h-[520px] sm:h-[580px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0A0E17]/60 p-4 sm:p-6 [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)] shadow-2xl">
            
            {/* Extremely Subtle Route Line with 2-3 Nodes in Center */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-gradient-to-b from-transparent via-[#16C7E8]/25 to-transparent z-20 pointer-events-none hidden sm:flex flex-col items-center justify-between py-20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16C7E8] animate-ping" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#3977FF]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#16C7E8]" />
            </div>

            <div className="grid grid-cols-2 gap-4 sm:gap-6 h-full items-center">
              
              {/* COLUMN A: Slowly moves DOWN (45s per loop) */}
              <div className="relative h-full overflow-hidden flex flex-col">
                <div className="flex flex-col gap-5 animate-marquee-vertical-down hover:[animation-play-state:paused] py-2">
                  {infiniteColA.map((partner, idx) => (
                    <div 
                      key={`colA-${idx}`}
                      className={`group flex flex-col justify-between p-4 sm:p-5 rounded-xl bg-[#10151E] border border-white/[0.08] hover:border-[#16C7E8]/40 hover:bg-[#151B25] transition-all duration-300 cursor-pointer shadow-lg hover:-translate-y-0.5 ${partner.offset}`}
                      style={{ 
                        minHeight: partner.size === 'large' ? '110px' : partner.size === 'medium' ? '92px' : '80px' 
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        {/* Neutral Brand Mark Zone */}
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center font-mono font-bold text-xs text-[#F4F6FA] group-hover:border-[#16C7E8]/50 group-hover:text-[#16C7E8] transition-all flex-shrink-0">
                            {partner.shortLogo}
                          </div>
                          <div className="flex flex-col text-left">
                            <span className="text-xs sm:text-sm font-bold text-[#F4F6FA] tracking-tight group-hover:text-white transition-colors">
                              {partner.name}
                            </span>
                            <span className="text-[10px] font-mono text-[#929AAA] uppercase tracking-wider">
                              {partner.category}
                            </span>
                          </div>
                        </div>

                        {/* Tag */}
                        <span className="text-[9px] font-mono font-semibold text-[#929AAA]/60 uppercase tracking-widest hidden sm:inline">
                          {partner.tag}
                        </span>
                      </div>

                      {/* Micro Coordinate Details */}
                      <div className="mt-3 pt-2 border-t border-white/[0.04] flex items-center justify-between text-[9px] font-mono text-[#929AAA]/70">
                        <span>{partner.coords}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#16C7E8]/40 group-hover:bg-[#16C7E8]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>


              {/* COLUMN B: Slowly moves UP (40s per loop) */}
              <div className="relative h-full overflow-hidden flex flex-col">
                <div className="flex flex-col gap-5 animate-marquee-vertical-up hover:[animation-play-state:paused] py-2">
                  {infiniteColB.map((partner, idx) => (
                    <div 
                      key={`colB-${idx}`}
                      className={`group flex flex-col justify-between p-4 sm:p-5 rounded-xl bg-[#10151E] border border-white/[0.08] hover:border-[#3977FF]/40 hover:bg-[#151B25] transition-all duration-300 cursor-pointer shadow-lg hover:-translate-y-0.5 ${partner.offset}`}
                      style={{ 
                        minHeight: partner.size === 'large' ? '110px' : partner.size === 'medium' ? '92px' : '80px' 
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        {/* Neutral Brand Mark Zone */}
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center font-mono font-bold text-xs text-[#F4F6FA] group-hover:border-[#3977FF]/50 group-hover:text-[#3977FF] transition-all flex-shrink-0">
                            {partner.shortLogo}
                          </div>
                          <div className="flex flex-col text-left">
                            <span className="text-xs sm:text-sm font-bold text-[#F4F6FA] tracking-tight group-hover:text-white transition-colors">
                              {partner.name}
                            </span>
                            <span className="text-[10px] font-mono text-[#929AAA] uppercase tracking-wider">
                              {partner.category}
                            </span>
                          </div>
                        </div>

                        {/* Tag */}
                        <span className="text-[9px] font-mono font-semibold text-[#929AAA]/60 uppercase tracking-widest hidden sm:inline">
                          {partner.tag}
                        </span>
                      </div>

                      {/* Micro Coordinate Details */}
                      <div className="mt-3 pt-2 border-t border-white/[0.04] flex items-center justify-between text-[9px] font-mono text-[#929AAA]/70">
                        <span>{partner.coords}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#3977FF]/40 group-hover:bg-[#3977FF]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
};


