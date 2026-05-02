import React from 'react';
import { motion } from 'framer-motion';

const EXPLANATIONS = {
  pneumonia: {
    PNEUMONIA: {
      title: 'Pneumonia Detected',
      what: 'Pneumonia is an infection that inflames the air sacs (alveoli) in the lungs. The AI identified visual patterns in this X-ray consistent with pneumonia — such as increased opacity, consolidation, or fluid in the lung fields.',
      next: ['Consult a pulmonologist or GP immediately', 
             'A course of antibiotics is typically prescribed for bacterial pneumonia',
             'Rest and hydration are important for recovery'],
      severity: 'Requires medical attention',
      color: 'red'
    },
    NORMAL: {
      title: 'No Pneumonia Detected',
      what: 'The AI found no visual patterns in this chest X-ray consistent with pneumonia. The lung fields appear clear without significant consolidation, opacity, or fluid.',
      next: ['Continue monitoring symptoms if any exist',
             'Consult a doctor if symptoms persist despite this result',
             'Routine X-ray follow-up as recommended by your doctor'],
      severity: 'No immediate concern detected',
      color: 'teal'
    }
  },
  tumor: {
    glioma: {
      title: 'Glioma Detected',
      what: 'Gliomas are tumors that arise from glial cells in the brain or spine. The AI identified MRI patterns such as irregular signal intensity and abnormal tissue regions characteristic of glioma.',
      next: ['Immediate neurologist consultation required',
             'Additional MRI with contrast and biopsy may be needed',
             'Treatment typically involves surgery, radiation, and/or chemotherapy'],
      severity: 'Urgent medical attention required',
      color: 'red'
    },
    meningioma: {
      title: 'Meningioma Detected',
      what: 'Meningiomas arise from the meninges — the membranes surrounding the brain and spinal cord. They are often slow-growing and many are benign.',
      next: ['Neurologist consultation recommended',
             'Many meningiomas are monitored over time (watchful waiting)',
             'Surgery may be required depending on size and location'],
      severity: 'Medical evaluation needed',
      color: 'amber'
    },
    pituitary: {
      title: 'Pituitary Tumor Detected',
      what: 'Pituitary tumors form in the pituitary gland at the base of the brain. Most are benign (adenomas) and may cause hormonal imbalances.',
      next: ['Endocrinologist and neurologist consultation',
             'Hormone level blood tests recommended',
             'Treatment options include medication, surgery, or radiation'],
      severity: 'Medical evaluation needed',
      color: 'amber'
    },
    notumor: {
      title: 'No Tumor Detected',
      what: 'The AI found no MRI patterns consistent with a brain tumor in this scan. Brain tissue appears within normal visual parameters for the analyzed features.',
      next: ['Continue with routine neurological checkups if symptomatic',
             'Consult a neurologist if headaches or neurological symptoms persist',
             'This result does not rule out all neurological conditions'],
      severity: 'No tumor pattern detected',
      color: 'teal'
    }
  }
};

const ResultExplainer = ({ diseaseType, prediction }) => {
  const data = EXPLANATIONS[diseaseType]?.[prediction];
  
  if (!data) return null;
  
  const colorClass = data.color === 'red' ? 'text-med-red border-med-red/20' : 
                    data.color === 'amber' ? 'text-amber-400 border-amber-400/20' : 
                    'text-med-teal border-med-teal/20';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 mt-8 border border-white/5 bg-white/5 backdrop-blur-lg rounded-2xl"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-2 h-8 rounded-full ${data.color === 'red' ? 'bg-med-red' : data.color === 'amber' ? 'bg-amber-400' : 'bg-med-teal'}`} />
        <h3 className="text-2xl font-bold font-display">What Does This Mean?</h3>
      </div>
      
      <div className="space-y-6">
        <div>
          <h4 className={`font-bold mb-2 uppercase tracking-widest text-xs ${colorClass}`}>{data.title}</h4>
          <p className="text-med-muted text-sm leading-relaxed">{data.what}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
            <h4 className="text-med-white font-bold text-xs uppercase tracking-widest mb-3">Recommended Next Steps</h4>
            <ul className="space-y-2">
              {data.next.map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-med-muted text-xs leading-tight">
                  <span className="text-med-teal mt-0.5">•</span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col justify-center">
            <h4 className="text-med-white font-bold text-xs uppercase tracking-widest mb-2">Severity Level</h4>
            <p className={`text-lg font-bold font-display ${colorClass}`}>{data.severity}</p>
            <p className="text-med-muted text-[10px] mt-2 leading-tight">
              Note: This is an AI-assisted analysis and should be verified by a medical professional.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ResultExplainer;
