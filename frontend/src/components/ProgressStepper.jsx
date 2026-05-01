import { motion } from 'framer-motion';
import { CheckCircle2, Loader2 } from 'lucide-react';

export default function ProgressStepper({ steps, currentStep }) {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Background Line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-dark-700 rounded-full z-0" />
        
        {/* Active Line Progress */}
        <motion.div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-medical-500 rounded-full z-0 shadow-[0_0_10px_rgba(14,165,233,0.5)]"
          initial={{ width: '0%' }}
          animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />

        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          
          return (
            <div key={index} className="relative z-10 flex flex-col items-center">
              <motion.div 
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300
                  ${isCompleted ? 'bg-medical-500 border-medical-500 text-white' : 
                    isActive ? 'bg-dark-800 border-medical-500 text-medical-400 shadow-[0_0_15px_rgba(14,165,233,0.4)]' : 
                    'bg-dark-800 border-dark-600 text-gray-500'}
                `}
                initial={false}
                animate={{ scale: isActive ? 1.1 : 1 }}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isActive && index !== steps.length - 1 ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span className="text-xs font-bold">{index + 1}</span>
                )}
              </motion.div>
              <div className="absolute top-10 whitespace-nowrap text-xs font-medium text-center">
                <span className={isActive || isCompleted ? 'text-gray-200' : 'text-gray-500'}>
                  {step}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
