// src/components/LoadingPlane.js
import React from 'react';

export default function LoadingPlane({ message }) {
  return (
    <div className="lp-wrap">
      <div className="lp-scene">
        <svg className="lp-svg" viewBox="0 0 220 180" xmlns="http://www.w3.org/2000/svg">
          {/* Globe outline */}
          <circle cx="110" cy="90" r="72" fill="none" stroke="rgba(245,200,66,0.2)" strokeWidth="1.5" />
          {/* Latitude rings */}
          <ellipse cx="110" cy="90" rx="72" ry="26"  fill="none" stroke="rgba(245,200,66,0.12)" strokeWidth="1" />
          <ellipse cx="110" cy="90" rx="72" ry="52"  fill="none" stroke="rgba(245,200,66,0.09)" strokeWidth="1" />
          {/* Meridian */}
          <line x1="110" y1="18"  x2="110" y2="162" stroke="rgba(245,200,66,0.12)" strokeWidth="1" />
          <line x1="38"  y1="90"  x2="182" y2="90"  stroke="rgba(245,200,66,0.12)" strokeWidth="1" />

          {/* Dotted arc (flight path) */}
          <path
            id="lp-arc"
            d="M 48 130 C 70 20, 150 20, 172 130"
            fill="none"
            stroke="rgba(245,200,66,0.45)"
            strokeWidth="1.5"
            strokeDasharray="5 4"
          />

          {/* Origin dot */}
          <circle cx="48" cy="130" r="4.5" fill="rgba(245,200,66,0.9)" />
          {/* Destination dot — pulsing */}
          <circle cx="172" cy="130" r="4.5" fill="rgba(245,200,66,0.9)" />
          <circle cx="172" cy="130" r="4.5" fill="none" stroke="rgba(245,200,66,0.4)" strokeWidth="4">
            <animate attributeName="r"            from="4.5" to="14" dur="1.4s" repeatCount="indefinite" />
            <animate attributeName="stroke-opacity" from="0.4" to="0"  dur="1.4s" repeatCount="indefinite" />
          </circle>

          {/* Animated plane emoji along path */}
          <text fontSize="15" fill="white" style={{ filter: 'drop-shadow(0 0 4px rgba(245,200,66,0.7))' }}>
            <textPath href="#lp-arc" startOffset="0%">
              ✈
              <animate attributeName="startOffset" from="0%" to="88%" dur="2.8s" repeatCount="indefinite" />
            </textPath>
          </text>
        </svg>
      </div>

      <p className="lp-msg">{message}</p>

      <div className="lp-dots">
        <span /><span /><span />
      </div>
    </div>
  );
}
