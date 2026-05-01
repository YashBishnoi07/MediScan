import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Info, Play, RefreshCw, Layers, Zap, Database, Download } from 'lucide-react';
import { pageVariants } from '../animations/pageTransitions';
import UploadZone from '../components/UploadZone';
import ProgressStepper from '../components/ProgressStepper';
import ResultsPanel from '../components/ResultsPanel';
import { diagnosePneumonia, diagnoseTumor } from '../api/diagnosisApi';
import { v4 as uuidv4 } from 'uuid';
import gsap from 'gsap';

const STEPS = ["Upload", "Preprocessing", "Segmentation", "AI Analysis", "Results"];

const SAMPLES = {
  pneumonia: [
    { name: "Normal X-Ray", url: "https://raw.githubusercontent.com/ieee8023/covid-chestxray-dataset/master/images/normal.jpg" },
    { name: "Pneumonia Case", url: "https://raw.githubusercontent.com/ieee8023/covid-chestxray-dataset/master/images/pneumonia.jpg" }
  ],
  tumor: [
    { name: "Brain MRI Sample", url: "https://raw.githubusercontent.com/fede-navas/brain-tumor-detection/master/samples/tumor.jpg" }
  ]
};

export default function DiagnosePage() {
  const [diseaseType, setDiseaseType] = useState('pneumonia');
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [threshold, setThreshold] = useState(0.5);
  const [isComparisonMode, setIsComparisonMode] = useState(false);

  const containerRef = useRef(null);

  const handleUpload = (file) => {
    setSelectedImage(file);
    setResult(null);
    setError(null);
    setCurrentStep(0);
  };

  const loadSample = async (url) => {
    setIsProcessing(true);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], "sample.jpg", { type: "image/jpeg" });
      handleUpload(file);
    } catch (err) {
      setError("Failed to load sample image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRunDiagnosis = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      setCurrentStep(1); 
      await new Promise(r => setTimeout(r, 600));
      
      setCurrentStep(2);
      await new Promise(r => setTimeout(r, 800));
      
      setCurrentStep(3);
      
      const apiCall = diseaseType === 'pneumonia' ? diagnosePneumonia : diagnoseTumor;
      const data = await apiCall(selectedImage, threshold);
      
      setCurrentStep(4);
      setResult(data);

      // Save to History
      const historyItem = {
        id: uuidv4(),
        timestamp: Date.now(),
        diseaseType,
        prediction: data.prediction,
        confidence: (data.confidence * 100).toFixed(1),
        is_positive: data.is_positive,
        imageThumbnail: data.images.original,
        modelScores: data.model_scores
      };
      
      const existingHistory = JSON.parse(localStorage.getItem('diagnosis_history') || '[]');
      localStorage.setItem('diagnosis_history', JSON.stringify([historyItem, ...existingHistory].slice(0, 50)));

    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || "An error occurred during analysis. Check your backend connection.";
      setError(errorMsg);
      setCurrentStep(0);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div 
      ref={containerRef}
      className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto diagnose-bg"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
    >
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display">Diagnostic Suite</h1>
        <p className="text-med-muted max-w-2xl mx-auto text-lg">
          Clinical-grade analysis powered by EfficientNetB3 & Ensemble Learning.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar */}
        <div className={`${(result || isProcessing) ? 'lg:col-span-4' : 'lg:col-span-6 lg:col-start-4'} transition-all duration-700 space-y-6`}>
          
          <div className="glass-panel p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-med-teal/20 flex items-center justify-center text-med-teal">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold">1. Configuration</h3>
            </div>

            <div className="space-y-4 mb-10">
              {['pneumonia', 'tumor'].map((type) => (
                <button
                  key={type}
                  onClick={() => !isProcessing && setDiseaseType(type)}
                  className={`w-full flex items-center p-5 rounded-2xl border transition-all duration-300 ${
                    diseaseType === type 
                    ? 'bg-med-teal/10 border-med-teal text-white shadow-[0_0_20px_rgba(0,180,216,0.15)]' 
                    : 'bg-med-navy/50 border-white/5 text-med-muted hover:border-white/20'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full mr-4 ${diseaseType === type ? 'bg-med-teal animate-pulse' : 'bg-med-mid'}`} />
                  <div className="text-left">
                    <div className="font-bold uppercase tracking-widest text-xs mb-1">
                      {type === 'pneumonia' ? 'Chest X-Ray' : 'Brain MRI'}
                    </div>
                    <div className="text-sm font-medium">
                      {type === 'pneumonia' ? 'Pneumonia Detection' : 'Tumor Classification'}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Threshold Slider */}
            <div className="pt-6 border-t border-white/5">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-bold text-med-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-med-amber" />
                  Sensitivity Threshold
                </label>
                <span className="text-xs font-mono bg-med-mid px-2 py-1 rounded text-med-teal">
                  {threshold.toFixed(2)}
                </span>
              </div>
              <input 
                type="range" 
                min={0.3} max={0.8} step={0.01}
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="w-full accent-med-teal bg-med-navy rounded-lg appearance-none cursor-pointer h-1.5 mb-2"
                disabled={isProcessing}
              />
              <div className="flex justify-between text-[10px] text-med-muted font-bold uppercase tracking-tighter">
                <span>High Sensitivity</span>
                <span>Balanced</span>
                <span>High Specificity</span>
              </div>
            </div>
          </div>

          <div className="glass-panel p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-med-teal/20 flex items-center justify-center text-med-teal">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold">2. Scan Upload</h3>
              </div>
              
              <div className="flex gap-2">
                {SAMPLES[diseaseType].map((s, i) => (
                  <button 
                    key={i}
                    onClick={() => loadSample(s.url)}
                    className="px-3 py-1.5 rounded-lg bg-med-mid border border-white/10 text-[10px] font-bold uppercase tracking-wider hover:bg-med-teal/10 hover:border-med-teal/40 transition-all"
                    title={`Load ${s.name}`}
                  >
                    Sample {i+1}
                  </button>
                ))}
              </div>
            </div>

            <UploadZone 
              onUpload={handleUpload} 
              isLoading={isProcessing} 
              selectedImage={selectedImage} 
            />

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-med-red/10 border border-med-red/30 rounded-xl text-med-red text-xs font-medium"
              >
                {error}
              </motion.div>
            )}

            <button
              onClick={handleRunDiagnosis}
              disabled={!selectedImage || isProcessing}
              className="medical-btn w-full mt-8"
            >
              <span className="flex items-center justify-center gap-2">
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Analyzing Neural Path...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    Initiate Diagnosis
                  </>
                )}
              </span>
            </button>
          </div>
        </div>

        {/* Right Panel */}
        <AnimatePresence>
          {(isProcessing || result) && (
            <motion.div 
              className="lg:col-span-8 space-y-6"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 100 }}
            >
              <div className="glass-panel p-8">
                <ProgressStepper steps={STEPS} currentStep={currentStep} />
              </div>
              
              {result && (
                <ResultsPanel result={result} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
