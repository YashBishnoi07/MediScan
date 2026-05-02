import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Trash2, Download, Database, User, ChevronRight, Activity, 
  BarChart3, FileText, CheckCircle2, AlertCircle
} from 'lucide-react';
import { pageVariants, staggerContainer, cardVariants } from '../animations/pageTransitions';
import { getHistory, deleteEntry, clearHistory, exportAsCSV } from '../utils/historyService';
import ResultsPanel from '../components/ResultsPanel';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      try {
        const data = getHistory();
        setHistory(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("History load failed:", e);
        setHistory([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Tiny delay to prevent flicker if component is re-mounting rapidly
    const timer = setTimeout(loadData, 50);
    return () => clearTimeout(timer);
  }, []);

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (window.confirm('Delete record?')) {
      const updated = deleteEntry(id);
      setHistory(updated);
    }
  };

  const filteredHistory = history.filter(entry => {
    if (!entry) return false;
    const name = (entry.patientName || 'Anonymous').toLowerCase();
    const matchesSearch = name.includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || entry.diseaseType === filterType;
    return matchesSearch && matchesType;
  });

  const stats = {
    total: history.length,
    pneu: history.filter(h => h?.diseaseType === 'pneumonia').length,
    tumor: history.filter(h => h?.diseaseType === 'tumor').length,
    conf: history.length > 0 
      ? ((history.reduce((acc, curr) => acc + (curr?.confidence || 0), 0) / history.length) * 100).toFixed(1)
      : 0
  };

  if (isLoading) {
    return <div className="min-h-screen bg-med-navy flex items-center justify-center"><Activity className="animate-spin text-med-teal" /></div>;
  }

  return (
    <div className="min-h-screen bg-med-navy pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto text-white">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl font-bold font-display mb-2">Scan Registry</h1>
            <p className="text-med-muted text-sm">Historical diagnostic archives.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={exportAsCSV} className="p-3 bg-white/5 rounded-xl text-med-teal hover:bg-med-teal/10 transition-all"><Download size={20} /></button>
            <button onClick={() => { if(window.confirm('Clear all?')){ clearHistory(); setHistory([]); } }} className="p-3 bg-white/5 rounded-xl text-med-red hover:bg-med-red/10 transition-all"><Trash2 size={20} /></button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatBox label="Total" value={stats.total} color="text-med-teal" />
          <StatBox label="Pneumonia" value={stats.pneu} color="text-med-amber" />
          <StatBox label="Tumors" value={stats.tumor} color="text-med-red" />
          <StatBox label="Avg. Conf." value={`${stats.conf}%`} color="text-med-teal-lt" />
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-10">
          <div className="flex-1 bg-white/5 rounded-2xl border border-white/10 px-5 py-3 flex items-center gap-3">
            <Search size={18} className="text-med-muted" />
            <input 
              type="text" placeholder="Search patients..." 
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-sm font-medium"
            />
          </div>
          <select 
            value={filterType} onChange={e => setFilterType(e.target.value)}
            className="bg-med-dark border border-white/10 rounded-2xl px-6 py-3 text-sm outline-none cursor-pointer hover:border-med-teal/50 transition-all"
          >
            <option value="all">All Modalities</option>
            <option value="pneumonia">Chest X-Ray</option>
            <option value="tumor">Brain MRI</option>
          </select>
        </div>

        {/* Grid */}
        {filteredHistory.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredHistory.map(entry => {
              if (!entry) return null;
              const isPos = entry.prediction && !['NORMAL', 'notumor', 'no_tumor'].includes(entry.prediction);
              const thumb = entry.imageThumbnail || entry.fullResults?.images?.original;

              return (
                <div 
                  key={entry.id} 
                  onClick={() => setSelectedEntry(entry)}
                  className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden cursor-pointer hover:border-med-teal/40 transition-all group shadow-xl"
                >
                  <div className="h-44 bg-med-mid/10 relative">
                    {thumb ? (
                      <img src={thumb} alt="Scan" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all duration-500" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-med-muted gap-2">
                        <FileText size={32} className="opacity-20" />
                        <span className="text-[10px] font-bold tracking-widest">NO PREVIEW</span>
                      </div>
                    )}
                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${isPos ? 'bg-med-red/20 text-med-red border border-med-red/30' : 'bg-med-teal/20 text-med-teal border border-med-teal/30'}`}>
                      {entry.prediction}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-xl mb-1 group-hover:text-med-teal transition-colors truncate">{entry.patientName}</h3>
                    <div className="flex justify-between items-center text-[11px] text-med-muted font-bold uppercase tracking-widest mt-2">
                      <span>{entry.diseaseType}</span>
                      <span className="text-white">{((entry.confidence || 0) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-32 text-center bg-white/5 rounded-[3rem] border border-dashed border-white/10">
            <FileText size={64} className="mx-auto mb-6 text-med-muted opacity-10" />
            <h3 className="text-xl font-bold text-white mb-2">Registry Empty</h3>
            <p className="text-med-muted text-sm">Archived records will appear here.</p>
          </div>
        )}
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {selectedEntry && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8 bg-med-navy/98 backdrop-blur-md"
          >
            <div className="relative w-full max-w-6xl max-h-[92vh] overflow-y-auto bg-med-navy border border-white/10 rounded-[2.5rem] p-8 sm:p-12 shadow-[0_0_100px_rgba(0,0,0,0.8)]">
              <div className="flex justify-between items-start mb-10 border-b border-white/5 pb-8">
                <div>
                  <h2 className="text-4xl font-bold font-display">{selectedEntry.patientName}</h2>
                  <p className="text-xs text-med-muted uppercase tracking-[0.3em] mt-3 font-bold">Historical Diagnosis Archive • {selectedEntry.id}</p>
                </div>
                <button onClick={() => setSelectedEntry(null)} className="px-8 py-3 bg-white/5 rounded-2xl text-xs font-bold hover:bg-white/10 border border-white/10 tracking-widest">CLOSE REPORT</button>
              </div>
              <ResultsPanel result={selectedEntry.fullResults} patientInfo={selectedEntry.patientInfo} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 shadow-lg">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-med-muted">{label}</span>
      <div className={`text-3xl font-bold font-display mt-1 ${color}`}>{value}</div>
    </div>
  );
}
