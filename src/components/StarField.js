// src/components/StarField.js
import React, { useEffect, useRef } from 'react';

export default function StarField() {
  const canvasRef = useRef(null);
  const mouse     = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const stars = Array.from({ length: 220 }, () => ({
      x:     Math.random(),
      y:     Math.random(),
      r:     Math.random() * 1.4 + 0.25,
      vx:    (Math.random() - 0.5) * 0.00008,
      vy:    -(Math.random() * 0.00010 + 0.00002),
      o:     Math.random() * 0.65 + 0.15,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinklePhase: Math.random() * Math.PI * 2,
    }));

    function onMouseMove(e) {
      mouse.current.x = (e.clientX / window.innerWidth)  - 0.5;
      mouse.current.y = (e.clientY / window.innerHeight) - 0.5;
    }
    window.addEventListener('mousemove', onMouseMove);

    let tick = 0;
    function draw() {
      tick++;
      const w  = canvas.width;
      const h  = canvas.height;
      const mx = mouse.current.x * 18;
      const my = mouse.current.y * 18;

      ctx.clearRect(0, 0, w, h);

      stars.forEach(s => {
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < 0) s.x = 1;
        if (s.x > 1) s.x = 0;
        if (s.y < 0) { s.y = 1; s.x = Math.random(); }

        const twinkle = 0.85 + 0.15 * Math.sin(tick * s.twinkleSpeed + s.twinklePhase);
        const px = s.x * w + mx * s.r * 0.4;
        const py = s.y * h + my * s.r * 0.4;
        const opacity = s.o * twinkle;

        ctx.beginPath();
        ctx.arc(px, py, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${opacity.toFixed(2)})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="star-field" />;
}
