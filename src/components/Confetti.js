// src/components/Confetti.js  — pure-canvas confetti, zero dependencies
import React, { useEffect, useRef } from 'react';

const COLORS = ['#f5c842','#ff6b6b','#4ade80','#60a5fa','#f59e0b','#a78bfa','#fb7185','#34d399'];

export default function Confetti({ onDone }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = Array.from({ length: 140 }, (_, i) => ({
      x:     (Math.random() * 0.8 + 0.1) * canvas.width,
      y:     -20 - Math.random() * 120,
      w:     Math.random() * 11 + 4,
      h:     Math.random() * 5  + 2,
      color: COLORS[i % COLORS.length],
      vx:    (Math.random() - 0.5) * 5,
      vy:    Math.random() * 3 + 2,
      rot:   Math.random() * 360,
      vrot:  (Math.random() - 0.5) * 9,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
    }));

    let animId;
    let finished = false;

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let anyAlive = false;

      pieces.forEach(p => {
        if (p.y > canvas.height + 20) return;
        anyAlive = true;
        p.x   += p.vx;
        p.y   += p.vy;
        p.vy  += 0.07;     // gravity
        p.vx  *= 0.995;    // slight air resistance
        p.rot += p.vrot;

        const alpha = Math.max(0, 1 - (p.y / canvas.height) * 1.1);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot * Math.PI / 180);
        ctx.fillStyle = p.color;
        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
        ctx.restore();
      });

      if (anyAlive && !finished) {
        animId = requestAnimationFrame(animate);
      } else if (!finished) {
        finished = true;
        if (onDone) onDone();
      }
    }
    animate();

    return () => { finished = true; cancelAnimationFrame(animId); };
  }, [onDone]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none' }}
    />
  );
}
