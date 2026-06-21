import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, CheckCircle2, X, AlertTriangle } from 'lucide-react';

export interface ExtractedData {
  hospitalName?: string;
  totalAmount?: string;
  grossIncome?: string;
  householdSize?: string;
}

interface DataDrawerProps {
  data: ExtractedData;
}

const DataDrawer = ({ data }: DataDrawerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const completedCount = Object.values(data).filter(Boolean).length;
  const totalCount = 4;

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-brand-accent text-white px-5 py-3 rounded-sm shadow-xl hover:bg-brand-primary transition-colors flex items-center z-40 border border-brand-accent-light"
      >
        <ClipboardList className="w-5 h-5 mr-2" />
        <span className="font-bold text-sm tracking-wide">DATA CHECKLIST ({completedCount}/{totalCount})</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-brand-offwhite shadow-2xl z-50 p-8 overflow-y-auto border-l-4 border-brand-accent"
          >
            <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-brand-primary flex items-center tracking-tight">
                <ClipboardList className="w-6 h-6 mr-3 text-brand-accent" />
                Extraction Review
              </h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-brand-primary transition">
                <X className="w-8 h-8" />
              </button>
            </div>

            <p className="text-base text-gray-600 mb-8 leading-relaxed font-medium">
              This data was extracted dynamically via our AI pipeline. Please verify these fields before continuing to the final RAG evaluation.
            </p>

            <div className="space-y-4">
              <ChecklistItem label="Hospital Name" value={data.hospitalName} />
              <ChecklistItem label="Total Balance" value={data.totalAmount} prefix="$" />
              <ChecklistItem label="Gross Income" value={data.grossIncome} prefix="$" />
              <ChecklistItem label="Household Size" value={data.householdSize} />
            </div>

            <div className="mt-10 p-5 bg-brand-surface rounded-sm border-l-4 border-yellow-400 shadow-sm">
              <p className="text-sm text-gray-700 font-semibold flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0" />
                Missing data? Close this drawer and provide the remaining information in the main window.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const ChecklistItem = ({ label, value, prefix = "" }: { label: string, value?: string, prefix?: string }) => (
  <div className={`p-5 rounded-sm border-2 ${value ? 'border-brand-accent bg-brand-surface shadow-sm' : 'border-dashed border-gray-300 bg-gray-50'}`}>
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{label}</span>
      {value ? <CheckCircle2 className="w-5 h-5 text-brand-accent" /> : <div className="w-5 h-5 rounded-sm border-2 border-gray-300" />}
    </div>
    <div className={`text-xl font-bold ${value ? 'text-brand-primary tracking-tight' : 'text-gray-400 italic font-medium'}`}>
      {value ? `${prefix}${value}` : 'Awaiting input...'}
    </div>
  </div>
);

export default DataDrawer;
