import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-brand-surface border-t border-brand-primary/10 text-brand-text py-16 px-6 relative z-10">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
        <div className="md:col-span-2">
          <Link to="/" className="flex items-center space-x-2 mb-6">
            <ShieldCheck className="w-8 h-8 text-brand-primary" />
            <span className="text-2xl font-bold font-heading text-brand-primary tracking-tight">MedClear</span>
          </Link>
          <p className="text-brand-text/80 leading-relaxed max-w-sm">
            Compassionate navigation for hospital financial assistance. 
            We connect directly to official datasets with absolute privacy.
          </p>
        </div>
        
        <div>
          <h4 className="font-bold text-brand-primary mb-6 uppercase tracking-widest text-xs">Legal</h4>
          <ul className="space-y-4 text-sm text-brand-text/80">
            <li><a href="#" className="hover:text-brand-primary transition">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-brand-primary transition">Terms of Service</a></li>
            <li><a href="#" className="hover:text-brand-primary transition">Security Framework</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-bold text-brand-primary mb-6 uppercase tracking-widest text-xs">Platform</h4>
          <ul className="space-y-4 text-sm text-brand-text/80">
            <li><Link to="/evaluate" className="hover:text-brand-primary transition">Start Evaluation</Link></li>
            <li><Link to="/data-sources" className="hover:text-brand-primary transition">Data Architecture</Link></li>
            <li><a href="#" className="hover:text-brand-primary transition">API Documentation</a></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-brand-primary/10 flex flex-col md:flex-row justify-between items-center text-xs text-brand-text/60">
        <p>&copy; {new Date().getFullYear()} MedClear. Not affiliated with any hospital.</p>
        <p className="mt-4 md:mt-0">System Status: <span className="text-brand-accent ml-1 font-bold">100% Operational</span></p>
      </div>
    </footer>
  );
};

export default Footer;
