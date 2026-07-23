import React from 'react';

export const PartnersLogoCloud = () => {
  const partners = [
    { name: 'Amazon Logistics', logo: 'AMAZON' },
    { name: 'Flipkart Rural', logo: 'FLIPKART' },
    { name: 'Meesho', logo: 'MEESHO' },
    { name: 'India Post', logo: 'INDIA POST' },
    { name: 'Jiomart', logo: 'JIOMART' },
    { name: 'Ministry of Rural Dev', logo: 'GOVT OF INDIA' },
    { name: 'Delhivery', logo: 'DELHIVERY' },
  ];

  return (
    <section id="partners" className="py-20 bg-[#050816] relative overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-10">
        <span className="text-xs uppercase font-mono font-bold tracking-widest text-slate-400">
          Trusted By Enterprise E-Commerce & National Networks
        </span>
      </div>

      {/* Infinite Scrolling Ticker */}
      <div className="relative w-full overflow-hidden flex [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]">
        <div className="flex items-center gap-16 py-4 animate-marquee whitespace-nowrap">
          {[...partners, ...partners, ...partners].map((p, idx) => (
            <div key={idx} className="flex items-center gap-3 group cursor-pointer opacity-60 hover:opacity-100 transition-opacity">
              <div className="text-lg sm:text-xl font-extrabold tracking-wider font-mono text-slate-300 group-hover:text-cyan-400 transition-colors">
                {p.logo}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
