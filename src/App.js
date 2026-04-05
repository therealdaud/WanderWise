// src/App.js

import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import SearchForm    from './components/SearchForm';
import ResultsList   from './components/ResultsList';
import StarField     from './components/StarField';
import LoadingPlane  from './components/LoadingPlane';
import Navbar        from './components/Navbar';
import HowItWorks    from './components/HowItWorks';
import Footer        from './components/Footer';
import Confetti      from './components/Confetti';
import { findTrips } from './utils/tripFinder';

const MAX_RECENT = 3;

/* ── Read URL search params on initial load ─────────────────────────────── */
function readUrlDefaults() {
  try {
    const p = new URLSearchParams(window.location.search);
    return {
      origin:      p.get('from')      || '',
      destination: p.get('to')        || '',
      budget:      p.get('budget')    || '',
      mood:        p.get('mood')      || '',
    };
  } catch {
    return {};
  }
}

function writeUrl(params) {
  try {
    const p = new URLSearchParams();
    if (params.origin)      p.set('from',   params.origin);
    if (params.destination) p.set('to',     params.destination);
    if (params.budget)      p.set('budget', params.budget);
    if (params.mood)        p.set('mood',   params.mood);
    const qs = p.toString();
    window.history.replaceState({}, '', qs ? `?${qs}` : window.location.pathname);
  } catch { /* ignore */ }
}

export default function App() {
  /* ── Core search state ── */
  const [results,        setResults]        = useState([]);
  const [isLoading,      setIsLoading]      = useState(false);
  const [error,          setError]          = useState(null);
  const [progress,       setProgress]       = useState('');
  const [hasSearched,    setHasSearched]    = useState(false);
  const [minCostFound,   setMinCostFound]   = useState(null);
  const [originalBudget, setOriginalBudget] = useState(null);

  /* ── Surprise mode ── */
  const [isSurpriseMode,  setIsSurpriseMode]  = useState(false);
  const [showConfetti,    setShowConfetti]    = useState(false);

  /* ── Dark mode ── */
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem('ww_dark') !== 'false'; }
    catch { return true; }
  });

  /* ── Recent searches ── */
  const [recentSearches, setRecentSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ww_recent') ?? '[]'); }
    catch { return []; }
  });

  /* ── URL defaults ── */
  const [urlDefaults] = useState(readUrlDefaults);

  /* ── Effects ── */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    try { localStorage.setItem('ww_dark', String(darkMode)); } catch { /* ignore */ }
  }, [darkMode]);

  useEffect(() => {
    try { localStorage.setItem('ww_recent', JSON.stringify(recentSearches)); }
    catch { /* ignore */ }
  }, [recentSearches]);

  /* ── Helpers ── */
  const addRecentSearch = useCallback((params) => {
    setRecentSearches(prev => {
      const label = `${params.origin} → ${params.destination || 'anywhere'}${params.mood ? ` · ${params.mood}` : ''} · $${params.budget}`;
      return [{ label, params }, ...prev.filter(r => r.label !== label)].slice(0, MAX_RECENT);
    });
  }, []);

  /* ── Core search function ── */
  const runSearch = useCallback(async (params, surpriseMode = false) => {
    setIsLoading(true);
    setError(null);
    setResults([]);
    setMinCostFound(null);
    setHasSearched(false);
    setIsSurpriseMode(surpriseMode);
    setShowConfetti(false);
    setProgress('Starting search…');
    setOriginalBudget(params.budget);
    addRecentSearch(params);
    writeUrl(params);

    try {
      const { trips, minCostFound: mcf } = await findTrips(params, msg => setProgress(msg));
      setResults(trips);
      setMinCostFound(mcf);
      setHasSearched(true);
      if (surpriseMode && trips.length > 0) {
        setShowConfetti(true);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
      setProgress('');
    }
  }, [addRecentSearch]);

  const handleSearch  = useCallback((params) => runSearch(params, false), [runSearch]);
  const handleSurprise = useCallback((params) => runSearch(params, true),  [runSearch]);
  const handleShowAll  = useCallback(() => setIsSurpriseMode(false), []);

  const compact = hasSearched || isLoading;

  return (
    <div className="app">

      {/* ── Sticky navbar ── */}
      <Navbar darkMode={darkMode} onToggleDark={() => setDarkMode(d => !d)} />

      {/* ── Confetti ── */}
      {showConfetti && (
        <Confetti onDone={() => setShowConfetti(false)} />
      )}

      {/* ── Hero ── */}
      <section className={`hero ${compact ? 'hero--compact' : ''}`}>
        <StarField />
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="brand">
            <img src="/logo.png" alt="WanderWise" className="brand-logo" />
            <h1 className="brand-name">WanderWise</h1>
          </div>
          <p className="brand-tagline">enter your budget. we find the world.</p>
          <SearchForm
            onSearch={handleSearch}
            onSurprise={handleSurprise}
            isLoading={isLoading}
            recentSearches={recentSearches}
            defaultValues={urlDefaults}
          />
        </div>
      </section>

      {/* ── Loading ── */}
      {isLoading && (
        <div className="status-section">
          <LoadingPlane message={progress} />
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
        <ResultsList
          results={results}
          minCostFound={minCostFound}
          originalBudget={originalBudget}
          isSurpriseMode={isSurpriseMode}
          onShowAll={handleShowAll}
        />
      )}

      {/* ── How it works ── */}
      {!isLoading && <HowItWorks />}

      {/* ── Footer ── */}
      <Footer />

    </div>
  );
}
