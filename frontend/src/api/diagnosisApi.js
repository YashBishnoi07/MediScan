import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
});

export async function diagnosePneumonia(imageFile, threshold = null) {
  const formData = new FormData();
  formData.append('file', imageFile);
  if (threshold !== null) formData.append('threshold', threshold);
  
  const res = await api.post('/api/diagnose/pneumonia', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
}

export async function diagnoseTumor(imageFile, threshold = null) {
  const formData = new FormData();
  formData.append('file', imageFile);
  if (threshold !== null) formData.append('threshold', threshold);
  
  const res = await api.post('/api/diagnose/tumor', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
}

export async function getModelMetrics() {
  const res = await api.get('/api/models/metrics');
  return res.data;
}

export async function checkHealth() {
  const res = await api.get('/api/health');
  return res.data;
}
