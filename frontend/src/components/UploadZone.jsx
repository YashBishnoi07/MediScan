import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Image as ImageIcon, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export default function UploadZone({ onUpload, isLoading, selectedImage }) {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles[0]);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
    maxFiles: 1,
    disabled: isLoading
  });

  return (
    <div className="w-full">
      <div 
        {...getRootProps()} 
        className={`relative overflow-hidden rounded-[2rem] border-2 border-dashed transition-all duration-500 p-10 lg:p-14 text-center cursor-pointer 
          ${isDragActive ? 'border-med-teal bg-med-teal/10 shadow-[0_0_30px_rgba(0,180,216,0.1)]' : 'border-white/10 bg-med-dark/30 hover:bg-med-dark/50 hover:border-white/20'}
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {selectedImage ? (
          <div className="flex flex-col items-center">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-full max-w-[240px] aspect-square mb-6 rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            >
              <img src={URL.createObjectURL(selectedImage)} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-med-navy/80 to-transparent" />
              <div className="absolute bottom-3 left-3 flex items-center text-[10px] font-bold text-white/90 uppercase tracking-widest">
                <FileText className="w-3 h-3 mr-2 text-med-teal" />
                {selectedImage.name.length > 20 ? selectedImage.name.substring(0, 20) + '...' : selectedImage.name}
              </div>
            </motion.div>
            {!isLoading && (
              <p className="text-xs font-bold text-med-muted uppercase tracking-[0.2em] hover:text-med-teal transition-colors">
                Tap to change image
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className={`w-16 h-16 rounded-2xl mb-8 flex items-center justify-center transition-all duration-500 ${isDragActive ? 'bg-med-teal text-med-navy' : 'bg-med-navy text-med-teal border border-med-teal/20'}`}>
              <UploadCloud className={`w-8 h-8 ${isDragActive ? 'animate-bounce' : ''}`} />
            </div>
            <h3 className="text-2xl font-bold font-display text-white mb-3">
              {isDragActive ? 'Drop it here' : 'Upload Medical Scan'}
            </h3>
            <p className="text-med-muted mb-10 text-sm max-w-[200px] mx-auto leading-relaxed">
              Drag and drop your scan or click to browse.
            </p>
            <div className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-med-white group-hover:bg-white/10 transition-all">
              Choose File
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
