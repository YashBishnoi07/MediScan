import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Share2, Info, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import ConfidenceRing from './ConfidenceRing';
import ModelCard from './ModelCard';
import HeatmapOverlay from './HeatmapOverlay';
import SearchPathViz from './SearchPathViz';
import EnsemblePanel from './EnsemblePanel';
import Tooltip from './Tooltip';
import ResultExplainer from './ResultExplainer';
import GradCamExplainer from './GradCamExplainer';
import { generateMedicalReport } from '../utils/reportGenerator';
import { Zap } from 'lucide-react';

export default function ResultsPanel({ result, patientInfo }) {
  const [showFullDetails, setShowFullDetails] = useState(false);
  const resultsRef = useRef(null);

  // Sequential reveal state
  const [revealStep, setRevealStep] = useState(0);

  useEffect(() => {
    // Reset and trigger reveal sequence
    setRevealStep(0);
    const timers = [
      setTimeout(() => setRevealStep(1), 500),  // Images
      setTimeout(() => setRevealStep(2), 1200), // Badge
      setTimeout(() => setRevealStep(3), 1800), // Confidence
      setTimeout(() => setRevealStep(4), 2400), // Recommendation
    ];
    return () => timers.forEach(clearTimeout);
  }, [result]);

  const handleDownloadReport = async () => {
    await generateMedicalReport(
      patientInfo,
      result,
      result.images.original,
      result.images.heatmap
    );
  };

  return (
    <div ref={resultsRef} className="space-y-6">
      <div className="glass-panel p-8">
        <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-med-teal mb-1">
              Analysis Results
            </div>
            <h2 className="text-3xl font-bold font-display">Diagnostic Report</h2>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleDownloadReport}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-med-teal/10 border border-med-teal/20 text-med-teal hover:bg-med-teal hover:text-med-navy transition-all font-bold text-xs"
              title="Download Medical PDF"
            >
              <Download className="w-4 h-4" />
              Download Clinical Report
            </button>
            <button className="p-3 rounded-xl bg-white/5 border border-white/10 text-med-white hover:border-white/30 transition-all">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Scan Visuals */}
          <div className={`transition-all duration-1000 ${revealStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <HeatmapOverlay 
              original={result.images.original} 
              segmented={result.images.segmented}
              heatmap={result.images.heatmap} 
              isPositive={result.is_positive}
            />
            <GradCamExplainer />
          </div>

          {/* Core Metrics */}
          <div className="space-y-8">
            <div className={`transition-all duration-700 delay-300 ${revealStep >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
              <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl border font-bold uppercase tracking-widest text-sm ${
                result.is_positive 
                ? 'bg-med-red/10 border-med-red/30 text-med-red' 
                : 'bg-med-green/10 border-med-green/30 text-med-green'
              }`}>
                {result.is_positive ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                {result.prediction} DETECTED
              </div>
            </div>

            <div className={`flex items-end gap-6 transition-all duration-700 delay-700 ${revealStep >= 3 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
              <Tooltip 
                label="Confidence Score" 
                explanation="How certain the AI is about its prediction. Above 85% is considered high confidence."
              >
                <ConfidenceRing 
                  percentage={Math.round(result.confidence * 100)} 
                  color={result.is_positive ? '#EF233C' : '#00B4D8'} 
                />
              </Tooltip>
              <div className="pb-2">
                <div className="text-med-muted text-xs uppercase font-bold tracking-widest mb-1">Processing Time</div>
                <div className="text-2xl font-mono text-white">{result.processing_time_sec}s</div>
              </div>
            </div>

            <div className={`p-6 rounded-2xl bg-med-navy/50 border border-white/5 transition-all duration-1000 delay-1000 ${revealStep >= 4 ? 'opacity-100' : 'opacity-0'}`}>
              <h4 className="text-sm font-bold text-med-teal-lt mb-3 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Clinical Recommendation
              </h4>
              <p className="text-med-white text-sm leading-relaxed">
                {result.recommendation}
              </p>
            </div>
          </div>
        </div>
      </div>

      <ResultExplainer diseaseType={result.disease_type} prediction={result.prediction} />

      {/* SHAP Explainability Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.5 }}
        className="glass-panel p-8"
      >
        <h3 className="text-xl font-bold mb-8 flex items-center gap-3 font-display">
          <Zap className="w-5 h-5 text-med-amber" />
          Inference Rationale (SHAP)
        </h3>
        <div className="space-y-4">
          {result.shap_features?.map((f, i) => (
            <div key={i} className="group">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-2 px-1">
                <span className="text-med-muted group-hover:text-med-white transition-colors">{f.feature}</span>
                <span className={f.importance > 0 ? 'text-med-red' : 'text-med-teal'}>
                  {f.importance > 0 ? '+' : ''}{(f.importance * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-med-navy rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.abs(f.importance) * 100}%` }}
                  transition={{ duration: 1, delay: 2.8 + (i * 0.1) }}
                  className={`h-full rounded-full ${f.importance > 0 ? 'bg-med-red/50' : 'bg-med-teal/50'}`}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Ensemble Details */}
      <button 
        onClick={() => setShowFullDetails(!showFullDetails)}
        className="w-full py-4 text-med-muted hover:text-med-teal transition-colors text-sm font-bold flex items-center justify-center gap-2"
      >
        {showFullDetails ? 'Hide Model Ensemble Data' : 'View Detailed Ensemble Analysis'}
        <ArrowRight className={`w-4 h-4 transition-transform ${showFullDetails ? '-rotate-90' : 'rotate-90'}`} />
      </button>

      <AnimatePresence>
        {showFullDetails && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <EnsemblePanel result={result} />
            
            <div className="glass-panel p-8 mt-6">
              <h3 className="text-xl font-bold mb-8 font-display">AI Logical Search Path</h3>
              <SearchPathViz path={result.search_path} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-components need some minor styling updates to match the new theme

