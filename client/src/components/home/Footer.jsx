import { Package, Globe, Mail, Share2 } from 'lucide-react';

export function Footer() {
  return (
    <footer id="contact" className="bg-background pt-16 pb-8 md:pt-20 md:pb-10 border-t border-border/40 relative z-10">
      <div className="container px-5 mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12 md:mb-16">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4 md:mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-md shadow-primary/20">
                <Package size={18} />
              </div>
              <span className="text-lg md:text-xl font-bold tracking-tight text-foreground">
                GramConnect
              </span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-5 max-w-sm">
              Bridging the gap between the modern supply chain and the farthest village nodes.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-full glass flex items-center justify-center hover:text-primary hover:border-primary/50 transition-colors" aria-label="Website">
                <Globe size={16} />
              </a>
              <a href="#" className="w-9 h-9 rounded-full glass flex items-center justify-center hover:text-primary hover:border-primary/50 transition-colors" aria-label="Email">
                <Mail size={16} />
              </a>
              <a href="#" className="w-9 h-9 rounded-full glass flex items-center justify-center hover:text-primary hover:border-primary/50 transition-colors" aria-label="Share">
                <Share2 size={16} />
              </a>
            </div>
          </div>
          
          <div className="col-span-1 md:col-span-1">
            <h4 className="font-bold mb-4 md:mb-6 text-foreground text-sm md:text-base">Company</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-primary text-xs md:text-sm transition-colors">About Us</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary text-xs md:text-sm transition-colors">Careers</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary text-xs md:text-sm transition-colors">Press & Media</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary text-xs md:text-sm transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div className="col-span-1 md:col-span-1">
            <h4 className="font-bold mb-4 md:mb-6 text-foreground text-sm md:text-base">Solutions</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-primary text-xs md:text-sm transition-colors">For E-commerce</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary text-xs md:text-sm transition-colors">For Individuals</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary text-xs md:text-sm transition-colors">Local Agents</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary text-xs md:text-sm transition-colors">Hub Partners</a></li>
            </ul>
          </div>
          
          <div className="col-span-2 sm:col-span-1 md:col-span-1">
            <h4 className="font-bold mb-4 md:mb-6 text-foreground text-sm md:text-base">Legal</h4>
            <ul className="space-y-3 flex sm:block flex-wrap gap-x-4 gap-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-primary text-xs md:text-sm transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary text-xs md:text-sm transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary text-xs md:text-sm transition-colors">Security</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary text-xs md:text-sm transition-colors">Cookies</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-6 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <p className="text-xs md:text-sm text-muted-foreground">
            © {new Date().getFullYear()} GramConnect Logistics Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground">
            <span>Made with</span>
            <span className="text-red-500">♥</span>
            <span>in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
