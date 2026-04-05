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

/** ISO 3166-1 alpha-2 → flag emoji */
function countryFlag(code) {
  if (!code || code.length < 2) return '';
  return code.toUpperCase().slice(0, 2)
    .replace(/[A-Z]/g, c => String.fromCodePoint(c.charCodeAt(0) + 127397));
}

/** Days until departure (negative = past) */
function daysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const dep   = new Date(dateStr); dep.setHours(0, 0, 0, 0);
  return Math.round((dep - today) / 86_400_000);
}

/** City-seeded gradient for card header */
function cityGradient(city = '') {
  const seed  = city.toLowerCase().split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const hue1  = (seed * 47) % 360;
  const hue2  = (hue1 + 45) % 360;
  return `linear-gradient(135deg, hsl(${hue1},55%,12%) 0%, hsl(${hue2},65%,22%) 100%)`;
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
 * WanderScore: 0–99 composite.
 */
function calcWanderScore(trip, hotel) {
  const hotelScore  = Math.round((Math.min(10, hotel.rating ?? 0) / 10) * 35);
  const totalBudget = trip.totalCost + Math.max(0, trip.budgetRemaining);
  const valueScore  = Math.round((Math.max(0, trip.budgetRemaining) / totalBudget) * 40);
  const stopScore   = trip.flight.stops === 0 ? 25 : trip.flight.stops === 1 ? 15 : 5;
  return Math.min(99, Math.max(1, hotelScore + valueScore + stopScore));
}

/** Trip DNA: 5 dimensions, each 0–100 */
function calcDNA(trip, hotel) {
  const flightQ  = trip.flight.stops === 0 ? 100 : trip.flight.stops === 1 ? 60 : 25;
  const hotelQ   = Math.round((Math.min(10, hotel.rating ?? 0) / 10) * 100);
  const totalB   = trip.totalCost + Math.max(0, trip.budgetRemaining);
  const value    = Math.round((Math.max(0, trip.budgetRemaining) / totalB) * 100);
  // Popularity: seeded from destination name
  const seed     = trip.destination.toLowerCase().split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const popular  = 40 + (seed % 61);
  // Season: seeded from destination + departure month
  const month    = trip.dates.departure ? new Date(trip.dates.departure).getMonth() : 6;
  const season   = 45 + ((seed + month * 13) % 56);
  return [
    { label: 'Flight',  val: flightQ,  color: '#60a5fa' },
    { label: 'Hotel',   val: hotelQ,   color: '#a78bfa' },
    { label: 'Value',   val: value,    color: '#4ade80' },
    { label: 'Popular', val: popular,  color: '#f59e0b' },
    { label: 'Season',  val: season,   color: '#fb7185' },
  ];
}

/* ── Component ───────────────────────────────────────────────────────────── */
export default function TripCard({
  trip,
  index = 0,
  isBestDeal = false,
  isComparing = false,
  onToggleCompare,
}) {
  const [hotelIdx, setHotelIdx] = useState(0);
  const [copied,   setCopied]   = useState(false);
  const [dnaOpen,  setDnaOpen]  = useState(false);

  const options   = trip.allAffordableHotels ?? [trip.hotel];
  const hotel     = options[hotelIdx] ?? trip.hotel;
  const total     = trip.flight.price + hotel.totalPrice;
  const remaining = trip.budgetRemaining + (trip.hotel.totalPrice - hotel.totalPrice);
  const pctUsed   = Math.min(100, Math.round((total / (total + Math.max(0, remaining))) * 100));
  const score     = calcWanderScore(trip, hotel);
  const dna       = calcDNA(trip, hotel);
  const flag      = countryFlag(trip.country);
  const days      = daysUntil(trip.dates.departure);
  const gradient  = cityGradient(trip.destination);

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
      className={`tc ${isComparing ? 'tc--comparing' : ''}`}
      style={{ animationDelay: `${index * 0.07}s` }}
    >
      {/* ── Best Deal banner ── */}
      {isBestDeal && (
        <div className="tc-best-deal-banner">
          <span role="img" aria-label="crown">👑</span> Best Deal
        </div>
      )}

      {/* ── Gradient city header ── */}
      <div className="tc-header" style={{ background: gradient }}>
        <div>
          <h3 className="tc-dest">
            {flag && <span className="tc-flag" role="img" aria-label={trip.country}>{flag}</span>}
            {trip.destination}
          </h3>
          <span className="tc-country">{trip.country}</span>
          {days !== null && (
            <span className={`tc-countdown ${days <= 7 ? 'tc-countdown--soon' : ''}`}>
              {days === 0
                ? '🔥 Departing today!'
                : days < 0
                  ? `Departed ${Math.abs(days)}d ago`
                  : `Departing in ${days} day${days !== 1 ? 's' : ''}`}
            </span>
          )}
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
          <p className="tc-section-title">
            <span role="img" aria-label="airplane">✈</span> Flight
          </p>
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
              <span role="img" aria-label="return">↩</span> Return: {fmtTime(trip.flight.returnDeparture)} → {fmtTime(trip.flight.returnArrival)}
            </div>
          )}
        </div>

        <div className="tc-divider" />

        {/* Hotel */}
        <div className="tc-section">
          <p className="tc-section-title">
            <span role="img" aria-label="hotel">🏨</span> Hotel
          </p>

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

        <div className="tc-divider" />

        {/* ── Trip DNA ── */}
        <div className="tc-dna-row">
          <button
            className="tc-dna-toggle"
            onClick={() => setDnaOpen(o => !o)}
            type="button"
          >
            Trip DNA {dnaOpen ? '▲' : '▼'}
          </button>

          {dnaOpen && (
            <div className="tc-dna">
              {dna.map(d => (
                <div key={d.label} className="tc-dna-item">
                  <span className="tc-dna-label">{d.label}</span>
                  <div className="tc-dna-bar-track">
                    <div
                      className="tc-dna-bar-fill"
                      style={{ width: `${d.val}%`, background: d.color }}
                    />
                  </div>
                  <span className="tc-dna-val">{d.val}</span>
                </div>
              ))}
            </div>
          )}
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

        {/* Action row */}
        <div className="tc-actions">
          <button
            className={`tc-share-btn ${copied ? 'tc-share-btn--copied' : ''}`}
            onClick={handleShare}
            title="Copy trip summary"
            type="button"
          >
            {copied ? '✓ copied' : '⎘ share'}
          </button>

          {onToggleCompare && (
            <button
              className={`tc-compare-btn ${isComparing ? 'tc-compare-btn--active' : ''}`}
              onClick={() => onToggleCompare(trip.id)}
              title={isComparing ? 'Remove from comparison' : 'Add to comparison'}
              type="button"
            >
              {isComparing ? '✕ comparing' : '+ compare'}
            </button>
          )}
        </div>
      </div>

    </article>
  );
}
