// src/components/ComparisonDrawer.js
import React from 'react';

function calcScore(trip) {
  const h = trip.hotel;
  const hotelScore = Math.round((Math.min(10, h.rating ?? 0) / 10) * 35);
  const total      = trip.totalCost + Math.max(0, trip.budgetRemaining);
  const valueScore = Math.round((Math.max(0, trip.budgetRemaining) / total) * 40);
  const stopScore  = trip.flight.stops === 0 ? 25 : trip.flight.stops === 1 ? 15 : 5;
  return Math.min(99, Math.max(1, hotelScore + valueScore + stopScore));
}

function Stars({ n }) {
  const full = Math.floor(n ?? 0);
  return (
    <span style={{ color: '#f5c842', fontSize: '0.75rem' }}>
      {'★'.repeat(full)}
      <span style={{ opacity: 0.22 }}>{'★'.repeat(5 - full)}</span>
    </span>
  );
}

export default function ComparisonDrawer({ trips, onRemove, onClear }) {
  const open = trips.length >= 2;

  const rows = [
    { label: 'Total',       fn: t => <strong style={{ color: '#f5c842' }}>${t.totalCost.toFixed(0)}</strong> },
    { label: 'Flight',      fn: t => `$${t.flight.price.toFixed(0)}` },
    { label: 'Hotel',       fn: t => `$${t.hotel.totalPrice.toFixed(0)}` },
    { label: 'Airline',     fn: t => t.flight.airline },
    { label: 'Stops',       fn: t => t.flight.stops === 0 ? 'Nonstop ✅' : `${t.flight.stops} stop${t.flight.stops > 1 ? 's' : ''}` },
    { label: 'Nights',      fn: t => `${t.nights}n` },
    { label: 'Hotel Name',  fn: t => t.hotel.name.split(' ').slice(0, 3).join(' ') },
    { label: 'Stars',       fn: t => <Stars n={t.hotel.stars} /> },
    { label: 'Rating',      fn: t => `${t.hotel.rating}/10 · ${t.hotel.ratingWord}` },
    { label: 'WanderScore', fn: t => <span style={{ fontWeight: 800 }}>{calcScore(t)}</span> },
    {
      label: 'Budget left',
      fn: t => {
        const r = t.budgetRemaining;
        return (
          <span style={{ color: r >= 0 ? '#4ade80' : '#f87171', fontWeight: 700 }}>
            {r >= 0 ? `$${r.toFixed(0)} left` : `$${Math.abs(r).toFixed(0)} over`}
          </span>
        );
      },
    },
  ];

  return (
    <div className={`cmp-drawer ${open ? 'cmp-drawer--open' : ''}`}>
      <div className="cmp-header">
        <span className="cmp-title">
          <span role="img" aria-label="balance">⚖️</span> Comparing {trips.length} trip{trips.length !== 1 ? 's' : ''}
        </span>
        {trips.length < 3 && (
          <span className="cmp-hint">Add one more to compare</span>
        )}
        <button className="cmp-clear-btn" onClick={onClear}>✕ Clear all</button>
      </div>

      <div className="cmp-scroll">
        <table className="cmp-table">
          <thead>
            <tr>
              <th className="cmp-th cmp-th-label" />
              {trips.map(t => (
                <th key={t.id} className="cmp-th">
                  <div className="cmp-th-dest">{t.destination}</div>
                  <div className="cmp-th-dates">{t.dates.label}</div>
                  <button className="cmp-remove-btn" onClick={() => onRemove(t.id)}>✕</button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className={`cmp-row ${ri % 2 === 0 ? 'cmp-row--alt' : ''}`}>
                <td className="cmp-td cmp-td-label">{row.label}</td>
                {trips.map(t => (
                  <td key={t.id} className="cmp-td">{row.fn(t)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
