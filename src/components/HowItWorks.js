// src/components/HowItWorks.js
import React, { useEffect, useRef, useState } from 'react';

const STEPS = [
  {
    icon: '💰',
    title: 'Set Your Budget',
    desc: 'Enter your departure city, an optional destination, and your total travel budget. Pick a mood to get personalised suggestions.',
  },
  {
    icon: '🔍',
    title: 'We Search Everything',
    desc: 'WanderWise fires real Duffel flight searches across up to 10 destinations and date windows simultaneously, matching the best hotels for your remaining budget.',
  },
  {
    icon: '✈️',
    title: 'You Explore the World',
    desc: 'Browse ranked trips sorted by price. Compare options side-by-side, check your WanderScore, view destinations on the map, or hit Surprise Me for a curated reveal.',
  },
];

export default function HowItWorks() {
  const ref     = useRef(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVis(true); },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="how-it-works" className="how-section" ref={ref}>
      <p className="how-label">How It Works</p>
      <h2 className="how-title">Three steps to your next adventure</h2>
      <div className="how-grid">
        {STEPS.map((s, i) => (
          <div
            key={i}
            className={`how-card ${vis ? 'how-card--visible' : ''}`}
            style={{ transitionDelay: `${i * 0.14}s` }}
          >
            <div className="how-icon">
              <span role="img" aria-label={s.title}>{s.icon}</span>
            </div>
            <div className="how-step-num">0{i + 1}</div>
            <h3 className="how-card-title">{s.title}</h3>
            <p className="how-card-desc">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
