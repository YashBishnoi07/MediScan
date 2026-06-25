import { motion } from 'framer-motion';
import { pageVariants, staggerContainer, cardVariants } from '../animations/pageTransitions';
import { Github, Linkedin, Mail } from 'lucide-react';



const TECH_STACK = [
  { category: "Frontend", items: ["React 18", "Vite", "TailwindCSS", "Framer Motion", "GSAP", "Three.js"] },
  { category: "Backend", items: ["FastAPI", "Python 3.10", "Uvicorn", "Pydantic"] },
  { category: "Machine Learning", items: ["EfficientNetB3", "TensorFlow", "Scikit-Learn", "SHAP", "OpenCV"] },
  { category: "Infrastructure", items: ["Docker", "Docker Compose", "Vercel", "Git"] }
];

export default function AboutPage() {
  return (
    <motion.div 
      className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
    >
      <div className="text-center mb-24 max-w-3xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold mb-8 font-display">Engineering Excellence</h1>
        <p className="text-med-muted text-lg leading-relaxed">
          The Automated Disease Diagnosis System was built to bridge the gap between advanced deep learning research and clinical utility. 
          By combining transfer learning with explainable AI, we provide tools that clinicians can trust.
        </p>
      </div>

      <div className="mb-32 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8 font-display text-med-red">Disclaimer</h2>
        <div className="glass-card p-8 border-l-4 border-l-med-red bg-med-red/5">
          <p className="text-med-muted text-lg leading-relaxed mb-6">
            <strong className="text-med-white">This is a personal project developed for educational and research purposes.</strong>
          </p>
          <p className="text-med-muted leading-relaxed mb-6">
            The deep learning models and predictions provided by this Automated Disease Diagnosis System are experimental and 
            <strong className="text-med-red-lt"> do not guarantee 100% accuracy.</strong> They are not intended to be a substitute for professional medical advice, 
            diagnosis, or treatment.
          </p>
          <p className="text-med-muted leading-relaxed">
            Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. 
            Never disregard professional medical advice or delay in seeking it because of something you have read or processed on this platform.
          </p>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-0 bg-med-teal/5 blur-[120px] rounded-full" />
        <h2 className="text-3xl font-bold text-center mb-16 font-display relative z-10">Technology Ecosystem</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {TECH_STACK.map((stack, idx) => (
            <div key={idx} className="glass-panel p-8 hover:bg-white/5 transition-colors group">
              <h3 className="text-sm font-bold text-med-teal-lt mb-6 border-b border-white/5 pb-4 uppercase tracking-widest">{stack.category}</h3>
              <ul className="space-y-3">
                {stack.items.map((item, i) => (
                  <li key={i} className="flex items-center text-med-muted text-sm font-medium group-hover:text-med-white transition-colors">
                    <div className="w-1.5 h-1.5 bg-med-teal rounded-full mr-3 opacity-50" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
