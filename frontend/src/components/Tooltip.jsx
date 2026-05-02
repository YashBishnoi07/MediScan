import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Tooltip = ({ label, explanation, children }) => {
  const [visible, setVisible] = useState(false);
  
  return (
    <div className="relative inline-block"
         onMouseEnter={() => setVisible(true)}
         onMouseLeave={() => setVisible(false)}
         onFocus={() => setVisible(true)}
         onBlur={() => setVisible(false)}>
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 bottom-full mb-2 left-1/2 -translate-x-1/2
                       w-64 glass-card p-3 text-sm pointer-events-none backdrop-blur-xl border border-white/10 shadow-2xl"
          >
            <p className="text-med-teal font-semibold mb-1">{label}</p>
            <p className="text-med-muted text-xs leading-relaxed">{explanation}</p>
            <div className="absolute top-full left-1/2 -translate-x-1/2 
                            border-4 border-transparent border-t-white/10" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tooltip;
