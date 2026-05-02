// frontend/src/utils/historyService.js
const HISTORY_KEY = 'diagnosis_history';

// Helper to resize base64 images to save space
const compressImage = (base64, maxWidth = 400) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.7)); // 70% quality jpeg
    };
    img.onerror = () => resolve(null);
  });
};

export const saveToHistory = async (diagnosisData, patientInfo, diseaseType) => {
  // Compress images to avoid localStorage quota issues
  const originalSmall = diagnosisData.images?.original ? await compressImage(diagnosisData.images.original, 400) : null;
  const heatmapSmall = diagnosisData.images?.heatmap ? await compressImage(diagnosisData.images.heatmap, 400) : null;

  const sanitizedResults = { ...diagnosisData };
  sanitizedResults.images = {
    original: originalSmall,
    heatmap: heatmapSmall,
    segmented: null // Don't save segmented in history to save more space
  };

  const entry = {
    id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2),
    timestamp: Date.now(),
    diseaseType,
    patientName: (patientInfo?.patientName || 'Anonymous').trim() || 'Anonymous',
    prediction: diagnosisData.prediction || 'UNKNOWN',
    confidence: diagnosisData.confidence || 0,
    ensemblePrediction: diagnosisData.ensemble_result?.ensemble_prediction || 'N/A',
    imageThumbnail: originalSmall,
    fullResults: sanitizedResults,
    patientInfo: patientInfo || {}
  };
  
  try {
    const existing = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    existing.unshift(entry);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(existing.slice(0, 40)));
  } catch (err) {
    console.error("Storage Error:", err);
    // If still failing, keep only 10 most recent
    const existing = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    localStorage.setItem(HISTORY_KEY, JSON.stringify(existing.slice(0, 10)));
  }
  return entry;
};

export const getHistory = () => {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch (e) {
    return [];
  }
};

export const deleteEntry = (id) => {
  const h = getHistory().filter(e => e.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
  return h;
};

export const clearHistory = () => {
  localStorage.removeItem(HISTORY_KEY);
};

export const exportAsCSV = () => {
  const h = getHistory();
  if (h.length === 0) return;
  
  const headers = 'ID,Date,Patient,Disease Type,CNN Prediction,Confidence,Ensemble Prediction\n';
  const rows = h.map(e => 
    `${e.id},${new Date(e.timestamp).toLocaleString()},` +
    `"${e.patientName}",${e.diseaseType},${e.prediction},` +
    `${e.confidence}%,${e.ensemblePrediction}`
  ).join('\n');
  
  const blob = new Blob([headers + rows], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); 
  a.href = url; 
  a.download = `diagnosis_history_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
