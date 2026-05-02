import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, Circle } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Image Preprocessing',    desc: 'Normalizing pixel values' },
  { id: 2, label: 'K-Means Segmentation',   desc: 'Isolating regions of interest' },
  { id: 3, label: 'CNN Feature Extraction', desc: 'Analyzing visual patterns' },
  { id: 4, label: 'Ensemble Classification', desc: 'Running model voting' },
  { id: 5, label: 'Grad-CAM Generation',    desc: 'Mapping attention regions' },
  { id: 6, label: 'Report Compilation',     desc: 'Assembling final diagnosis' },
];

const ProcessingSteps = ({ isProcessing }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);

  useEffect(() => {
    if (!isProcessing) {
      setCurrentStep(1);
      setCompletedSteps([]);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < STEPS.length) {
          setCompletedSteps(comp => [...comp, prev]);
          return prev + 1;
        }
        return prev;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isProcessing]);

  if (!isProcessing) return null;

  return (
    <div className="w-full max-w-sm mx-auto space-y-4">
      {STEPS.map((step) => {
        const isCompleted = completedSteps.includes(step.id);
        const isActive = currentStep === step.id;
        
        return (
          <motion.div 
            key={step.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start gap-4"
          >
            <div className="mt-1">
              {isCompleted ? (
                <CheckCircle2 size={18} className="text-med-teal" />
              ) : isActive ? (
                <Loader2 size={18} className="text-med-teal animate-spin" />
              ) : (
                <Circle size={18} className="text-white/10" />
              )}
            </div>
            
            <div className="flex-1">
              <p className={`text-sm font-bold tracking-tight transition-colors ${isActive ? 'text-med-white' : isCompleted ? 'text-med-teal/70' : 'text-white/20'}`}>
                {step.label}
              </p>
              <AnimatePresence>
                {isActive && (
                  <motion.p 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="text-[10px] text-med-muted italic mt-0.5"
                  >
                    {step.desc}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ProcessingSteps;
