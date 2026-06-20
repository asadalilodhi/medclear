import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, Link as LinkIcon, Activity, Search } from 'lucide-react';

const DataSourcesPage = () => {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || '';
        const res = await fetch(`${API_URL}/api/policies`);
        const data = await res.json();
        if (data.policies) setPolicies(data.policies);
      } catch (e) {
        console.error("Failed to load policies", e);
      } finally {
        setLoading(false);
      }
    };
    fetchPolicies();
  }, []);

  return (
    <div className="min-h-screen bg-brand-offwhite text-brand-text pt-24 pb-32 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-8 text-brand-primary leading-[1.15]">Data Architecture</h1>
        <p className="text-xl text-brand-text/80 mb-16 max-w-3xl leading-relaxed font-medium">
          We utilize a strict Retrieval-Augmented Generation (RAG) pipeline. Every evaluation is mathematically cross-referenced against verifiable, public datasets to ensure accuracy and trust.
        </p>
        
        <div className="grid md:grid-cols-1 gap-8">
          <div className="bg-brand-surface p-10 rounded-3xl shadow-sm border border-brand-primary/5">
            <div className="flex items-center mb-8 pb-6 border-b border-brand-primary/5">
              <div className="bg-brand-primary/5 w-14 h-14 rounded-2xl flex items-center justify-center mr-4 text-brand-primary">
                <Database className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-heading font-bold text-brand-primary">Government Standards</h2>
            </div>
            <p className="text-brand-text/80 mb-8 leading-relaxed">
              Our deterministic math engine explicitly uses the official 2026 Department of Health and Human Services (HHS) Poverty Guidelines.
            </p>
            <div className="bg-brand-offwhite p-6 rounded-2xl border border-brand-primary/5 mb-8 font-medium text-sm">
              <ul className="space-y-4 text-sm font-medium text-brand-text/80">
                <li className="flex justify-between border-b border-brand-primary/5 pb-2"><span>BASE_FPL_1_PERSON</span> <span className="font-bold text-brand-primary">$15,960</span></li>
                <li className="flex justify-between"><span>INCREMENT_PER_PERSON</span> <span className="font-bold text-brand-primary">$5,680</span></li>
              </ul>
              
              <a href="https://aspe.hhs.gov/topics/poverty-economic-mobility/poverty-guidelines" target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center text-xs font-bold text-brand-accent uppercase tracking-widest hover:text-brand-primary transition">
                View Official Gov Source
                <LinkIcon className="w-3 h-3 ml-2" />
              </a>
            </div>
          </div>

          <div className="max-w-4xl mx-auto w-full">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-heading font-bold text-brand-primary">Live RAG Index</h2>
              <div className="flex items-center space-x-2 text-sm font-bold text-brand-accent uppercase tracking-widest bg-brand-accent/10 px-4 py-2 rounded-full">
                <Activity className="w-4 h-4" />
                <span>Real-Time Web Scraping</span>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="w-8 h-8 border-4 border-brand-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-brand-text/50 font-bold uppercase tracking-widest text-sm">Synchronizing with Secure Database...</p>
              </div>
            ) : policies.length === 0 ? (
              <div className="bg-brand-surface border border-brand-primary/10 rounded-3xl p-12 text-center shadow-sm">
                <Search className="w-12 h-12 text-brand-text/20 mx-auto mb-4" />
                <h3 className="text-xl font-heading font-bold text-brand-primary mb-2">Database is Empty</h3>
                <p className="text-brand-text/70">The system has not scraped any hospital policies yet. Head to the Evaluate tab and ask about a hospital to trigger the autonomous web scraper!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {policies.map((p) => (
                  <motion.div 
                    key={p.id}
                    whileHover={{ y: -5 }}
                    className="bg-brand-surface border border-brand-primary/10 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="bg-brand-primary/5 w-12 h-12 rounded-2xl flex items-center justify-center text-brand-primary font-bold text-xl uppercase">
                        {p.hospital_name.charAt(0)}
                      </div>
                      <span className="bg-brand-accent/10 text-brand-accent text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                        Verified
                      </span>
                    </div>
                    
                    <h3 className="text-2xl font-heading font-bold text-brand-primary mb-2 capitalize">{p.hospital_name}</h3>
                    <p className="text-brand-text/70 text-sm leading-relaxed mb-6 line-clamp-2">
                      Autonomously scraped and verified directly from the official hospital domain via Jina Reader.
                    </p>
                    
                    <a href={p.policy_url} target="_blank" rel="noreferrer" className="flex items-center justify-between w-full p-4 bg-brand-offwhite rounded-2xl group-hover:bg-brand-primary/5 transition">
                      <span className="text-sm font-bold text-brand-primary">View Source Document</span>
                      <LinkIcon className="w-4 h-4 text-brand-primary/50 group-hover:text-brand-primary transition" />
                    </a>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSourcesPage;
