import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Search, Calendar, FileText, ChevronRight } from 'lucide-react';
import { pageVariants, staggerContainer, cardVariants } from '../animations/pageTransitions';
import { Link } from 'react-router-dom';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('diagnosis_history');
    if (saved) {
      setHistory(JSON.parse(saved).sort((a, b) => b.timestamp - a.timestamp));
    }
  }, []);

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear all history?")) {
      localStorage.removeItem('diagnosis_history');
      setHistory([]);
    }
  };

  const filteredHistory = history.filter(item => 
    item.diseaseType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.prediction.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-bold mb-2 font-display">Scan History</h1>
          <p className="text-med-muted">Review and manage your past diagnostic analyses.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-med-muted" />
            <input 
              type="text" 
              placeholder="Search history..."
              className="pl-10 pr-4 py-2 bg-med-dark/50 border border-white/10 rounded-xl focus:border-med-teal/50 outline-none transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={clearHistory}
            className="p-2 text-med-muted hover:text-med-red transition-colors"
            title="Clear all history"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {filteredHistory.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {filteredHistory.map((item, idx) => (
            <motion.div 
              key={item.id || idx} 
              variants={cardVariants}
              className="glass-card overflow-hidden group"
            >
              <div className="h-40 relative">
                <img src={item.imageThumbnail} alt="Scan" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  item.is_positive ? 'bg-med-red/20 text-med-red border border-med-red/30' : 'bg-med-green/20 text-med-green border border-med-green/30'
                }`}>
                  {item.prediction}
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-med-muted flex items-center gap-1 uppercase tracking-widest font-bold">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                  <span className="text-med-teal-lt text-sm font-bold">
                    {item.confidence}% Confidence
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-6 capitalize">{item.diseaseType} Analysis</h3>
                
                <div className="flex gap-3">
                  <Link 
                    to={`/diagnose?historyId=${item.id}`}
                    className="flex-1 py-2 rounded-lg bg-med-mid border border-white/10 text-center text-sm font-bold hover:bg-med-teal/10 hover:border-med-teal/30 transition-all flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Full Report
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="glass-panel p-20 text-center">
          <FileText className="w-16 h-16 text-med-mid mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-2">No history found</h2>
          <p className="text-med-muted mb-8">You haven't performed any scans yet or your history was cleared.</p>
          <Link to="/diagnose" className="medical-btn">Start Your First Scan</Link>
        </div>
      )}
    </motion.div>
  );
}
