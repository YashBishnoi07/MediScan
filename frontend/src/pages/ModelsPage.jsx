import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants, staggerContainer, cardVariants } from '../animations/pageTransitions';
import { getModelMetrics } from '../api/diagnosisApi';
import { Loader2, Database, Code, BrainCircuit, Activity, Zap, ShieldCheck, ChevronRight } from 'lucide-react';

const MODEL_EXPLANATIONS = {
  cnn: {
    name: 'EfficientNetV2 CNN',
    icon: '🧠',
    what: 'A state-of-the-art deep neural network optimized for medical imaging. It automatically learns to "see" textures, edges, and shapes in scans — similar to how a radiologist is trained over decades.',
    strength: 'Exceptional at identifying complex visual anomalies in high-resolution scans.',
    weakness: 'Requires high-performance GPUs for training and inference.',
    analogy: 'Like a master radiologist who has reviewed 14 million images before seeing yours.'
  },
  svm: {
    name: 'Support Vector Machine',
    icon: '📐',
    what: 'SVM finds the best mathematical boundary to separate "healthy" from "diseased" features. It uses the CNN features as input and draws an optimal decision line.',
    strength: 'Extremely effective in high-dimensional data spaces and resistant to "overfitting".',
    weakness: 'Less intuitive to interpret than decision trees.',
    analogy: 'Like drawing the clearest possible line between two groups of data points.'
  },
  rf: {
    name: 'Random Forest',
    icon: '🌲',
    what: 'Trains hundreds of decision trees, each on a different subset of the data. The final prediction is a consensus across all trees — reducing error from any single bad decision.',
    strength: 'Highly robust to noise in medical scans and provides feature importance metrics.',
    weakness: 'Can be memory-intensive due to the large number of trees.',
    analogy: 'Like asking 200 different doctors and going with the majority opinion.'
  },
  dt: {
    name: 'Decision Tree',
    icon: '🌿',
    what: 'Makes decisions by asking a series of yes/no questions about the image features until it reaches a conclusion — following a logical flowchart.',
    strength: 'Transparent and easy to follow — you can trace exactly why a decision was made.',
    weakness: 'Can sometimes focus too much on specific details, missing the "big picture".',
    analogy: 'Like a medical decision flowchart: "Is feature X above Y? → If yes, go to..."'
  },
  lr: {
    name: 'Logistic Regression',
    icon: '📊',
    what: 'A statistical model that calculates the mathematical probability of disease by combining weighted features. Fast and transparent.',
    strength: 'Provides well-calibrated probability estimates that are easy to understand.',
    weakness: 'May underperform on extremely complex, non-linear patterns.',
    analogy: 'Like a weighted scoring system where each feature adds or subtracts points.'
  }
};

export default function ModelsPage() {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedModel, setExpandedModel] = useState(null);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const data = await getModelMetrics();
        setMetrics(data.metrics);
      } catch (err) {
        console.error("Failed to fetch metrics", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, []);

  return (
    <motion.div 
      className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
    >
      <div className="text-center mb-16 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 font-display">Model Architecture</h1>
        <p className="text-med-muted text-lg leading-relaxed">
          MediScan uses a **Hybrid Ensemble Architecture**. A Convolutional Neural Network (EfficientNetV2) 
          acts as the primary feature extractor, while four classical ML models provide secondary 
          verification to ensure maximum clinical reliability.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        <div className="glass-card p-8 flex items-center gap-5 border border-white/5">
          <div className="w-14 h-14 bg-med-teal/10 text-med-teal rounded-2xl flex items-center justify-center"><Database size={28} /></div>
          <div>
            <div className="text-3xl font-bold font-display">12,000+</div>
            <div className="text-[10px] text-med-muted uppercase font-bold tracking-widest">Training Scans</div>
          </div>
        </div>
        <div className="glass-card p-8 flex items-center gap-5 border border-white/5">
          <div className="w-14 h-14 bg-med-amber/10 text-med-amber rounded-2xl flex items-center justify-center"><BrainCircuit size={28} /></div>
          <div>
            <div className="text-3xl font-bold font-display">5</div>
            <div className="text-[10px] text-med-muted uppercase font-bold tracking-widest">Voting Models</div>
          </div>
        </div>
        <div className="glass-card p-8 flex items-center gap-5 border border-white/5">
          <div className="w-14 h-14 bg-med-red/10 text-med-red rounded-2xl flex items-center justify-center"><Code size={28} /></div>
          <div>
            <div className="text-3xl font-bold font-display font-mono">EfficientNet</div>
            <div className="text-[10px] text-med-muted uppercase font-bold tracking-widest">Neural Base</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-med-teal" />
          <p className="text-med-muted text-sm font-bold uppercase tracking-widest">Fetching Performance Data...</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-2 h-8 bg-med-teal rounded-full" />
            <h2 className="text-3xl font-bold font-display">Ensemble Breakdown</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {metrics.map((model) => {
              const explainer = MODEL_EXPLANATIONS[model.id] || { name: model.name, what: 'Statistical verification model.', analogy: 'A specialist in medical data patterns.' };
              const isExpanded = expandedModel === model.id;

              return (
                <motion.div 
                  key={model.id}
                  layout
                  className={`glass-card p-8 border border-white/10 overflow-hidden transition-all duration-500 ${isExpanded ? 'bg-white/5' : 'hover:bg-white/5'}`}
                >
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-5">
                      <div className="text-4xl">{explainer.icon}</div>
                      <div>
                        <h3 className="text-2xl font-bold font-display">{explainer.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-med-teal">Active Mode</span>
                          <div className="w-1.5 h-1.5 rounded-full bg-med-teal animate-pulse" />
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold font-display text-white">{model.accuracy}%</div>
                      <div className="text-[10px] text-med-muted uppercase font-bold tracking-widest">Accuracy</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-med-dark/50 p-4 rounded-xl border border-white/5">
                      <div className="text-[10px] text-med-muted uppercase font-bold tracking-tighter mb-1">Precision</div>
                      <div className="text-xl font-bold font-display text-med-teal-lt">{model.precision}%</div>
                    </div>
                    <div className="bg-med-dark/50 p-4 rounded-xl border border-white/5">
                      <div className="text-[10px] text-med-muted uppercase font-bold tracking-tighter mb-1">Recall</div>
                      <div className="text-xl font-bold font-display text-med-teal-lt">{model.recall}%</div>
                    </div>
                    <div className="bg-med-dark/50 p-4 rounded-xl border border-white/5">
                      <div className="text-[10px] text-med-muted uppercase font-bold tracking-tighter mb-1">F1 Score</div>
                      <div className="text-xl font-bold font-display text-med-teal-lt">{model.f1}%</div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-med-white mb-2 flex items-center gap-2">
                        <Activity size={14} className="text-med-teal" />
                        Plain English Explanation
                      </h4>
                      <p className="text-med-muted text-sm leading-relaxed">
                        {explainer.what}
                      </p>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="space-y-6 pt-6 border-t border-white/5"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                              <h5 className="text-[10px] font-bold uppercase tracking-widest text-med-teal mb-2">Core Strength</h5>
                              <p className="text-med-muted text-xs leading-relaxed">{explainer.strength}</p>
                            </div>
                            <div>
                              <h5 className="text-[10px] font-bold uppercase tracking-widest text-med-red mb-2">Technical Limitation</h5>
                              <p className="text-med-muted text-xs leading-relaxed">{explainer.weakness}</p>
                            </div>
                          </div>
                          <div className="bg-med-teal/5 p-4 rounded-xl border border-med-teal/10 italic">
                            <p className="text-med-teal-lt text-xs">
                              <span className="font-bold uppercase tracking-widest text-[10px] mr-2">Simple Analogy:</span>
                              {explainer.analogy}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <button 
                    onClick={() => setExpandedModel(isExpanded ? null : model.id)}
                    className="w-full mt-8 py-3 rounded-xl border border-white/5 text-[10px] font-bold uppercase tracking-[0.2em] text-med-muted hover:text-med-teal hover:border-med-teal/30 transition-all flex items-center justify-center gap-2"
                  >
                    {isExpanded ? 'Show Less' : 'Technical Deep Dive'}
                    <ChevronRight size={14} className={`transition-transform duration-300 ${isExpanded ? '-rotate-90' : 'rotate-90'}`} />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
