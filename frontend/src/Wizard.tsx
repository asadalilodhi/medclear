import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Send, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';
import DataDrawer, { type ExtractedData } from './components/DataDrawer';
import imageCompression from 'browser-image-compression';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const Wizard = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I am MedClear's secure financial navigator. I can help you figure out if you qualify for hospital financial assistance. To get started, you can type your situation, or upload a photo of your medical bill to speed things up." }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [liveState, setLiveState] = useState<ExtractedData>({});
  
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const sendMessage = async (overrideText?: string) => {
    const textToSend = overrideText || inputValue;
    if (!textToSend.trim()) return;

    const newMessages = [...messages, { role: 'user' as const, content: textToSend }];
    setMessages(newMessages);
    setInputValue('');
    setIsProcessing(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });
      const data = await res.json();
      
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      }
      if (data.evaluation) {
        setEvaluation(data.evaluation);
      }
      if (data.state) {
        setLiveState({
          hospitalName: data.state.hospital || '',
          grossIncome: data.state.income ? data.state.income.toString() : '',
          householdSize: data.state.household ? data.state.household.toString() : ''
        });
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting to the secure server. Please make sure the backend is running." }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true
      };
      const compressedFile = await imageCompression(file, options);
      
      const formData = new FormData();
      formData.append('file', compressedFile);
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_URL}/api/extract-bill`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.extracted_data) {
        const ext = data.extracted_data;
        const msg = `I uploaded a bill. Extracted Data -> Hospital: ${ext.hospitalName || 'unknown'}, Amount: ${ext.totalAmount || 'unknown'}, Income: ${ext.grossIncome || 'unknown'}, Household Size: ${ext.householdSize || 'unknown'}.`;
        await sendMessage(msg);
      }
    } catch (error) {
      alert("Error processing image.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center p-6 relative py-10 bg-brand-offwhite min-h-[calc(100vh-80px)]">
      <DataDrawer data={liveState} />
      <div className="w-full max-w-4xl bg-brand-surface rounded-3xl shadow-sm border border-brand-primary/5 flex flex-col h-[800px] overflow-hidden">
        
        {/* Header */}
        <div className="bg-brand-surface border-b border-brand-primary/5 p-6 flex justify-between items-center z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-xl text-brand-primary">Secure Chat</h2>
              <p className="text-xs text-brand-accent font-bold uppercase tracking-widest">End-to-End Encrypted Session</p>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-brand-offwhite/50 scroll-smooth">
          <AnimatePresence>
            {messages.map((m, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-5 rounded-3xl ${m.role === 'user' ? 'bg-brand-primary text-white rounded-tr-sm' : 'bg-brand-surface border border-brand-primary/10 text-brand-text rounded-tl-sm shadow-sm'}`}>
                  <p className="leading-relaxed font-medium">{m.content}</p>
                </div>
              </motion.div>
            ))}
            
            {isProcessing && !evaluation && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="bg-brand-surface border border-brand-primary/10 p-5 rounded-3xl rounded-tl-sm shadow-sm flex items-center space-x-3">
                  <Loader2 className="w-5 h-5 text-brand-accent animate-spin" />
                  <span className="text-brand-text/70 font-medium text-sm">Processing securely...</span>
                </div>
              </motion.div>
            )}

            {evaluation && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start w-full mt-8">
                <div className="w-full bg-brand-surface border-2 border-brand-primary/10 rounded-3xl p-8 shadow-md">
                  <div className="flex items-center mb-6 pb-4 border-b border-brand-primary/5">
                    <CheckCircle2 className={`w-8 h-8 mr-3 ${evaluation.error ? 'text-red-500' : 'text-brand-accent'}`} />
                    <h3 className="text-2xl font-heading font-bold text-brand-primary">Official Determination</h3>
                  </div>
                  
                  {evaluation.error ? (
                    <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                      <p className="text-red-800 font-medium leading-relaxed">{evaluation.message}</p>
                    </div>
                  ) : (
                    <>
                      <div className="mb-6">
                        <p className="text-brand-primary text-xl font-bold leading-relaxed">{evaluation.determination}</p>
                      </div>
                      <div className="bg-brand-primary/5 p-6 rounded-2xl mb-6">
                        <p className="text-xs uppercase tracking-widest text-brand-primary font-bold mb-2">Verified Policy Quote</p>
                        <p className="font-serif italic text-brand-text">"{evaluation.quote}"</p>
                      </div>
                      <div className="flex justify-between items-center bg-brand-offwhite p-4 rounded-xl text-sm font-medium border border-brand-primary/5">
                        <span className="text-brand-text/70">Calculated FPL: <strong className="text-brand-primary">{evaluation.fpl}%</strong></span>
                        <a href={evaluation.url} target="_blank" rel="noreferrer" className="text-brand-accent font-bold hover:underline">Read Source Policy</a>
                      </div>
                    </>
                  )}
                  <button onClick={() => { setEvaluation(null); setMessages([{role: 'assistant', content: 'Evaluation cleared. How else can I assist you today?'}]); }} className="mt-8 w-full py-4 border-2 border-brand-primary/10 text-brand-primary font-bold rounded-2xl hover:bg-brand-primary/5 transition">
                    Start New Session
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Area */}
        <div className="p-6 bg-brand-surface border-t border-brand-primary/5">
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex items-end gap-4 relative">
            <div className="relative flex-1">
              <textarea 
                rows={2}
                placeholder="Type your situation here..." 
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                className="w-full border-2 border-brand-primary/10 rounded-2xl py-4 pl-6 pr-16 focus:border-brand-accent focus:ring-0 outline-none transition resize-none font-medium text-brand-text bg-brand-offwhite/50" 
                disabled={isProcessing || !!evaluation}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <input type="file" id="bill-upload" onChange={handleImageUpload} className="hidden" accept="image/*" disabled={isProcessing || !!evaluation} />
                <label htmlFor="bill-upload" className={`p-2 rounded-full flex items-center justify-center transition cursor-pointer ${isProcessing || !!evaluation ? 'text-gray-300' : 'text-brand-primary hover:bg-brand-primary/10'}`}>
                  <Camera className="w-6 h-6" />
                </label>
              </div>
            </div>
            <button 
              type="submit" 
              disabled={!inputValue.trim() || isProcessing || !!evaluation} 
              className="bg-brand-primary disabled:opacity-50 text-white w-14 h-14 rounded-2xl flex items-center justify-center hover:bg-brand-primary/90 transition shadow-sm shrink-0"
            >
              <Send className="w-6 h-6 ml-1" />
            </button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-xs text-brand-text/50 font-medium">Session is strictly ephemeral. Data clears upon page refresh or closing tab.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wizard;
