import React from 'react';
import { motion } from 'framer-motion';

const STEPS = [
  {
    number: '01',
    title: 'Upload Medical Scan',
    description: 'Upload any chest X-ray (JPEG/PNG) or brain MRI scan. Our system accepts standard hospital imaging formats.',
    icon: '📤',
    tech: 'Image validation + quality scoring'
  },
  {
    number: '02',
    title: 'AI Preprocessing',
    description: 'The image is resized, normalized, and enhanced. K-Means clustering segments the scan to isolate regions of interest for the AI to focus on.',
    icon: '⚙️',
    tech: 'OpenCV + K-Means Segmentation'
  },
  {
    number: '03',
    title: 'Deep Learning Analysis',
    description: 'EfficientNetB3 — a neural network pretrained on 14 million images — extracts hundreds of visual features from your scan.',
    icon: '🧠',
    tech: 'EfficientNetB3 + Transfer Learning'
  },
  {
    number: '04',
    title: 'Ensemble Voting',
    description: '4 machine learning models independently analyze the extracted features and vote on the diagnosis. The majority verdict is the final prediction.',
    icon: '🗳️',
    tech: 'SVM + Random Forest + Decision Tree + LR'
  },
  {
    number: '05',
    title: 'Explainable Results',
    description: 'Grad-CAM generates a heatmap showing exactly which areas of the scan influenced the AI\'s decision, making the result transparent.',
    icon: '🔍',
    tech: 'Grad-CAM Visualization'
  },
  {
    number: '06',
    title: 'Downloadable Report',
    description: 'A professional PDF report is generated with patient details, all model scores, scan images, heatmap, and recommendations.',
    icon: '📄',
    tech: 'jsPDF + Clinical formatting'
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-med-teal/5 blur-[120px] rounded-full -translate-y-1/2" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-6">Scientific Methodology</h2>
          <p className="text-med-muted max-w-2xl mx-auto">
            Our multi-layered analysis pipeline ensures clinical-grade accuracy by combining 
            computer vision with robust statistical ensembles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {STEPS.map((step, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -5 }}
              className="glass-card p-8 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 text-4xl font-display font-black text-white/5 group-hover:text-med-teal/10 transition-colors">
                {step.number}
              </div>
              
              <div className="w-12 h-12 rounded-2xl bg-med-teal/10 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-500">
                {step.icon}
              </div>
              
              <h3 className="text-xl font-bold mb-4 font-display group-hover:text-med-teal transition-colors">
                {step.title}
              </h3>
              
              <p className="text-med-muted text-sm leading-relaxed mb-6">
                {step.description}
              </p>
              
              <div className="pt-6 border-t border-white/5 flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-med-teal" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-med-teal-lt opacity-70">
                  {step.tech}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
