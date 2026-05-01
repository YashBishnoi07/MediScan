import React from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck } from 'lucide-react';

export default function ModelCard({ model }) {
  if (!model) return null;
  const percentage = Math.round(model.accuracy || 0);
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-med-navy/40 border border-white/5 p-6 rounded-3xl relative overflow-hidden group hover:border-med-teal/30 transition-all flex flex-col h-full"
    >
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Activity className="w-16 h-16 text-med-teal" />
      </div>
      
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-med-teal/10 text-med-teal">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-bold text-med-white tracking-wide">{model.name}</h4>
      </div>

      <p className="text-xs text-med-muted mb-8 leading-relaxed flex-1">
        {model.description}
      </p>

      <div className="space-y-4">
        <div className="flex items-end justify-between">
            <div className="text-3xl font-mono font-bold text-med-white">
                {percentage}%
            </div>
            <div className="text-[10px] uppercase font-bold text-med-muted tracking-widest mb-1">
                Accuracy
            </div>
        </div>

        {/* Mini Progress Bar */}
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, delay: 0.2 }}
            className="h-full bg-gradient-to-r from-med-teal/50 to-med-teal"
            />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/5">
            <div>
                <p className="text-[9px] uppercase font-bold text-med-muted mb-1">Precision</p>
                <p className="text-xs font-mono text-med-white">{model.precision}%</p>
            </div>
            <div>
                <p className="text-[9px] uppercase font-bold text-med-muted mb-1">Recall</p>
                <p className="text-xs font-mono text-med-white">{model.recall}%</p>
            </div>
        </div>
      </div>
    </motion.div>
  );
}
