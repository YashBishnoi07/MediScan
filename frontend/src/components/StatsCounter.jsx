import React from 'react';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';

export default function StatsCounter({ target, suffix = "", prefix = "", decimals = 0, label }) {
  const { ref, inView } = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });

  return (
    <div ref={ref} className="flex flex-col items-center">
      <div className="text-4xl md:text-6xl font-display font-bold text-med-teal-lt mb-2 glow-teal">
        {inView ? (
          <CountUp 
            start={0} 
            end={target} 
            suffix={suffix} 
            prefix={prefix}
            decimals={decimals}
            duration={2.5} 
            useEasing={true}
          />
        ) : (
          <span>0{suffix}</span>
        )}
      </div>
      <div className="text-med-muted text-xs uppercase tracking-[0.2em] font-bold">
        {label}
      </div>
    </div>
  );
}
