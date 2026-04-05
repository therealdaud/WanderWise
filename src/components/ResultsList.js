// src/components/ResultsList.js

import React    from 'react';
import TripCard from './TripCard';

export default function ResultsList({ results }) {
  if (results.length === 0) {
    return (
      <section className="results-section">
        <div className="no-results">
          <p className="no-results-icon"><span role="img" aria-label="telescope">🔭</span></p>
          <p className="no-results-title">No trips found within your budget</p>
          <p className="no-results-sub">
            Try raising your budget, choosing a closer destination,<br />
            or leaving the destination blank to let us explore options for you.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="results-section">
      <p className="results-heading">
        {results.length} trip{results.length !== 1 ? 's' : ''} within budget
      </p>
      <div className="results-grid">
        {results.map(trip => <TripCard key={trip.id} trip={trip} />)}
      </div>
    </section>
  );
}
