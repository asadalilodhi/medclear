import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  return (
    <nav className="border-b border-brand-primary/10 py-5 px-6 sticky top-0 z-50 backdrop-blur-md bg-brand-offwhite/80">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <ShieldCheck className="w-8 h-8 text-brand-primary" />
          <span className="text-2xl font-bold font-heading text-brand-primary tracking-tight">MedClear</span>
        </Link>
        <div className="hidden md:flex items-center space-x-8 font-semibold text-[15px]">
          <Link to="/" className="text-brand-text hover:text-brand-primary transition">Home</Link>
          <Link to="/evaluate" className="text-brand-text hover:text-brand-primary transition">Evaluate</Link>
          <Link to="/data-sources" className="text-brand-text hover:text-brand-primary transition">Data Sources</Link>
          <Link to="/contact" className="text-brand-text hover:text-brand-primary transition">Contact</Link>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
