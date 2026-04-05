// src/components/SearchForm.js

import React, { useState } from 'react';

const MOODS = [
  { key: 'relax',     label: 'Relax',     icon: '🌴' },
  { key: 'adventure', label: 'Adventure', icon: '🏔️' },
  { key: 'party',     label: 'Party',     icon: '🎉' },
  { key: 'culture',   label: 'Culture',   icon: '🎨' },
  { key: 'food',      label: 'Food',      icon: '🍜' },
  { key: 'nature',    label: 'Nature',    icon: '🌿' },
];

function SearchForm({ onSearch, onSurprise, isLoading, recentSearches = [], defaultValues = {} }) {
  const [origin,       setOrigin]       = useState(defaultValues.origin       || '');
  const [destination,  setDestination]  = useState(defaultValues.destination  || '');
  const [budget,       setBudget]       = useState(defaultValues.budget       || '');
  const [checkinDate,  setCheckinDate]  = useState('');
  const [checkoutDate, setCheckoutDate] = useState('');
  const [showDates,    setShowDates]    = useState(false);
  const [mood,         setMood]         = useState(defaultValues.mood         || '');

  const today = new Date().toISOString().split('T')[0];

  const buildParams = () => {
    const useDates = showDates && checkinDate && checkoutDate;
    return {
      origin:       origin.trim(),
      destination:  destination.trim(),
      budget:       parseFloat(budget),
      checkinDate:  useDates ? checkinDate  : null,
      checkoutDate: useDates ? checkoutDate : null,
      mood,
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!origin.trim() || !budget) return;
    onSearch(buildParams());
  };

  const handleSurprise = () => {
    if (!origin.trim() || !budget) return;
    onSurprise(buildParams());
  };

  const fillRecent = (params) => {
    setOrigin(params.origin);
    setDestination(params.destination || '');
    setBudget(String(params.budget));
    if (params.mood) setMood(params.mood);
  };

  return (
    <form className="search-form" onSubmit={handleSubmit} autoComplete="off">

      {/* ── Sentence-style row ── */}
      <div className="sentence-row">
        <div className="sentence-chunk">
          <span className="sentence-label">
            <span role="img" aria-label="plane">✈</span> flying from
          </span>
          <input
            className="sentence-input"
            type="text"
            placeholder="Tampa, JFK…"
            value={origin}
            onChange={e => setOrigin(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div className="sentence-divider">→</div>

        <div className="sentence-chunk">
          <span className="sentence-label">to</span>
          <input
            className="sentence-input"
            type="text"
            placeholder="anywhere"
            value={destination}
            onChange={e => setDestination(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="sentence-divider">·</div>

        <div className="sentence-chunk">
          <span className="sentence-label">
            <span role="img" aria-label="money bag">💰</span> budget
          </span>
          <div className="budget-wrap">
            <span className="currency-sign">$</span>
            <input
              className="sentence-input budget-input"
              type="number"
              placeholder="1500"
              min="50"
              value={budget}
              onChange={e => setBudget(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* ── Mood selector ── */}
      <div className="mood-row">
        <span className="mood-label">trip vibe</span>
        <div className="mood-chips">
          {MOODS.map(m => (
            <button
              key={m.key}
              type="button"
              className={`mood-chip ${mood === m.key ? 'mood-chip--active' : ''}`}
              onClick={() => setMood(mood === m.key ? '' : m.key)}
              disabled={isLoading}
            >
              <span role="img" aria-label={m.label}>{m.icon}</span>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Dates toggle ── */}
      <div className="dates-area">
        <button
          type="button"
          className="dates-toggle-btn"
          onClick={() => setShowDates(s => !s)}
          disabled={isLoading}
        >
          {showDates ? '✕ remove dates' : '📅 add specific dates'}
        </button>

        {showDates && (
          <div className="dates-row">
            <div className="date-field">
              <span className="sentence-label">check-in</span>
              <input
                type="date"
                className="date-input"
                min={today}
                value={checkinDate}
                onChange={e => setCheckinDate(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <span className="sentence-divider">→</span>
            <div className="date-field">
              <span className="sentence-label">check-out</span>
              <input
                type="date"
                className="date-input"
                min={checkinDate || today}
                value={checkoutDate}
                onChange={e => setCheckoutDate(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Action buttons ── */}
      <div className="form-actions">
        <button type="submit" className="go-btn" disabled={isLoading}>
          {isLoading ? (
            <span className="btn-inner">
              searching<span className="dots"><span>.</span><span>.</span><span>.</span></span>
            </span>
          ) : (
            <span className="btn-inner">find my trip <span className="btn-arrow">→</span></span>
          )}
        </button>

        <button
          type="button"
          className="surprise-btn"
          onClick={handleSurprise}
          disabled={isLoading || !origin.trim() || !budget}
          title="Let WanderWise pick the perfect trip for you"
        >
          <span role="img" aria-label="sparkles">✨</span> Surprise Me
        </button>
      </div>

      <p className="form-hint">
        Leave destination blank to discover trips within your budget
      </p>

      {/* ── Recent searches ── */}
      {recentSearches.length > 0 && !isLoading && (
        <div className="recent-searches">
          <span className="recent-label">recent</span>
          {recentSearches.map((r, i) => (
            <button
              key={i}
              type="button"
              className="recent-chip"
              onClick={() => fillRecent(r.params)}
            >
              {r.label}
            </button>
          ))}
        </div>
      )}

    </form>
  );
}

export default SearchForm;
