// src/components/MapView.js — abstract pin-map on a stylised projection
import React, { useState } from 'react';

const CITY_COORDS = {
  'New York':     [40.71, -74.01],
  'Miami':        [25.76, -80.19],
  'Los Angeles':  [34.05, -118.24],
  'Las Vegas':    [36.17, -115.14],
  'Orlando':      [28.54, -81.38],
  'Chicago':      [41.88, -87.63],
  'Cancun':       [21.16, -86.85],
  'London':       [51.51, -0.13],
  'Paris':        [48.86,  2.35],
  'Tokyo':        [35.68, 139.65],
  'Denver':       [39.74, -104.99],
  'Seattle':      [47.61, -122.33],
  'New Orleans':  [29.95, -90.07],
  'Portland':     [45.51, -122.68],
  'Nashville':    [36.16, -86.78],
};

// Mercator-ish projection → SVG coords
function project(lat, lng, W, H) {
  const x = ((lng + 180) / 360) * W;
  const latRad = (lat * Math.PI) / 180;
  const mercN  = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const y      = (H / 2) - (W * mercN) / (2 * Math.PI);
  return [x, Math.max(10, Math.min(H - 10, y))];
}

export default function MapView({ trips }) {
  const [activeId, setActiveId] = useState(null);
  const W = 900, H = 440;

  // Cheapest trip per destination
  const byDest = {};
  trips.forEach(t => {
    if (!byDest[t.destination] || byDest[t.destination].totalCost > t.totalCost) {
      byDest[t.destination] = t;
    }
  });

  const pins = Object.values(byDest)
    .map(t => {
      const coords = CITY_COORDS[t.destination];
      if (!coords) return null;
      const [x, y] = project(coords[0], coords[1], W, H);
      return { trip: t, x, y };
    })
    .filter(Boolean);

  const activeTrip = activeId ? trips.find(t => t.id === activeId) : null;

  return (
    <div className="map-wrap">
      {/* Instruction nudge */}
      <p className="map-hint">
        <span role="img" aria-label="pin">📍</span> Click a pin to preview
      </p>

      <div className="map-canvas-wrap">
        <svg
          className="map-svg"
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Background grid */}
          {Array.from({ length: 11 }, (_, i) => (
            <line key={`v${i}`} x1={(i + 1) * W / 12} y1={0}
              x2={(i + 1) * W / 12} y2={H}
              stroke="rgba(255,255,255,0.035)" strokeWidth="1" />
          ))}
          {Array.from({ length: 7 }, (_, i) => (
            <line key={`h${i}`} x1={0} y1={(i + 1) * H / 8}
              x2={W} y2={(i + 1) * H / 8}
              stroke="rgba(255,255,255,0.035)" strokeWidth="1" />
          ))}

          {/* Connection lines from active pin */}
          {pins.map(({ trip, x, y }) => {
            if (!activeId || trip.id === activeId) return null;
            const active = pins.find(p => p.trip.id === activeId);
            if (!active) return null;
            return (
              <line key={`line-${trip.id}`}
                x1={active.x} y1={active.y} x2={x} y2={y}
                stroke="rgba(245,200,66,0.08)" strokeWidth="1" strokeDasharray="4 4" />
            );
          })}

          {/* Pins */}
          {pins.map(({ trip, x, y }) => {
            const active = activeId === trip.id;
            return (
              <g
                key={trip.id}
                onClick={() => setActiveId(active ? null : trip.id)}
                style={{ cursor: 'pointer' }}
              >
                {/* Outer pulse ring */}
                <circle cx={x} cy={y} r={active ? 22 : 16}
                  fill="none" stroke="rgba(245,200,66,0.25)" strokeWidth="1.5">
                  {active && (
                    <animate attributeName="r" from="14" to="28"
                      dur="1.5s" repeatCount="indefinite" />
                  )}
                  {active && (
                    <animate attributeName="stroke-opacity" from="0.4" to="0"
                      dur="1.5s" repeatCount="indefinite" />
                  )}
                </circle>

                {/* Core dot */}
                <circle cx={x} cy={y} r={active ? 9 : 6.5}
                  fill={active ? '#f5c842' : 'rgba(245,200,66,0.82)'}
                  stroke={active ? '#fff' : '#07091a'} strokeWidth={active ? 2 : 1.5} />

                {/* Price bubble */}
                <rect x={x - 26} y={y - 36} width={52} height={19}
                  rx={9}
                  fill={active ? '#f5c842' : 'rgba(7,9,26,0.88)'}
                  stroke={active ? 'transparent' : 'rgba(245,200,66,0.45)'}
                  strokeWidth="1" />
                <text x={x} y={y - 23}
                  textAnchor="middle" fontSize="9.5" fontWeight="700"
                  fill={active ? '#07091a' : '#f5c842'}>
                  ${Math.round(trip.totalCost)}
                </text>

                {/* City name */}
                <text x={x} y={y + 21}
                  textAnchor="middle" fontSize="8" fontWeight={active ? '700' : '400'}
                  fill={active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)'}>
                  {trip.destination}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Slide-up preview card */}
      <div className={`map-preview ${activeTrip ? 'map-preview--open' : ''}`}>
        {activeTrip && (
          <>
            <div className="map-preview-dest">{activeTrip.destination}
              <span className="map-preview-country">{activeTrip.country}</span>
            </div>
            <div className="map-preview-row">
              <span className="map-preview-airline">
                <span role="img" aria-label="plane">✈</span> {activeTrip.flight.airline}
              </span>
              <span className="map-preview-total">${activeTrip.totalCost.toFixed(0)} total</span>
            </div>
            <div className="map-preview-sub">
              <span role="img" aria-label="hotel">🏨</span>{' '}
              {activeTrip.hotel.name.split(' ').slice(0, 3).join(' ')} ·{' '}
              {activeTrip.nights} nights · {activeTrip.dates.label}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
