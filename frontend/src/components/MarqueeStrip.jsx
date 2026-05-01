import React from 'react';

const ITEMS = [
  "EfficientNet B3", "Transfer Learning", "Grad-CAM Heatmaps", 
  "K-Means Segmentation", "AUC-ROC: 0.97+", "A* Search Algorithm", 
  "Real-Time Diagnosis", "SHAP Explainability", "Precision Oncology",
  "Pneumonia Detection", "Brain Tumor MRI", "Ensemble Verification"
];

export default function MarqueeStrip() {
  const duplicatedItems = [...ITEMS, ...ITEMS, ...ITEMS]; // Triple for seamlessness

  return (
    <div className="marquee-strip group">
      <div className="flex animate-marquee whitespace-nowrap">
        {duplicatedItems.map((item, idx) => (
          <div key={idx} className="flex items-center mx-8">
            <span className="text-med-teal/60 font-mono text-sm tracking-widest uppercase group-hover:text-med-teal transition-colors duration-500">
              {item}
            </span>
            <span className="ml-16 text-med-mid select-none">•</span>
          </div>
        ))}
      </div>
    </div>
  );
}
