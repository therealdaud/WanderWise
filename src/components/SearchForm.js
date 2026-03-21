// src/components/SearchForm.js

import React, { useState } from 'react';

function SearchForm({ onSearch, isLoading }) {
  const [origin,       setOrigin]       = useState('');
  const [destination,  setDestination]  = useState('');
  const [budget,       setBudget]       = useState('');
  const [checkinDate,  setCheckinDate]  = useState('');
  const [checkoutDate, setCheckoutDate] = useState('');
  const [showDates,    setShowDates]    = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!origin.trim() || !budget) return;
    const useDates = showDates && checkinDate && checkoutDate;
    onSearch({
      origin:       origin.trim(),
      destination:  destination.trim(),
      budget:       parseFloat(budget),
      checkinDate:  useDates ? checkinDate  : null,
      checkoutDate: useDates ? checkoutDate : null,
    });
  };

  return (
    <form className="search-form" onSubmit={handleSubmit} autoComplete="off">

      {/* ── Sentence-style row ── */}
      <div className="sentence-row">
        <div className="sentence-chunk">
          <span className="sentence-label">✈ flying from</span>
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
          <span className="sentence-label">💰 budget</span>
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

      {/* ── Submit ── */}
      <button type="submit" className="go-btn" disabled={isLoading}>
        {isLoading ? (
          <span className="btn-inner">searching<span className="dots"><span>.</span><span>.</span><span>.</span></span></span>
        ) : (
          <span className="btn-inner">find my trip <span className="btn-arrow">→</span></span>
        )}
      </button>

      <p className="form-hint">
        Leave destination blank to discover trips within your budget
      </p>
    </form>
  );
}

export default SearchForm;
