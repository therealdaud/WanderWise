// src/components/TripCard.js

import React, { useState } from 'react';

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function fmtDuration(mins) {
  if (!mins) return '';
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}
function fmtTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

/** Convert ISO 3166-1 alpha-2 code → flag emoji (e.g. "US" → 🇺🇸) */
function countryFlag(code) {
  if (!code || code.length < 2) return '';
  return code.toUpperCase().slice(0, 2)
    .replace(/[A-Z]/g, c => String.fromCodePoint(c.charCodeAt(0) + 127397));
}

function Stars({ n }) {
  const full = Math.floor(n ?? 0);
  return (
    <span className="tc-stars">
      {'★'.repeat(full)}
      <span className="tc-stars-empty">{'★'.repeat(5 - full)}</span>
    </span>
  );
}

/**
 * WanderScore: 0–100 composite of hotel quality, value for money, flight quality.
 * Higher = better overall trip.
 */
function calcWanderScore(trip, hotel) {
  const hotelScore  = Math.round((Math.min(10, hotel.rating ?? 0) / 10) * 35);
  const totalBudget = trip.totalCost + Math.max(0, trip.budgetRemaining);
  const valueScore  = Math.round((Math.max(0, trip.budgetRemaining) / totalBudget) * 40);
  const stopScore   = trip.flight.stops === 0 ? 25 : trip.flight.stops === 1 ? 15 : 5;
  return Math.min(99, Math.max(1, hotelScore + valueScore + stopScore));
}

/* ── Component ───────────────────────────────────────────────────────────── */
export default function TripCard({ trip, index = 0, isBestDeal = false }) {
  const [hotelIdx,  setHotelIdx]  = useState(0);
  const [copied,    setCopied]    = useState(false);

  const options   = trip.allAffordableHotels ?? [trip.hotel];
  const hotel     = options[hotelIdx] ?? trip.hotel;
  const total     = trip.flight.price + hotel.totalPrice;
  const remaining = trip.budgetRemaining + (trip.hotel.totalPrice - hotel.totalPrice);
  const pctUsed   = Math.min(100, Math.round((total / (total + Math.max(0, remaining))) * 100));
  const score     = calcWanderScore(trip, hotel);
  const flag      = countryFlag(trip.country);

  const handleShare = () => {
    const text =
      `✈ ${trip.destination} — ${trip.dates.label}\n` +
      `${trip.flight.airline}  $${trip.flight.price.toFixed(0)}  ·  ` +
      `${hotel.name}  $${hotel.totalPrice.toFixed(0)}\n` +
      `Total: $${total.toFixed(0)}  (WanderScore ${score})  🗺 wander-wise-blond.vercel.app`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <article
      className="tc"
      style={{ animationDelay: `${index * 0.07}s` }}
    >
      {/* ── Best Deal banner ── */}
      {isBestDeal && (
        <div className="tc-best-deal-banner">
          <span role="img" aria-label="crown">👑</span> Best Deal
        </div>
      )}

      {/* ── Header ── */}
      <div className="tc-header">
        <div>
          <h3 className="tc-dest">
            {flag && <span className="tc-flag" role="img" aria-label={trip.country}>{flag}</span>}
            {trip.destination}
          </h3>
          <span className="tc-country">{trip.country}</span>
        </div>

        <div className="tc-header-right">
          {/* WanderScore */}
          <div className="tc-score" title="WanderScore: hotel quality + value for money + flight convenience">
            <span className="tc-score-label">WS</span>
            <span className="tc-score-value">{score}</span>
          </div>
          <div className="tc-badges">
            <span className="tc-badge">{trip.dates.label}</span>
            <span className="tc-badge tc-badge--nights">{trip.nights}n</span>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="tc-body">

        {/* Flight */}
        <div className="tc-section">
          <p className="tc-section-title"><span role="img" aria-label="airplane">✈</span> Flight</p>
          <div className="tc-row">
            <span className="tc-airline">{trip.flight.airline}</span>
            <span className="tc-price">${trip.flight.price.toFixed(0)}</span>
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
            <span className="tc-price">${hotel.totalPrice.toFixed(0)}</span>
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
          <button
            className={`tc-share-btn ${copied ? 'tc-share-btn--copied' : ''}`}
            onClick={handleShare}
            title="Copy trip summary"
          >
            {copied ? '✓ copied' : '⎘ share'}
          </button>
        </div>

        {/* Budget bar */}
        <div className="tc-bar-track">
          <div className="tc-bar-fill" style={{ width: `${pctUsed}%` }} />
        </div>
      </div>

    </article>
  );
}
