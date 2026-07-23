import React, { useState } from 'react';
import { Navbar } from '../components/home/Navbar';
import { Hero } from '../components/home/Hero';
import { StoryTimeline } from '../components/home/StoryTimeline';
import { AlternatingFeatures } from '../components/home/AlternatingFeatures';
import { InteractiveMap } from '../components/home/InteractiveMap';
import { AppShowcase } from '../components/home/AppShowcase';
import { WhyGramConnect } from '../components/home/WhyGramConnect';
import { Testimonials } from '../components/home/Testimonials';
import { PartnersLogoCloud } from '../components/home/PartnersLogoCloud';
import { BigNumbers } from '../components/home/BigNumbers';
import { MissionSection } from '../components/home/MissionSection';
import { CTASection } from '../components/home/CTASection';
import { Footer } from '../components/home/Footer';
import { AuthModal } from '../components/auth/AuthModal';

export default function Home() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authRole, setAuthRole] = useState('user');

  const openAuth = (role = 'user') => {
    setAuthRole(role);
    setIsAuthOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#050816] text-slate-100 font-sans selection:bg-blue-500/30 selection:text-blue-200 overflow-x-hidden">
      
      {/* Sleek Floating Glass Navbar */}
      <Navbar onOpenAuth={openAuth} />

      <main className="relative z-10">
        {/* Section 1: Hero */}
        <Hero onOpenAuth={openAuth} />

        {/* Section 2: Storytelling Pipeline */}
        <StoryTimeline />

        {/* Section 3: Alternating Editorial Features */}
        <AlternatingFeatures />

        {/* Section 4: Interactive India Map */}
        <InteractiveMap />

        {/* Section 5: App Showcase */}
        <AppShowcase />

        {/* Section 6: Why GramConnect */}
        <WhyGramConnect />

        {/* Section 7: Success Stories */}
        <Testimonials />

        {/* Section 8: Partners Cloud */}
        <PartnersLogoCloud />

        {/* Section 9: Monumental Big Numbers */}
        <BigNumbers />

        {/* Section 10: Mission */}
        <MissionSection />

        {/* Section 11: CTA */}
        <CTASection onOpenAuth={openAuth} />
      </main>

      {/* Multi-column Footer */}
      <Footer />

      {/* Auth Modal */}
      <AuthModal 
        show={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        defaultRole={authRole} 
      />
    </div>
  );
}
