import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Brain, Zap, BarChart3, ChevronDown, CheckCircle2, AlertTriangle } from 'lucide-react';

const MODEL_LABELS = {
  svm: 'Support Vector Machine',
  random_forest: 'Random Forest',
  decision_tree: 'Decision Tree',
  logistic_regression: 'Logistic Regression'
};

const MODEL_COLORS = {
  svm: '#00B4D8',
  random_forest: '#06D6A0',
  decision_tree: '#FFB703',
  logistic_regression: '#9D4EDD'
};

export default function EnsemblePanel({ result }) {
  const ensemble = result?.ensemble_result;
  if (!ensemble) return null;

  const { individual_models, ensemble_prediction, ensemble_confidence, vote_count, vote_distribution } = ensemble;
  const votes = vote_count || vote_distribution || {};
  const agreementCount = Object.values(votes).length > 0 ? Math.max(...Object.values(votes)) : 0;

  return (
    <div className="space-y-8 mt-12 border-t border-white/5 pt-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-2xl bg-med-teal/10 text-med-teal">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-2xl font-bold font-display">Multi-Model Consensus</h3>
          <p className="text-med-muted text-sm">Aggregated diagnostic intelligence from 5 specialized AI architectures</p>
        </div>
      </div>

      {/* Ensemble Verdict Banner */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`p-8 rounded-[2rem] border-2 flex flex-col items-center justify-center text-center relative overflow-hidden ${
          result.is_positive 
            ? 'bg-med-red/5 border-med-red/20' 
            : 'bg-med-green/5 border-med-green/20'
        }`}
      >
        <div className="absolute -right-8 -top-8 opacity-5">
            <Brain className="w-48 h-48" />
        </div>

        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-med-muted mb-4">Consensus Verdict</span>
        <h2 className={`text-5xl font-display font-black mb-4 tracking-tight ${
          result.is_positive ? 'text-med-red' : 'text-med-green'
        }`}>
          {ensemble_prediction.toUpperCase()}
        </h2>
        
        <div className="flex items-center gap-6">
            <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase font-bold text-med-muted mb-1">Certainty</span>
                <span className="text-2xl font-mono text-white">{(ensemble_confidence * 100).toFixed(1)}%</span>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase font-bold text-med-muted mb-1">Agreement</span>
                <span className="text-2xl font-mono text-white">{agreementCount}/4</span>
            </div>
        </div>
      </motion.div>

      {/* Model Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(individual_models).map(([key, data], i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-med-navy/40 border border-white/5 p-6 rounded-3xl group hover:border-white/20 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-med-muted mb-1">{MODEL_LABELS[key]}</p>
                <h4 className={`text-xl font-bold ${
                  data.prediction === 'NORMAL' || data.prediction === 'notumor' ? 'text-med-green' : 'text-med-red'
                }`}>
                  {data.prediction.toUpperCase()}
                </h4>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-bold uppercase text-med-muted mb-1">Confidence</p>
                  <p className="text-lg font-mono text-white">{(data.confidence * 100).toFixed(1)}%</p>
              </div>
            </div>

            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${data.confidence * 100}%` }}
                    transition={{ duration: 1.5, delay: 0.5 + i * 0.1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: MODEL_COLORS[key] }}
                />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Voting Logic */}
      <div className="bg-med-navy/60 border border-white/10 p-6 rounded-[2rem] flex items-center justify-between">
          <div className="flex items-center gap-4">
              <BarChart3 className="w-5 h-5 text-med-teal" />
              <span className="text-sm font-bold text-med-white">Decision Voting Distribution</span>
          </div>
          <div className="flex gap-4">
              {Object.entries(votes).map(([label, count]) => (
                  <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5">
                      <div className={`w-2 h-2 rounded-full ${count > 0 ? (label === 'normal' || label === 'NORMAL' ? 'bg-med-green' : 'bg-med-red') : 'bg-white/10'}`} />
                      <span className="text-xs font-bold text-med-white capitalize">{label}: {count}</span>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
}
