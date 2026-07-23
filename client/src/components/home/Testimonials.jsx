import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { GlassCard } from '../ui/glass-card';

const testimonials = [
  {
    name: "Sunita Devi",
    role: "Villager, Rajasthan",
    text: "Before GramConnect, I had to travel 15km to the nearest town to pick up my packages. Now, the local agent brings my seeds directly to my farm.",
    rating: 5
  },
  {
    name: "Rajesh Patil",
    role: "Delivery Partner, Maharashtra",
    text: "This app gave me a new source of income. I know everyone in my village, so finding homes without addresses is trivial for me, but impossible for Amazon.",
    rating: 5
  },
  {
    name: "Amit Sharma",
    role: "Hub Manager, UP",
    text: "The sorting logic is incredible. We receive bulk packages and the app splits them perfectly into village nodal routes.",
    rating: 4
  },
  {
    name: "Meena Kumari",
    role: "Villager, Bihar",
    text: "I finally ordered a smartphone online. The voice assistant features on the delivery app helped the agent coordinate the drop off perfectly.",
    rating: 5
  }
];

export function Testimonials() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <div className="container px-5 mx-auto relative z-10">
        
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-[28px] sm:text-4xl md:text-5xl font-bold mb-3 md:mb-6">Trusted by thousands</h2>
          <p className="text-muted-foreground text-[16px] md:text-lg leading-relaxed">Real stories from the frontlines of rural logistics.</p>
        </div>

        {/* CSS Carousel container hiding scrollbar */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:gap-6 pb-8 pt-2 px-5 -mx-5 hide-scrollbar cursor-grab active:cursor-grabbing">
          {testimonials.map((test, i) => (
             <div key={i} className="min-w-[270px] sm:min-w-[320px] md:min-w-[380px] snap-center shrink-0">
               <GlassCard className="h-full p-5 md:p-6 rounded-2xl">
                 <Quote className="w-8 h-8 text-primary/20 absolute top-4 right-4" />
                 <div className="flex gap-1 mb-3">
                   {[...Array(5)].map((_, idx) => (
                     <Star key={idx} className={`w-3.5 h-3.5 ${idx < test.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`} />
                   ))}
                 </div>
                 <p className="text-foreground/90 text-sm sm:text-base md:text-lg mb-4 leading-relaxed relative z-10">"{test.text}"</p>
                 <div className="mt-auto">
                   <h4 className="font-bold text-[16px] md:text-lg text-foreground">{test.name}</h4>
                   <p className="text-xs md:text-sm text-primary font-medium">{test.role}</p>
                 </div>
               </GlassCard>
             </div>
          ))}
        </div>
      </div>
      
      {/* Scrollbar hide injected directly for convenience */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
