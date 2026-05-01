import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { pageVariants, staggerContainer } from '../animations/pageTransitions';
import ModelCard from '../components/ModelCard';
import { getModelMetrics } from '../api/diagnosisApi';
import { Loader2, Database, Code, BrainCircuit } from 'lucide-react';

export default function ModelsPage() {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

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
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Model Architecture & Performance</h1>
        <p className="text-gray-400 text-lg">
          Our system utilizes an ensemble approach. A Convolutional Neural Network acts as the primary feature extractor and classifier, while Classical ML models provide secondary verification.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="glass p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-medical-500/20 text-medical-400 rounded-lg"><Database className="w-6 h-6" /></div>
          <div>
            <div className="text-2xl font-bold">12,000+</div>
            <div className="text-sm text-gray-500 uppercase tracking-wide">Training Scans</div>
          </div>
        </div>
        <div className="glass p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-purple-500/20 text-purple-400 rounded-lg"><BrainCircuit className="w-6 h-6" /></div>
          <div>
            <div className="text-2xl font-bold">5</div>
            <div className="text-sm text-gray-500 uppercase tracking-wide">Ensemble Models</div>
          </div>
        </div>
        <div className="glass p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-teal-500/20 text-teal-400 rounded-lg"><Code className="w-6 h-6" /></div>
          <div>
            <div className="text-2xl font-bold">ResNet-50 / VGG</div>
            <div className="text-sm text-gray-500 uppercase tracking-wide">Base Architecture</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-medical-500" />
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {metrics.map((model) => (
            <ModelCard key={model.id} model={model} isFeatured={model.id === 'cnn'} />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
