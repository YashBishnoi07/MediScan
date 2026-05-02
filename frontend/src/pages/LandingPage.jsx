import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Activity, Brain, ShieldCheck, ChevronDown } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

import ParticleField from '../components/ParticleField';
import MarqueeStrip from '../components/MarqueeStrip';
import StatsCounter from '../components/StatsCounter';
import HowItWorks from '../components/HowItWorks';
import { pageVariants } from '../animations/pageTransitions';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const heroRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    // 1. Cinematic Text Reveal
    const split = new SplitType(titleRef.current, { types: 'lines,words' });
    
    gsap.fromTo(split.words, 
      { y: 100, opacity: 0, rotateX: -60 },
      { 
        y: 0, opacity: 1, rotateX: 0,
        duration: 1.2, 
        stagger: 0.05,
        ease: 'power4.out',
        delay: 0.5
      }
    );

    gsap.fromTo('.hero-subtitle',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, delay: 1.2, ease: 'power3.out' }
    );

    gsap.fromTo('.hero-cta',
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.8, delay: 1.5, ease: 'back.out(1.7)' }
    );

    // 2. Scroll-Triggered Reveal for Features
    gsap.fromTo('.feature-card', 
      { y: 60, opacity: 0 },
      { 
        y: 0, opacity: 1,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.features-grid',
          start: 'top 80%',
        }
      }
    );

    return () => {
      split.revert();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <motion.div 
      className="min-h-screen bg-med-navy selection:bg-med-teal/30"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
    >
      {/* Cinematic Hero */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <ParticleField />
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-block px-4 py-1 rounded-full border border-med-teal/30 bg-med-teal/5 text-med-teal-lt text-xs font-bold tracking-[0.3em] uppercase mb-8"
          >
            Intelligence in Every Pixel
          </motion.div>

          <h1 
            ref={titleRef}
            className="hero-title text-6xl md:text-8xl font-display font-bold leading-[1.1] mb-8 text-white reveal-text"
          >
            Precise Diagnosis <br/>
            <span className="text-med-teal">Superhuman Speed</span>
          </h1>

          <p className="hero-subtitle text-med-muted text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            Empowering healthcare with the world's most advanced deep learning ensemble for radiology. 
            Instant detection. Explainable results. Clinical confidence.
          </p>

          <div className="hero-cta flex flex-col md:flex-row items-center justify-center gap-6">
            <Link to="/diagnose" className="medical-btn group">
              <span className="relative z-10 flex items-center gap-2">
                Launch Diagnostic Hub
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link to="/about" className="text-med-white hover:text-med-teal font-bold transition-colors py-4 px-8 border border-white/10 rounded-xl hover:border-med-teal/50">
              Meet the Engineers
            </Link>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-20">
          <ChevronDown className="w-6 h-6" />
        </div>
      </section>

      {/* Marquee Strip */}
      <MarqueeStrip />

      {/* Stats Section */}
      <section className="py-32 container mx-auto px-6">
        <div className="glass-panel p-16 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <StatsCounter target={93.4} suffix="%" label="Validated Accuracy" decimals={1} />
          <StatsCounter target={2.8} suffix="s" label="Avg Analysis Time" decimals={1} />
          <StatsCounter target={1050} suffix="+" label="Scans Analyzed" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-40 bg-med-dark/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Built for Modern Clinicians</h2>
            <p className="text-med-muted max-w-2xl mx-auto text-lg">
              Our multi-layered architecture combines traditional medical expertise with next-generation neural networks.
            </p>
          </div>

          <div className="features-grid grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                title: "EfficientNetB3 Pipeline", 
                desc: "State-of-the-art transfer learning model optimized for subtle feature extraction in medical imagery.", 
                icon: <Activity className="w-8 h-8 text-med-teal" />,
                bg: "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&q=80"
              },
              { 
                title: "Explainable Heatmaps", 
                desc: "Full transparency through Grad-CAM localization, showing exactly where the AI identified anomalies.", 
                icon: <Brain className="w-8 h-8 text-med-teal-lt" />,
                bg: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&q=80"
              },
              { 
                title: "Ensemble Verification", 
                desc: "Results are double-checked against classical ML classifiers for redundant clinical reliability.", 
                icon: <ShieldCheck className="w-8 h-8 text-med-green" />,
                bg: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&q=80"
              }
            ].map((f, i) => (
              <div 
                key={i} 
                className="feature-card glass-card overflow-hidden group cursor-default"
              >
                <div className="h-48 overflow-hidden relative">
                  <img src={f.bg} alt="" className="w-full h-full object-cover grayscale opacity-30 group-hover:grayscale-0 group-hover:scale-110 group-hover:opacity-60 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-med-dark to-transparent" />
                  <div className="absolute bottom-6 left-6 w-12 h-12 rounded-lg bg-med-navy flex items-center justify-center border border-white/10 group-hover:border-med-teal/50 transition-colors">
                    {f.icon}
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-bold mb-4">{f.title}</h3>
                  <p className="text-med-muted text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <HowItWorks />

      {/* Final CTA */}
      <section className="py-40 relative">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-7xl font-display font-bold mb-10">Ready to transform <br/>your practice?</h2>
          <Link to="/diagnose" className="medical-btn px-12 py-6 text-xl">
            Enter Diagnostic Suite
          </Link>
        </div>
      </section>

      <footer className="py-12 border-t border-white/5 text-center text-med-muted text-sm">
        <p>© 2026 MediScan AI. Powered by EfficientNetB3 & JIIT Engineering.</p>
      </footer>
    </motion.div>
  );
}
