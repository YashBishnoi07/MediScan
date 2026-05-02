// frontend/src/utils/imageQualityChecker.js
export const checkImageQuality = (file) => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const issues = [];
      const warnings = [];
      
      // Size check
      if (img.width < 150 || img.height < 150)
        issues.push('Image resolution too low (min 150×150 px)');
      
      // Aspect ratio check
      const ratio = img.width / img.height;
      if (ratio < 0.5 || ratio > 2.5)
        warnings.push('Unusual aspect ratio — ensure this is a medical scan');
      
      // File size check
      if (file.size > 15 * 1024 * 1024)
        warnings.push('Large file size may slow diagnosis');
      if (file.size < 5 * 1024)
        issues.push('File too small — may not be a valid scan');
      
      // Format check
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/dicom'];
      if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.dicom'))
        warnings.push('Recommended formats: JPEG or PNG');
      
      // Canvas-based brightness check
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width; canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, img.width, img.height).data;
      let brightness = 0;
      for (let i = 0; i < data.length; i += 4)
        brightness += (data[i] + data[i+1] + data[i+2]) / 3;
      brightness /= (data.length / 4);
      
      if (brightness < 15)
        issues.push('Image appears too dark — may affect accuracy');
      if (brightness > 240)
        issues.push('Image appears overexposed — may affect accuracy');
      
      const score = issues.length === 0 && warnings.length === 0 ? 'good' :
                    issues.length > 0 ? 'poor' : 'fair';
      
      URL.revokeObjectURL(url);
      resolve({ score, issues, warnings, brightness: Math.round(brightness) });
    };
    img.onerror = () => {
      resolve({ score: 'poor', issues: ['Could not read image file'], warnings: [], brightness: 0 });
    };
    img.src = url;
  });
};
