// src/App.js

import React, { useState } from 'react';
import './App.css';
import SearchForm  from './components/SearchForm';
import ResultsList from './components/ResultsList';
import { findTrips } from './utils/tripFinder';

function App() {
  const [results,     setResults]     = useState([]);
  const [isLoading,   setIsLoading]   = useState(false);
  const [error,       setError]       = useState(null);
  const [progress,    setProgress]    = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (params) => {
    setIsLoading(true);
    setError(null);
    setResults([]);
    setHasSearched(false);
    setProgress('Starting search…');

    try {
      const trips = await findTrips(params, msg => setProgress(msg));
      setResults(trips);
      setHasSearched(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
      setProgress('');
    }
  };

  return (
    <div className="app">

      {/* ── Hero ── */}
      <section className={`hero ${hasSearched || isLoading ? 'hero--compact' : ''}`}>
        <div className="hero-overlay" />

        <div className="hero-content">
          <div className="brand">
            <img src="/logo.png" alt="WanderWise" className="brand-logo" />
            <h1 className="brand-name">WanderWise</h1>
          </div>
          <p className="brand-tagline">enter your budget. we find the world.</p>

          <SearchForm onSearch={handleSearch} isLoading={isLoading} />
        </div>
      </section>

      {/* ── Loading ── */}
      {isLoading && (
        <div className="status-section">
          <div className="status-card">
            <div className="globe-spinner">🌐</div>
            <p className="status-msg">{progress}</p>
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="status-section">
          <div className="error-card">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {hasSearched && !isLoading && (
        <ResultsList results={results} />
      )}

    </div>
  );
}

export default App;
