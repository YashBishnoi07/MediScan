import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HeatmapOverlay({ original, segmented, heatmap }) {
  const [activeTab, setActiveTab] = useState('heatmap');

  const tabs = [
    { id: 'original', label: 'Original Scan' },
    { id: 'segmented', label: 'Segmented' },
    { id: 'heatmap', label: 'Grad-CAM' }
  ];

  const images = { original, segmented, heatmap };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex gap-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors relative ${
              activeTab === tab.id ? 'text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-medical-600 rounded-full"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="relative flex-1 rounded-xl overflow-hidden bg-dark-900 border border-white/10 group min-h-[300px]">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeTab}
            src={images[activeTab]}
            alt={activeTab}
            className="absolute inset-0 w-full h-full object-contain"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
        </AnimatePresence>
      </div>
    </div>
  );
}
