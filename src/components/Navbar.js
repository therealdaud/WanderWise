// src/components/Navbar.js
import React, { useState, useEffect } from 'react';

export default function Navbar({ darkMode, onToggleDark }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <nav className={`ww-nav ${visible ? 'ww-nav--visible' : ''}`}>
      <button className="ww-nav-brand" onClick={scrollTop}>
        <span role="img" aria-label="plane">✈</span> WanderWise
      </button>
      <div className="ww-nav-right">
        <a className="ww-nav-link" href="#how-it-works">How it works</a>
        <button
          className="ww-dark-toggle"
          onClick={onToggleDark}
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle dark mode"
        >
          <span role="img" aria-label={darkMode ? 'sun' : 'moon'}>
            {darkMode ? '☀️' : '🌙'}
          </span>
        </button>
      </div>
    </nav>
  );
}
