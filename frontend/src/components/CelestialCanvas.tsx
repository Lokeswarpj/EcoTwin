import React, { useEffect, useRef } from 'react';

export const CelestialCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let stars: Array<{
      x: number;
      y: number;
      radius: number;
      alpha: number;
      twinkleSpeed: number;
      twinkleDir: number;
      z: number;
    }> = [];

    function initStars() {
      stars = [];
      const count = Math.floor((width * height) / 4500);
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.5 + 0.3,
          alpha: Math.random() * 0.8 + 0.2,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinkleDir: Math.random() > 0.5 ? 1 : -1,
          z: Math.random() * 0.8 + 0.2,
        });
      }
    }

    initStars();

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStars();
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetX = (e.clientX - width / 2) * 0.04;
      targetY = (e.clientY - height / 2) * 0.04;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    let animId: number;
    const planetContainer = document.getElementById('planet-canvas-container');

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      if (planetContainer) {
        planetContainer.style.transform = `translate3d(${-mouseX * 1.5}px, ${-mouseY * 1.5}px, 0)`;
      }

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.alpha += star.twinkleSpeed * star.twinkleDir;
        if (star.alpha > 0.95) {
          star.alpha = 0.95;
          star.twinkleDir = -1;
        } else if (star.alpha < 0.15) {
          star.alpha = 0.15;
          star.twinkleDir = 1;
        }

        const drawX = (star.x + mouseX * star.z * 1.2 + width) % width;
        const drawY = (star.y + mouseY * star.z * 1.2 + height) % height;

        ctx.beginPath();
        ctx.arc(drawX, drawY, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 240, 255, ${star.alpha})`;
        ctx.fill();

        if (star.radius > 1.2) {
          ctx.beginPath();
          ctx.arc(drawX, drawY, star.radius * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(96, 165, 250, ${star.alpha * 0.25})`;
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <>
      <canvas id="space-canvas" ref={canvasRef} />
      <div className="grid-pattern fixed inset-0 z-[-2]" />
      <div id="planet-canvas-container" className="opacity-65">
        <div className="relative w-[800px] h-[800px] rounded-full bg-blue-600/15 blur-[120px] animate-pulse" />
        <div className="absolute w-[640px] h-[640px] rounded-full border border-blue-400/20 rotate-[15deg] animate-spin-slow" />
        <div className="absolute w-[600px] h-[600px] rounded-full border border-cyan-400/15 rotate-[-45deg] animate-spin-reverse-slow" />
        <div className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-br from-blue-900/40 via-blue-950/20 to-transparent shadow-[inset_0_0_120px_rgba(59,130,246,0.35)]" />
      </div>
    </>
  );
};
