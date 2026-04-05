// src/components/TripCard.js

import React, { useState } from 'react';

function fmtDuration(mins) {
  if (!mins) return '';
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}
function fmtTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}
function Stars({ n }) {
  return (
    <span className="tc-stars">
      {'★'.repeat(Math.floor(n ?? 0))}
      <span className="tc-stars-empty">{'★'.repeat(5 - Math.floor(n ?? 0))}</span>
    </span>
  );
}

export default function TripCard({ trip }) {
  const [hotelIdx, setHotelIdx] = useState(0);
  const options       = trip.allAffordableHotels ?? [trip.hotel];
  const hotel         = options[hotelIdx] ?? trip.hotel;
  const total         = trip.flight.price + hotel.totalPrice;
  const remaining     = trip.budgetRemaining + (trip.hotel.totalPrice - hotel.totalPrice);
  const pctUsed       = Math.min(100, Math.round((total / (total + Math.max(0, remaining))) * 100));

  return (
    <article className="tc">

      {/* ── Header band ── */}
      <div className="tc-header">
        <div>
          <h3 className="tc-dest">{trip.destination}</h3>
          <span className="tc-country">{trip.country}</span>
        </div>
        <div className="tc-badges">
          <span className="tc-badge">{trip.dates.label}</span>
          <span className="tc-badge tc-badge--nights">{trip.nights}n</span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="tc-body">

        {/* Flight */}
        <div className="tc-section">
          <p className="tc-section-title"><span role="img" aria-label="airplane">✈</span> Flight</p>
          <div className="tc-row">
            <span className="tc-airline">{trip.flight.airline}</span>
            <span className="tc-price">${trip.flight.price}</span>
          </div>
          <div className="tc-sub">
            <span>{fmtTime(trip.flight.departure)} → {fmtTime(trip.flight.arrival)}</span>
            {trip.flight.durationMins > 0 && <span>· {fmtDuration(trip.flight.durationMins)}</span>}
            <span>· {trip.flight.stops === 0 ? 'Nonstop' : `${trip.flight.stops} stop${trip.flight.stops > 1 ? 's' : ''}`}</span>
          </div>
          {trip.flight.returnDeparture && (
            <div className="tc-sub tc-return">
              ↩ Return: {fmtTime(trip.flight.returnDeparture)} → {fmtTime(trip.flight.returnArrival)}
            </div>
          )}
        </div>

        <div className="tc-divider" />

        {/* Hotel */}
        <div className="tc-section">
          <p className="tc-section-title"><span role="img" aria-label="hotel">🏨</span> Hotel</p>

          {options.length > 1 && (
            <div className="tc-tabs">
              {options.map((_, i) => (
                <button
                  key={i}
                  className={`tc-tab ${i === hotelIdx ? 'tc-tab--active' : ''}`}
                  onClick={() => setHotelIdx(i)}
                >
                  {i === 0 ? 'Best value' : `Option ${i + 1}`}
                </button>
              ))}
            </div>
          )}

          <div className="tc-row">
            <span className="tc-hotel-name">{hotel.name}</span>
            <span className="tc-price">${hotel.totalPrice}</span>
          </div>
          <div className="tc-sub">
            <Stars n={hotel.stars} />
            {hotel.rating > 0 && (
              <span className="tc-rating">{hotel.rating}/10 · {hotel.ratingWord}</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="tc-footer">
        <div className="tc-total-row">
          <span className="tc-total-label">Total</span>
          <span className="tc-total-price">${total.toFixed(0)}</span>
          <span className={`tc-remaining ${remaining >= 0 ? 'tc-remaining--ok' : 'tc-remaining--over'}`}>
            {remaining >= 0 ? `$${remaining.toFixed(0)} left` : `$${Math.abs(remaining).toFixed(0)} over`}
          </span>
        </div>

        {/* Budget bar */}
        <div className="tc-bar-track">
          <div className="tc-bar-fill" style={{ width: `${pctUsed}%` }} />
        </div>
      </div>

    </article>
  );
}
