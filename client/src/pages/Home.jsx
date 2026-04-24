import React, { useState } from 'react';
import { Navbar } from '../components/home/Navbar';
import { Hero } from '../components/home/Hero';
import { Stats } from '../components/home/Stats';
import { Features } from '../components/home/Features';
import { HowItWorks } from '../components/home/HowItWorks';
import { VisualDemo } from '../components/home/VisualDemo';
import { Testimonials } from '../components/home/Testimonials';
import { CTA } from '../components/home/CTA';
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
    <div className="min-h-screen font-sans selection:bg-primary/30">
      <Navbar onOpenAuth={() => openAuth('user')} />
      <main>
        <Hero onOpenAuth={openAuth} />
        <Stats />
        <Features />
        <HowItWorks />
        <VisualDemo />
        <Testimonials />
        <CTA onOpenAuth={openAuth} />
      </main>
      <Footer />
      
      <AuthModal 
        show={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        defaultRole={authRole} 
      />
    </div>
  );
}
