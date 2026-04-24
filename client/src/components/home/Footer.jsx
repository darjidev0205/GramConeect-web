import { Package, Globe, Mail, Share2 } from 'lucide-react';

export function Footer() {
  return (
    <footer id="contact" className="bg-background pt-20 pb-10 border-t border-white/10 relative z-10">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                <Package size={18} />
              </div>
              <span className="text-xl font-bold tracking-tight">
                GramConnect
              </span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Bridging the gap between the modern supply chain and the farthest village nodes.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center hover:text-primary hover:border-primary/50 transition-colors">
                <Globe size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center hover:text-primary hover:border-primary/50 transition-colors">
                <Mail size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center hover:text-primary hover:border-primary/50 transition-colors">
                <Share2 size={18} />
              </a>
            </div>
          </div>
          
          <div className="md:col-span-1">
            <h4 className="font-bold mb-6 text-foreground">Company</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">About Us</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">Careers</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">Press & Media</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div className="md:col-span-1">
            <h4 className="font-bold mb-6 text-foreground">Solutions</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">For E-commerce</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">For Individuals</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">Local Agents</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">Hub Partners</a></li>
            </ul>
          </div>
          
          <div className="md:col-span-1">
            <h4 className="font-bold mb-6 text-foreground">Legal</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">Security</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">Cookies</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} GramConnect Logistics Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Made with</span>
            <span className="text-red-500">♥</span>
            <span>in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
