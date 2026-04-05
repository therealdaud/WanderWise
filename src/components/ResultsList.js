// src/components/ResultsList.js

import React    from 'react';
import TripCard from './TripCard';

export default function ResultsList({ results, minCostFound }) {
  if (results.length === 0) {
    return (
      <section className="results-section">
        <div className="no-results">
          <p className="no-results-icon"><span role="img" aria-label="telescope">🔭</span></p>
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

  return (
    <section className="results-section">
      <p className="results-heading">
        {results.length} trip{results.length !== 1 ? 's' : ''} within budget — sorted by price
      </p>
      <div className="results-grid">
        {results.map((trip, index) => (
          <TripCard
            key={trip.id}
            trip={trip}
            index={index}
            isBestDeal={index === 0}
          />
        ))}
      </div>
    </section>
  );
}
