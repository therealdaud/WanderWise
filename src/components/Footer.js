// src/components/Footer.js
import React from 'react';

export default function Footer() {
  return (
    <footer className="ww-footer">
      <div className="ww-footer-inner">
        <span className="ww-footer-brand">
          <span role="img" aria-label="plane">✈</span> WanderWise
        </span>
        <span className="ww-footer-sep">·</span>
        <span className="ww-footer-text">
          Built by{' '}
          <a href="https://github.com/therealdaud" target="_blank" rel="noopener noreferrer">
            @therealdaud
          </a>
        </span>
        <span className="ww-footer-sep">·</span>
        <span className="ww-footer-text">
          Powered by{' '}
          <a href="https://duffel.com" target="_blank" rel="noopener noreferrer">
            Duffel
          </a>
        </span>
        <span className="ww-footer-sep">·</span>
        <span className="ww-footer-text ww-footer-year">
          {new Date().getFullYear()}
        </span>
      </div>
    </footer>
  );
}
