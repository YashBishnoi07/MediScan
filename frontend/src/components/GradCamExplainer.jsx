import React from 'react';

const GradCamExplainer = () => (
  <div className="glass-card p-4 mt-3 border border-white/5 bg-white/5 backdrop-blur-md rounded-xl">
    <div className="flex items-start gap-4">
      <div className="text-3xl">🔍</div>
      <div>
        <h4 className="text-med-white font-semibold text-sm mb-2">
          Understanding This Heatmap (Grad-CAM)
        </h4>
        <p className="text-med-muted text-xs leading-relaxed">
          Grad-CAM (Gradient-weighted Class Activation Mapping) shows 
          <span className="text-med-red font-medium"> red/yellow regions </span>
          where the AI focused most when making its decision. 
          <span className="text-med-teal font-medium"> Blue regions </span>
          had little influence. This helps doctors verify whether the AI 
          is looking at clinically relevant areas of the scan.
        </p>
        <div className="flex gap-4 mt-3">
          {[
            { color: 'bg-red-500', label: 'High attention' },
            { color: 'bg-yellow-400', label: 'Medium attention' },
            { color: 'bg-blue-500', label: 'Low attention' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-full ${color} shadow-[0_0_8px_rgba(0,0,0,0.3)]`} />
              <span className="text-med-muted text-[10px] font-medium tracking-tight uppercase">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default GradCamExplainer;
