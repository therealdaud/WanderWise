// src/App.js

import React, { useState, useEffect } from 'react';
import './App.css';
import SearchForm  from './components/SearchForm';
import ResultsList from './components/ResultsList';
import { findTrips } from './utils/tripFinder';

const MAX_RECENT = 3;

function App() {
  const [results,       setResults]       = useState([]);
  const [isLoading,     setIsLoading]     = useState(false);
  const [error,         setError]         = useState(null);
  const [progress,      setProgress]      = useState('');
  const [hasSearched,   setHasSearched]   = useState(false);
  const [minCostFound,  setMinCostFound]  = useState(null);
  const [recentSearches, setRecentSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ww_recent') ?? '[]'); }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('ww_recent', JSON.stringify(recentSearches));
  }, [recentSearches]);

  const addRecentSearch = (params) => {
    setRecentSearches(prev => {
      const label = `${params.origin} → ${params.destination || 'anywhere'} · $${params.budget}`;
      const next  = [{ label, params }, ...prev.filter(r => r.label !== label)].slice(0, MAX_RECENT);
      return next;
    });
  };

  const handleSearch = async (params) => {
    setIsLoading(true);
    setError(null);
    setResults([]);
    setMinCostFound(null);
    setHasSearched(false);
    setProgress('Starting search…');
    addRecentSearch(params);

    try {
      const { trips, minCostFound: mcf } = await findTrips(params, msg => setProgress(msg));
      setResults(trips);
      setMinCostFound(mcf);
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
          <SearchForm
            onSearch={handleSearch}
            isLoading={isLoading}
            recentSearches={recentSearches}
          />
        </div>
      </section>

      {/* ── Loading ── */}
      {isLoading && (
        <div className="status-section">
          <div className="status-card">
            <div className="globe-spinner"><span role="img" aria-label="globe">🌐</span></div>
            <p className="status-msg">{progress}</p>
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="status-section">
          <div className="error-card">
            <span role="img" aria-label="warning">⚠️</span>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {hasSearched && !isLoading && (
        <ResultsList results={results} minCostFound={minCostFound} />
      )}

    </div>
  );
}

export default App;
