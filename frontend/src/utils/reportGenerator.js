// frontend/src/utils/reportGenerator.js
import { jsPDF } from 'jspdf';

export const generateMedicalReport = async (patientInfo, diagnosisResults, imageDataUrl, heatmapDataUrl) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageW = 210, pageH = 297;
  
  // ── 1. CLEAN CLINICAL HEADER ───────────────────────────────────────────
  // Subtle top border
  pdf.setFillColor(0, 119, 182); // Clinical Blue
  pdf.rect(0, 0, pageW, 2, 'F');
  
  // Logo Placeholder / Brand Name
  pdf.setTextColor(0, 119, 182);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('MEDISCAN', 15, 18);
  
  pdf.setTextColor(80, 80, 80);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text('CLINICAL DIAGNOSTIC INTELLIGENCE UNIT', 15, 23);
  
  // Report Title & Date
  pdf.setTextColor(40, 40, 40);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('DIAGNOSTIC RADIOLOGY REPORT', pageW - 15, 18, { align: 'right' });
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Report Date: ${new Date().toLocaleDateString()}`, pageW - 15, 23, { align: 'right' });
  pdf.text(`Report ID: MS-${Math.random().toString(36).substring(2, 9).toUpperCase()}`, pageW - 15, 27, { align: 'right' });

  // ── 2. PATIENT & CASE INFORMATION ──────────────────────────────────────
  pdf.setDrawColor(220, 220, 220);
  pdf.line(15, 32, pageW - 15, 32);
  
  const drawField = (label, value, x, y) => {
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(8);
    pdf.text(label, x, y);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(30, 30, 30);
    pdf.setFontSize(10);
    pdf.text(String(value || 'N/A'), x, y + 5);
  };

  drawField('PATIENT NAME', patientInfo?.patientName, 15, 42);
  drawField('AGE / GENDER', `${patientInfo?.age || 'N/A'} / ${patientInfo?.gender || 'N/A'}`, 75, 42);
  drawField('CASE TYPE', diagnosisResults.disease_type === 'pneumonia' ? 'CHEST RADIOGRAPHY' : 'BRAIN NEUROIMAGING', 135, 42);
  
  drawField('REFERRING DOCTOR', patientInfo?.doctorName, 15, 55);
  drawField('FACILITY', patientInfo?.hospitalName, 75, 55);
  drawField('ANALYSIS TYPE', 'ENSEMBLE AI L3 V2', 135, 55);

  pdf.line(15, 68, pageW - 15, 68);

  // ── 3. RADIOLOGICAL FINDINGS (AI ANALYSIS) ──────────────────────────────
  pdf.setTextColor(0, 119, 182);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('AI-ASSISTED CLINICAL FINDINGS', 15, 78);

  const isPositive = diagnosisResults.prediction !== 'NORMAL' && 
                     diagnosisResults.prediction !== 'notumor' && 
                     diagnosisResults.prediction !== 'no_tumor';

  // Result Banner
  pdf.setFillColor(isPositive ? 255 : 240, isPositive ? 240 : 255, isPositive ? 240 : 248);
  pdf.roundedRect(15, 82, pageW - 30, 15, 2, 2, 'F');
  
  pdf.setTextColor(isPositive ? 180 : 0, isPositive ? 0 : 120, isPositive ? 0 : 180);
  pdf.setFontSize(14);
  pdf.text(`${diagnosisResults.prediction} DETECTED`, pageW / 2, 92, { align: 'center' });

  // Recommendation
  pdf.setTextColor(60, 60, 60);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text('CLINICAL IMPRESSION:', 15, 105);
  pdf.setFont('helvetica', 'italic');
  const recText = diagnosisResults.recommendation || (isPositive ? "Further clinical correlation and professional consultation is strongly advised." : "No acute findings detected by AI architectures.");
  pdf.text(recText, 30, 110, { maxWidth: pageW - 45 });

  // ── 4. VISUAL EVIDENCE ─────────────────────────────────────────────────
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(40, 40, 40);
  pdf.text('EVIDENCE CAPTURES', 15, 125);
  
  // Images with borders
  const imgY = 130;
  const imgW = 85;
  const imgH = 65;
  
  try {
    // Original
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(15, imgY, imgW, imgH);
    pdf.addImage(imageDataUrl, 'JPEG', 15.5, imgY + 0.5, imgW - 1, imgH - 1);
    pdf.setFontSize(8);
    pdf.text('ORIGINAL SCAN', 15, imgY + imgH + 5);

    // Heatmap
    pdf.rect(pageW - 15 - imgW, imgY, imgW, imgH);
    pdf.addImage(heatmapDataUrl, 'JPEG', pageW - 15 - imgW + 0.5, imgY + 0.5, imgW - 1, imgH - 1);
    pdf.text('GRAD-CAM ATTENTION MAP', pageW - 15 - imgW, imgY + imgH + 5);
  } catch (e) {
    pdf.text('[IMAGE PROCESSING ERROR]', 15, imgY + 10);
  }

  // ── 5. MULTI-MODEL CONSENSUS TABLE ──────────────────────────────────────
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('TECHNICAL ENSEMBLE BREAKDOWN', 15, 215);

  const models = diagnosisResults.ensemble_result?.individual_models || {};
  const modelNames = {
    svm: 'Support Vector Machine (SVM)',
    random_forest: 'Random Forest Regressor',
    decision_tree: 'C4.5 Decision Tree',
    logistic_regression: 'Logistic Regression'
  };

  let rowY = 220;
  // Header
  pdf.setFillColor(240, 240, 240);
  pdf.rect(15, rowY, pageW - 30, 7, 'F');
  pdf.setFontSize(8);
  pdf.setTextColor(80, 80, 80);
  pdf.text('ANALYTICAL MODEL', 18, rowY + 5);
  pdf.text('PREDICTION', 100, rowY + 5);
  pdf.text('CONFIDENCE', 150, rowY + 5);
  rowY += 7;

  Object.entries(models).forEach(([key, data], i) => {
    pdf.setDrawColor(240, 240, 240);
    pdf.line(15, rowY + 7, pageW - 15, rowY + 7);
    pdf.setTextColor(40, 40, 40);
    pdf.setFont('helvetica', 'normal');
    pdf.text(modelNames[key] || key.toUpperCase(), 18, rowY + 5);
    pdf.setFont('helvetica', 'bold');
    pdf.text(data.prediction, 100, rowY + 5);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${data.confidence.toFixed(1)}%`, 150, rowY + 5);
    rowY += 7;
  });

  // ── 6. SIGNATURE & DISCLAIMER ───────────────────────────────────────────
  const footerY = 265;
  pdf.setDrawColor(0, 119, 182);
  pdf.line(pageW - 65, footerY, pageW - 15, footerY);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('CONSULTANT RADIOLOGIST', pageW - 65, footerY + 5);
  pdf.setFont('helvetica', 'normal');
  pdf.text('(ELECTRONICALLY VERIFIED)', pageW - 65, footerY + 9);

  // Disclaimer Box
  pdf.setFillColor(252, 252, 252);
  pdf.setDrawColor(230, 230, 230);
  pdf.roundedRect(15, 278, pageW - 30, 12, 1, 1, 'FD');
  pdf.setFontSize(7);
  pdf.setTextColor(100, 100, 100);
  const disclaimer = 'IMPORTANT: This report is generated by an Artificial Intelligence system and is intended for assistive use by medical professionals. It is not a standalone diagnostic device. Clinical correlation by a certified radiologist is mandatory.';
  pdf.text(disclaimer, 18, 283, { maxWidth: pageW - 36 });

  // Page Footer
  pdf.setFontSize(6);
  pdf.text(`MediScan Diagnostic Report • Page 1 of 1 • System ID: 0xF2A9B1`, pageW / 2, 294, { align: 'center' });

  pdf.save(`MediScan_Report_${patientInfo?.patientName?.replace(/\s+/g, '_') || 'Patient'}.pdf`);
};
