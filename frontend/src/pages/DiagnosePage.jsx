import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Info, Play, RefreshCw, Layers, Zap, Database, Download, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { pageVariants } from '../animations/pageTransitions';
import UploadZone from '../components/UploadZone';
import ResultsPanel from '../components/ResultsPanel';
import PatientForm from '../components/PatientForm';
import ProcessingSteps from '../components/ProcessingSteps';
import ThresholdSlider from '../components/ThresholdSlider';
import { diagnosePneumonia, diagnoseTumor } from '../api/diagnosisApi';
import { checkImageQuality } from '../utils/imageQualityChecker';
import { saveToHistory } from '../utils/historyService';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [threshold, setThreshold] = useState(0.5);
  const [patientInfo, setPatientInfo] = useState({
    patientName: '', age: '', gender: '', symptoms: '', doctorName: '', hospitalName: ''
  });
  const [imageQuality, setImageQuality] = useState(null);

  const handleUpload = async (file) => {
    setSelectedImage(file);
    setResult(null);
    setError(null);
    const quality = await checkImageQuality(file);
    setImageQuality(quality);
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
      const apiCall = diseaseType === 'pneumonia' ? diagnosePneumonia : diagnoseTumor;
      const data = await apiCall(selectedImage, threshold);
      setResult(data);
      await saveToHistory(data, patientInfo, diseaseType);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Analysis failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div 
      className="min-h-screen pt-28 pb-20 px-4 md:px-8 max-w-[1600px] mx-auto"
      initial="initial" animate="in" exit="out" variants={pageVariants}
    >
      {/* 1. Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
        <div className="max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 font-display text-white tracking-tight">
            Diagnostic <span className="text-med-teal">Suite</span>
          </h1>
          <p className="text-med-muted text-lg md:text-xl font-light leading-relaxed">
            Upload a clinical scan for instant AI-driven analysis and explainable reports.
          </p>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={() => { setSelectedImage(null); setResult(null); setImageQuality(null); }}
            className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-med-muted hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 font-bold text-sm"
          >
            <Trash2 size={18} /> Clear Session
          </button>
        </div>
      </div>

      {/* 2. Patient Information (Always Visible, Collapsible) */}
      <div className="mb-12">
        <PatientForm patientInfo={patientInfo} setPatientInfo={setPatientInfo} />
      </div>

      {/* 3. Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* SIDEBAR: Configuration & Upload (4 Columns) */}
        <aside className="lg:col-span-4 space-y-8">
          
          {/* Card: Modality Selection */}
          <div className="glass-panel p-8">
            <h3 className="text-sm font-bold text-med-teal uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Layers size={16} /> 1. Select Modality
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {['pneumonia', 'tumor'].map((type) => (
                <button
                  key={type}
                  onClick={() => !isProcessing && setDiseaseType(type)}
                  className={`flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 ${
                    diseaseType === type 
                    ? 'bg-med-teal/10 border-med-teal text-white shadow-[0_0_30px_rgba(0,180,216,0.15)]' 
                    : 'bg-med-navy/50 border-white/5 text-med-muted hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${diseaseType === type ? 'bg-med-teal animate-pulse' : 'bg-med-mid'}`} />
                    <div className="text-left">
                      <div className="font-bold text-sm">{type === 'pneumonia' ? 'Chest X-Ray' : 'Brain MRI'}</div>
                      <div className="text-[10px] uppercase opacity-60 tracking-widest">{type === 'pneumonia' ? 'Pneumonia' : 'Tumors'}</div>
                    </div>
                  </div>
                  {diseaseType === type && <CheckCircle2 size={16} className="text-med-teal" />}
                </button>
              ))}
            </div>
          </div>

          {/* Card: Upload Zone */}
          <div className="glass-panel p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-med-teal uppercase tracking-[0.2em] flex items-center gap-2">
                <Database size={16} /> 2. Clinical Scan
              </h3>
              <div className="flex gap-2">
                {SAMPLES[diseaseType].map((s, i) => (
                  <button 
                    key={i}
                    onClick={() => loadSample(s.url)}
                    className="px-3 py-1 rounded-lg bg-med-mid border border-white/10 text-[9px] font-bold uppercase tracking-wider hover:bg-med-teal/10 hover:border-med-teal/40 transition-all text-med-muted hover:text-med-teal"
                  >
                    Sample {i+1}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative group rounded-2xl overflow-hidden border border-white/5">
              <UploadZone onUpload={handleUpload} isLoading={isProcessing} selectedImage={selectedImage} />
              {isProcessing && (
                <div className="absolute inset-0 bg-med-navy/40 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
                  <div className="scan-grid" />
                  <div className="scan-line" />
                </div>
              )}
            </div>

            {imageQuality && !isProcessing && (
              <div className={`mt-4 p-4 rounded-xl border flex items-center gap-3 ${
                imageQuality.score === 'good' ? 'bg-med-teal/5 border-med-teal/20 text-med-teal' :
                imageQuality.score === 'fair' ? 'bg-amber-400/5 border-amber-400/20 text-amber-400' :
                'bg-med-red/5 border-med-red/20 text-med-red'
              }`}>
                {imageQuality.score === 'good' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <div className="flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest">
                    Scan Quality: {imageQuality.score}
                  </p>
                  <p className="text-[9px] opacity-60">Brightness: {imageQuality.brightness} Lux</p>
                </div>
              </div>
            )}
          </div>

          {/* Card: Sensitivity Threshold */}
          <div className="glass-panel p-8">
            <h3 className="text-sm font-bold text-med-teal uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Zap size={16} /> 3. AI Threshold
            </h3>
            <ThresholdSlider threshold={threshold} setThreshold={setThreshold} />
            
            <button
              onClick={handleRunDiagnosis}
              disabled={!selectedImage || isProcessing}
              className="medical-btn w-full mt-8 py-5 text-lg"
            >
              <span className="flex items-center justify-center gap-3">
                {isProcessing ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Play className="w-6 h-6 fill-current" />}
                {isProcessing ? 'Analyzing...' : 'Run Diagnosis'}
              </span>
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT: Results & Analysis (8 Columns) */}
        <main className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {isProcessing ? (
              <motion.div 
                key="processing"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                className="glass-panel p-12 text-center"
              >
                <ProcessingSteps isProcessing={isProcessing} />
                <p className="mt-8 text-med-muted text-sm font-medium animate-pulse">
                  Applying convolutional kernels and ensemble voting logic...
                </p>
              </motion.div>
            ) : result ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="glass-panel p-10 flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold font-display text-white">Analysis Complete</h2>
                    <p className="text-med-muted mt-1">Foundations for clinical review are ready.</p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-med-teal/10 flex items-center justify-center text-med-teal border border-med-teal/20">
                    <CheckCircle2 size={32} />
                  </div>
                </div>
                
                <ResultsPanel result={result} patientInfo={patientInfo} />
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="glass-panel p-20 border-dashed border-white/5 flex flex-col items-center justify-center text-center h-full min-h-[500px]"
              >
                <div className="w-24 h-24 rounded-3xl bg-med-dark/50 flex items-center justify-center mb-8 border border-white/5">
                  <Layers size={48} className="text-med-teal/20" />
                </div>
                <h2 className="text-2xl font-bold text-med-white mb-4">Awaiting Clinical Data</h2>
                <p className="text-med-muted max-w-md mx-auto leading-relaxed">
                  Please select a modality and upload a medical scan in the sidebar to begin the automated diagnostic sequence.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-6 bg-med-red/10 border border-med-red/20 rounded-2xl text-med-red flex items-center gap-4"
            >
              <AlertCircle size={24} />
              <div>
                <p className="font-bold">Analysis Error</p>
                <p className="text-xs opacity-80">{error}</p>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </motion.div>
  );
}
