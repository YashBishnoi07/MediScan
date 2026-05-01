import { motion } from 'framer-motion';
import { pageVariants, staggerContainer, cardVariants } from '../animations/pageTransitions';
import { Github, Linkedin, Mail } from 'lucide-react';

const TEAM = [
  {
    name: "Yash Bishnoi",
    role: "Lead ML Engineer",
    image: "/yash_real.jpg",
    bio: "Specializes in computer vision and deep learning architectures for medical imaging.",
    links: {
      github: "https://github.com/YashBishnoi07",
      linkedin: "https://www.linkedin.com/in/yashbishnoi07/",
      email: "mailto:yashbishnoi.yb7@gmail.com"
    }
  },
  {
    name: "Siddhant Shaurya",
    role: "Frontend Developer",
    image: null,
    bio: "Creates intuitive, performant user interfaces with React and Framer Motion.",
    links: {
      github: "#",
      linkedin: "#",
      email: "#"
    }
  },
  {
    name: "Bhumika Jain",
    role: "Backend Architect",
    image: null,
    bio: "Builds scalable Python microservices using FastAPI and Docker.",
    links: {
      github: "#",
      linkedin: "#",
      email: "#"
    }
  }
];

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

      <div className="mb-32">
        <h2 className="text-3xl font-bold text-center mb-16 font-display">The Core Team</h2>
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {TEAM.map((member, idx) => (
            <motion.div key={idx} variants={cardVariants} className="glass-card p-8 text-center group">
              {member.image ? (
                <div className="relative w-48 h-64 mx-auto mb-8 overflow-hidden rounded-2xl border border-white/10 group-hover:border-med-teal/50 transition-all duration-500 shadow-2xl">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-med-teal/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              ) : (
                <div className="relative w-48 h-64 mx-auto mb-8 rounded-2xl border border-white/10 group-hover:border-med-teal/50 bg-med-mid flex items-center justify-center transition-all duration-500 shadow-2xl">
                  <span className="text-4xl font-display font-bold text-med-muted group-hover:text-med-teal transition-colors">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
              )}
              <h3 className="text-2xl font-bold mb-2 font-display">{member.name}</h3>
              <p className="text-med-teal-lt text-xs font-bold uppercase tracking-[0.2em] mb-6">{member.role}</p>
              <p className="text-med-muted text-sm leading-relaxed mb-8">{member.bio}</p>
              <div className="flex justify-center gap-6 text-med-muted">
                <a href={member.links.github} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  <Github className="w-5 h-5" />
                </a>
                <a href={member.links.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-med-teal transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href={member.links.email} className="hover:text-med-red transition-colors">
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>
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
