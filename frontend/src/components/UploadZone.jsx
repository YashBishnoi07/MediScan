import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';
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
        className={`relative overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300 p-8 sm:p-12 text-center cursor-pointer 
          ${isDragActive ? 'border-medical-400 bg-medical-500/10' : 'border-gray-600 bg-dark-800/30 hover:bg-dark-800/50 hover:border-gray-500'}
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {/* Pulsing ring when dragging */}
        {isDragActive && (
          <motion.div 
            className="absolute inset-0 border-2 border-medical-500 rounded-3xl"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ repeat: Infinity, duration: 1.5, repeatType: 'reverse' }}
          />
        )}

        {selectedImage ? (
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-48 mb-4 rounded-xl overflow-hidden shadow-2xl border border-white/10">
              <img src={URL.createObjectURL(selectedImage)} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-2 left-2 flex items-center text-xs font-medium text-white/80">
                <ImageIcon className="w-3 h-3 mr-1" />
                {selectedImage.name}
              </div>
            </div>
            {!isLoading && (
              <p className="text-sm text-gray-400 mt-2 hover:text-white transition-colors">
                Click or drag to choose a different image
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className={`p-4 rounded-full mb-6 ${isDragActive ? 'bg-medical-500 text-white' : 'bg-dark-700 text-gray-400'} transition-colors`}>
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {isDragActive ? 'Drop your scan here' : 'Drag & drop a medical scan'}
            </h3>
            <p className="text-gray-400 mb-6 text-sm max-w-sm mx-auto">
              Support for JPEG, JPG, and PNG files up to 10MB.
            </p>
            <button 
              className="px-6 py-2.5 rounded-full bg-white/5 border border-white/10 font-medium hover:bg-white/10 transition-colors"
              onClick={(e) => e.preventDefault()} // dropzone handles the click
            >
              Browse Files
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
