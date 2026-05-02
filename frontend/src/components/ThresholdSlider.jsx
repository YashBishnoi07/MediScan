import React from 'react';

const ThresholdSlider = ({ threshold, setThreshold }) => {
  const getLabel = (t) => {
    if (t < 0.45) return { 
      text: 'High Sensitivity', 
      color: 'text-med-red',
      desc: 'Catches more potential disease cases but may increase "false alarms" in healthy scans.' 
    };
    if (t > 0.55) return { 
      text: 'High Specificity', 
      color: 'text-med-green',
      desc: 'Ensures only clear disease patterns are flagged, reducing false alarms but potentially missing subtle cases.' 
    };
    return { 
      text: 'Balanced Mode', 
      color: 'text-med-teal',
      desc: 'The optimal standard for most clinical screenings, balancing detection rate and accuracy.' 
    };
  };

  const label = getLabel(threshold);

  return (
    <div className="glass-card p-6 mt-6 border border-white/5 bg-white/5 backdrop-blur-xl rounded-2xl">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="text-med-white font-bold text-sm tracking-tight">AI Decision Threshold</span>
          <div className="group relative">
            <div className="w-4 h-4 rounded-full border border-med-muted text-med-muted flex items-center justify-center text-[10px] cursor-help">i</div>
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2 bg-med-dark border border-white/10 rounded-lg text-[10px] text-med-muted opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
              Adjusting this changes how strict the AI is before flagging a disease.
            </div>
          </div>
        </div>
        <span className="text-med-teal font-mono font-bold text-lg">{(threshold * 100).toFixed(0)}%</span>
      </div>

      <input 
        type="range" 
        min={0.3} 
        max={0.8} 
        step={0.01}
        value={threshold} 
        onChange={e => setThreshold(Number(e.target.value))}
        className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-med-teal hover:accent-med-teal-lt transition-all" 
      />

      <div className="flex justify-between text-[8px] text-med-muted mt-3 font-bold uppercase tracking-[0.1em] px-1">
        <span className="bg-white/5 px-2 py-0.5 rounded">More Sensitive</span>
        <span className="bg-white/5 px-2 py-0.5 rounded">More Specific</span>
      </div>

      <div className="mt-5 p-4 rounded-xl bg-med-dark/50 border border-white/5">
        <p className={`font-bold text-xs mb-1 ${label.color}`}>{label.text}</p>
        <p className="text-med-muted text-[10px] leading-relaxed">{label.desc}</p>
      </div>
    </div>
  );
};

export default ThresholdSlider;
