import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ChevronDown, ChevronUp } from 'lucide-react';

const FIELDS = [
  { name: 'patientName',  label: 'Patient Name',   type: 'text',   required: true,  placeholder: 'e.g. John Doe' },
  { name: 'age',          label: 'Age',             type: 'number', required: true,  placeholder: 'Years' },
  { name: 'gender',       label: 'Gender',          type: 'select', 
    options: ['Male', 'Female', 'Other'],              required: true  },
  { name: 'symptoms',     label: 'Symptoms',        type: 'textarea', required: false, placeholder: 'Describe current symptoms...' },
  { name: 'doctorName',   label: "Doctor's Name",   type: 'text',   required: false, placeholder: 'Referring physician' },
  { name: 'hospitalName', label: 'Hospital / Clinic', type: 'text',  required: false, placeholder: 'Facility name' },
];

const PatientForm = ({ patientInfo, setPatientInfo }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPatientInfo(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-10">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full glass-card p-4 flex items-center justify-between hover:bg-white/5 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-med-teal/10 flex items-center justify-center text-med-teal group-hover:bg-med-teal/20 transition-all">
            <User size={20} />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-med-white tracking-tight">Patient Information</h3>
            <p className="text-med-muted text-xs">Recommended for clinical reports (Optional)</p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="text-med-muted" /> : <ChevronDown className="text-med-muted" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card mt-2 p-8 border border-white/5 bg-white/5 backdrop-blur-xl rounded-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {FIELDS.map((field) => (
                  <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                    <label className="block text-med-teal-lt text-[10px] font-bold uppercase tracking-[0.2em] mb-2 px-1">
                      {field.label} {field.required && <span className="text-med-red">*</span>}
                    </label>
                    
                    {field.type === 'select' ? (
                      <select
                        name={field.name}
                        value={patientInfo[field.name] || ''}
                        onChange={handleChange}
                        className="w-full bg-med-dark border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-med-teal outline-none transition-all appearance-none cursor-pointer"
                        required={field.required}
                      >
                        <option value="" disabled>Select Gender</option>
                        {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        name={field.name}
                        value={patientInfo[field.name] || ''}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        rows="3"
                        className="w-full bg-med-dark border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-med-teal outline-none transition-all resize-none"
                        required={field.required}
                      />
                    ) : (
                      <input
                        type={field.type}
                        name={field.name}
                        value={patientInfo[field.name] || ''}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        className="w-full bg-med-dark border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-med-teal outline-none transition-all"
                        required={field.required}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PatientForm;
