import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, FileText, Lock, ChevronRight, Database, HeartHandshake } from 'lucide-react';

const LandingPage = () => {
  const [stats, setStats] = useState({ hospitals: 0, loading: true });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || '';
        const res = await fetch(`${API_URL}/api/policies`);
        const data = await res.json();
        if (data.policies) setStats({ hospitals: data.policies.length, loading: false });
      } catch (e) {
        setStats(prev => ({ ...prev, loading: false }));
      }
    };
    fetchStats();
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return (
    <div className="min-h-screen bg-brand-offwhite text-brand-text relative overflow-hidden">
      {/* Soft Background Decor */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-primary/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-accent/5 rounded-full blur-[100px] pointer-events-none translate-y-1/3 -translate-x-1/3" />

      <div className="relative z-10 pt-24 pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Hero Section */}
          <div className="grid lg:grid-cols-2 gap-20 items-center mb-32">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <div className="inline-flex items-center space-x-2 bg-brand-accent/10 border border-brand-accent/20 rounded-full px-4 py-1.5 mb-8">
                <span className="flex h-2 w-2 rounded-full bg-brand-accent animate-pulse"></span>
                <span className="text-xs font-semibold tracking-widest uppercase text-brand-primary">Compassionate Care Navigation</span>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-extrabold text-brand-primary mb-8 leading-[1.15]">
                Navigate hospital <br className="hidden md:block"/> 
                <span className="text-brand-accent italic">financial policies.</span>
              </h1>
              <p className="text-xl text-brand-text/80 mb-10 max-w-xl font-medium leading-relaxed">
                Connect directly to official hospital financial assistance datasets. Discover your eligibility privately, securely, and easily.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link to="/evaluate" className="group bg-brand-primary text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-brand-primary/90 transition shadow-lg flex items-center justify-center w-full sm:w-auto">
                  Start Evaluation 
                  <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/data-sources" className="bg-brand-surface text-brand-primary border border-brand-primary/20 px-8 py-4 rounded-full font-bold text-lg hover:bg-brand-offwhite transition shadow-sm flex items-center justify-center w-full sm:w-auto">
                  View Data Sources
                </Link>
              </div>
            </motion.div>

            {/* Right Side Soft Graphic */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-brand-surface rounded-[2rem] p-10 shadow-xl border border-brand-primary/5 relative z-10">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-brand-primary/5">
                  <div className="flex items-center space-x-3">
                    <HeartHandshake className="w-6 h-6 text-brand-accent" />
                    <span className="font-heading font-bold text-lg text-brand-primary">Eligibility Check</span>
                  </div>
                  <span className="text-xs font-bold text-brand-accent bg-brand-accent/10 px-3 py-1.5 rounded-full">Secure</span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-5 bg-brand-offwhite rounded-2xl">
                    <span className="text-brand-text/70 font-medium">Hospital Protocol</span>
                    <span className="text-brand-primary font-bold">Mayo Clinic FAP</span>
                  </div>
                  <div className="flex justify-between items-center p-5 bg-brand-offwhite rounded-2xl">
                    <span className="text-brand-text/70 font-medium">Detected Bill</span>
                    <span className="text-brand-primary font-bold">$4,500.00</span>
                  </div>
                  <div className="flex justify-between items-center p-5 bg-brand-accent/10 rounded-2xl border border-brand-accent/20">
                    <span className="text-brand-primary font-bold">Potential Coverage</span>
                    <span className="text-brand-accent font-extrabold text-lg">100% Charity Care</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Trust Bar (Soft) */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }} className="py-12 mb-32 bg-brand-surface rounded-3xl shadow-sm border border-brand-primary/5">
            <div className="flex flex-col md:flex-row justify-around items-center gap-8 text-sm font-bold text-brand-primary uppercase tracking-widest">
              <div className="flex items-center flex-col gap-2">
                <div className="flex items-center"><Lock className="w-5 h-5 mr-3 text-brand-accent"/> Zero Data Retention</div>
                <span className="text-xs text-brand-text/50 font-medium normal-case">No accounts, no history tracking</span>
              </div>
              <div className="flex items-center flex-col gap-2">
                <div className="flex items-center"><Database className="w-5 h-5 mr-3 text-brand-accent"/> {stats.loading ? "Loading Index..." : `${stats.hospitals} Live Policies Indexed`}</div>
                <span className="text-xs text-brand-text/50 font-medium normal-case">Powered by autonomous Jina scraping</span>
              </div>
              <div className="flex items-center flex-col gap-2">
                <div className="flex items-center"><Shield className="w-5 h-5 mr-3 text-brand-accent"/> 2026 HHS Standards</div>
                <span className="text-xs text-brand-text/50 font-medium normal-case">Strict compliance with FPL thresholds</span>
              </div>
            </div>
          </motion.div>

          {/* Features Grid (Soft, Organic) */}
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="bg-brand-surface p-10 rounded-3xl shadow-sm border border-brand-primary/5 hover:shadow-md transition duration-300">
              <div className="bg-brand-primary/5 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-brand-primary">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-heading font-bold mb-5 text-brand-primary tracking-wide">Private Processing</h3>
              <p className="text-brand-text/80 leading-[1.8] font-normal tracking-wide text-[15px]">
                Your medical data never leaves the system. Files are destroyed immediately after evaluation. No databases. No accounts required.
              </p>
            </div>
            <div className="bg-brand-surface p-10 rounded-3xl shadow-sm border border-brand-primary/5 hover:shadow-md transition duration-300">
              <div className="bg-brand-accent/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-brand-accent">
                <Database className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-heading font-bold mb-5 text-brand-primary tracking-wide">True Accuracy</h3>
              <p className="text-brand-text/80 leading-[1.8] font-normal tracking-wide text-[15px]">
                We strictly cross-reference official hospital Financial Assistance Policies. If it's not in the official policy document, it's not in the result.
              </p>
            </div>
            <div className="bg-brand-surface p-10 rounded-3xl shadow-sm border border-brand-primary/5 hover:shadow-md transition duration-300">
              <div className="bg-brand-primary/5 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-brand-primary">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-heading font-bold mb-5 text-brand-primary tracking-wide">Gov. Standards</h3>
              <p className="text-brand-text/80 leading-[1.8] font-normal tracking-wide text-[15px]">
                Our eligibility engine is anchored strictly to the official 2026 HHS Poverty Guidelines to provide you with the most accurate estimates.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LandingPage;
