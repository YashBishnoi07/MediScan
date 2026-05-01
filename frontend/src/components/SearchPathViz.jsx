import React from 'react';
import { motion } from 'framer-motion';
import { Network, ArrowRight, BrainCircuit } from 'lucide-react';

export default function SearchPathViz({ path }) {
  if (!path || path.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 text-med-teal-lt mb-4">
        <BrainCircuit className="w-5 h-5" />
        <span className="text-xs font-bold uppercase tracking-widest">Heuristic Reasoning Sequence</span>
      </div>
      
      <div className="relative pl-6 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-med-teal/50 before:to-transparent">
        {path.map((node, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.15, duration: 0.5 }}
            className="relative"
          >
            {/* Dot */}
            <div className={`absolute -left-[23px] top-1.5 w-[16px] h-[16px] rounded-full border-2 border-med-navy z-10 transition-colors duration-500 ${
              index === path.length - 1 ? 'bg-med-teal scale-125 shadow-[0_0_15px_rgba(0,180,216,0.6)]' : 'bg-med-teal/20'
            }`} />

            <div className="flex items-center justify-between group">
              <div className="flex-1">
                <div className={`text-sm font-bold transition-colors ${index === path.length - 1 ? 'text-med-teal' : 'text-med-white/80'}`}>
                  {node.state}
                </div>
                <div className="text-[10px] text-med-muted uppercase tracking-tighter mt-1 font-mono">
                  Traversal Cost: <span className="text-med-teal-lt/60">{node.cost}</span>
                </div>
              </div>
              {index < path.length - 1 && (
                <ArrowRight className="w-4 h-4 text-white/5 group-hover:text-med-teal/20 transition-colors" />
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
