// src/components/ResultsList.js

import React, { useState, useEffect, useRef } from 'react';
import TripCard          from './TripCard';
import MapView           from './MapView';
import ComparisonDrawer  from './ComparisonDrawer';

/* Animated count ticker */
function useTicker(target, duration = 900) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (target === 0) { setVal(0); return; }
    const start = performance.now();
    let raf;
    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      setVal(Math.round(t * target));
      if (t < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

export default function ResultsList({
  results,
  minCostFound,
  originalBudget,
  isSurpriseMode,
  onShowAll,
}) {
  const maxCost     = results.length ? Math.max(...results.map(r => r.totalCost)) : originalBudget || 5000;
  const [budgetCap, setBudgetCap] = useState(null);   // null = show all
  const [viewMode,  setViewMode]  = useState('grid'); // 'grid' | 'map'
  const [compareIds, setCompareIds] = useState(new Set());
  const tickerVal   = useTicker(results.length);
  const drawerRef   = useRef(null);

  // Reset budget cap when results change
  useEffect(() => {
    setBudgetCap(null);
    setCompareIds(new Set());
    setViewMode('grid');
  }, [results]);

  const cap      = budgetCap ?? maxCost;
  const filtered = results.filter(r => r.totalCost <= cap);

  const toggleCompare = (id) => {
    setCompareIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 3) next.add(id);
      return next;
    });
  };

  const compareTrips = results.filter(r => compareIds.has(r.id));

  // Scroll to comparison drawer when it opens
  useEffect(() => {
    if (compareIds.size >= 2 && drawerRef.current) {
      setTimeout(() => drawerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }, [compareIds.size]);

  /* ── No results ── */
  if (results.length === 0) {
    return (
      <section className="results-section">
        <div className="no-results">
          <p className="no-results-icon">
            <span role="img" aria-label="telescope">🔭</span>
          </p>
          <p className="no-results-title">No trips found within your budget</p>
          <p className="no-results-sub">
            Try a closer destination, or leave it blank to explore all options.
          </p>
          {minCostFound && (
            <div className="no-results-hint">
              <span role="img" aria-label="light bulb">💡</span>
              {' '}Trips from your origin start at{' '}
              <strong>${Math.ceil(minCostFound)}</strong>.
              {' '}Raise your budget to see results.
            </div>
          )}
        </div>
      </section>
    );
  }

  /* ── Surprise reveal mode ── */
  if (isSurpriseMode) {
    const pick = results[0];
    return (
      <section className="results-section surprise-section">
        <div className="surprise-reveal">
          <p className="surprise-label">
            <span role="img" aria-label="sparkles">✨</span> Your perfect trip
          </p>
          <div className="surprise-card-wrap">
            <TripCard trip={pick} index={0} isBestDeal />
          </div>
          <button className="surprise-show-all-btn" onClick={onShowAll}>
            See all {results.length} trip{results.length !== 1 ? 's' : ''} →
          </button>
        </div>
      </section>
    );
  }

  /* ── Full results ── */
  return (
    <section className="results-section">

      {/* ── Controls bar ── */}
      <div className="results-controls">
        <p className="results-heading">
          <span className="ticker-count">{tickerVal}</span> trip{results.length !== 1 ? 's' : ''} found
          {budgetCap !== null && filtered.length !== results.length && (
            <span className="results-filtered"> · showing {filtered.length} within ${cap.toFixed(0)}</span>
          )}
        </p>

        {/* View toggle */}
        <div className="view-toggle">
          <button
            className={`view-btn ${viewMode === 'grid' ? 'view-btn--active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Grid view"
          >
            <span role="img" aria-label="grid">⊞</span> Grid
          </button>
          <button
            className={`view-btn ${viewMode === 'map' ? 'view-btn--active' : ''}`}
            onClick={() => setViewMode('map')}
            title="Map view"
          >
            <span role="img" aria-label="map">🗺</span> Map
          </button>
        </div>
      </div>

      {/* ── Budget slider ── */}
      <div className="slider-row">
        <label className="slider-label" htmlFor="budget-slider">
          <span role="img" aria-label="slider">🎚</span> Max budget: <strong>${cap.toFixed(0)}</strong>
        </label>
        <input
          id="budget-slider"
          className="budget-slider"
          type="range"
          min={results[0]?.totalCost ?? 0}
          max={maxCost}
          step={10}
          value={cap}
          onChange={e => setBudgetCap(Number(e.target.value))}
        />
        {budgetCap !== null && (
          <button className="slider-reset-btn" onClick={() => setBudgetCap(null)}>
            Show all
          </button>
        )}
      </div>

      {/* ── Map or Grid ── */}
      {viewMode === 'map' ? (
        <MapView trips={filtered} />
      ) : (
        <div className="results-grid">
          {filtered.map((trip, index) => (
            <TripCard
              key={trip.id}
              trip={trip}
              index={index}
              isBestDeal={index === 0}
              isComparing={compareIds.has(trip.id)}
              onToggleCompare={toggleCompare}
            />
          ))}
        </div>
      )}

      {/* ── Comparison drawer ── */}
      <div ref={drawerRef}>
        <ComparisonDrawer
          trips={compareTrips}
          onRemove={id => toggleCompare(id)}
          onClear={() => setCompareIds(new Set())}
        />
      </div>

    </section>
  );
}
