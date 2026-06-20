'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  hue: number;
  saturation: number;
  lightness: number;
  alpha: number;
}

interface Theme {
  name: string;
  label: string;
  bgHue: number;
  hueRange: [number, number];
  saturation: number;
  lightness: number;
  glowColor: string;
  connectionColor: string;
  trailAlpha: number;
}

interface MouseState {
  x: number;
  y: number;
  isDown: boolean;
  isOnCanvas: boolean;
}

// ─── Theme Definitions ───────────────────────────────────────
const THEMES: Theme[] = [
  {
    name: 'aurora',
    label: 'Aurora',
    bgHue: 260,
    hueRange: [120, 280],
    saturation: 80,
    lightness: 65,
    glowColor: 'rgba(99, 102, 241, 0.6)',
    connectionColor: 'rgba(139, 92, 246, __ALPHA__)',
    trailAlpha: 0.06,
  },
  {
    name: 'ember',
    label: 'Ember',
    bgHue: 15,
    hueRange: [0, 45],
    saturation: 95,
    lightness: 55,
    glowColor: 'rgba(249, 115, 22, 0.6)',
    connectionColor: 'rgba(239, 68, 68, __ALPHA__)',
    trailAlpha: 0.05,
  },
  {
    name: 'ocean',
    label: 'Ocean',
    bgHue: 200,
    hueRange: [170, 230],
    saturation: 75,
    lightness: 60,
    glowColor: 'rgba(6, 182, 212, 0.6)',
    connectionColor: 'rgba(34, 211, 238, __ALPHA__)',
    trailAlpha: 0.07,
  },
  {
    name: 'void',
    label: 'Void',
    bgHue: 0,
    hueRange: [250, 310],
    saturation: 60,
    lightness: 70,
    glowColor: 'rgba(168, 85, 247, 0.6)',
    connectionColor: 'rgba(192, 132, 252, __ALPHA__)',
    trailAlpha: 0.04,
  },
  {
    name: 'neon',
    label: 'Neon',
    bgHue: 320,
    hueRange: [300, 360],
    saturation: 100,
    lightness: 60,
    glowColor: 'rgba(236, 72, 153, 0.6)',
    connectionColor: 'rgba(244, 114, 182, __ALPHA__)',
    trailAlpha: 0.05,
  },
];

// ─── Config ──────────────────────────────────────────────────
const MAX_PARTICLES = 800;
const CONNECTION_DISTANCE = 100;
const MOUSE_FORCE_RADIUS = 200;
const MOUSE_FORCE_STRENGTH = 0.8;
const SPAWN_RATE = 3;

// ─── Component ───────────────────────────────────────────────
interface NebulaCanvasProps {
  theme: Theme;
  particleCount: number;
  connectionDistance: number;
  mouseForce: number;
  trailLength: number;
  speed: number;
  showConnections: boolean;
  onStatsUpdate: (stats: { fps: number; particles: number }) => void;
}

export default function NebulaCanvas({
  theme,
  particleCount,
  connectionDistance,
  mouseForce,
  trailLength,
  speed,
  showConnections,
  onStatsUpdate,
}: NebulaCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef<MouseState>({ x: 0, y: 0, isDown: false, isOnCanvas: false });
  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const fpsCounterRef = useRef<number[]>([]);

  // Spawn a single particle
  const spawnParticle = useCallback(
    (x?: number, y?: number, burst?: boolean): Particle => {
      const w = canvasRef.current?.width || window.innerWidth;
      const h = canvasRef.current?.height || window.innerHeight;
      const px = x ?? Math.random() * w;
      const py = y ?? Math.random() * h;
      const angle = Math.random() * Math.PI * 2;
      const velocity = burst ? (2 + Math.random() * 4) * speed : (0.2 + Math.random() * 0.8) * speed;
      const [hueMin, hueMax] = theme.hueRange;
      const hue = hueMin + Math.random() * (hueMax - hueMin);

      return {
        x: px,
        y: py,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        size: burst ? 1 + Math.random() * 3 : 0.5 + Math.random() * 2.5,
        life: 0,
        maxLife: 200 + Math.random() * 400,
        hue,
        saturation: theme.saturation + (Math.random() - 0.5) * 20,
        lightness: theme.lightness + (Math.random() - 0.5) * 15,
        alpha: 0,
      };
    },
    [theme, speed]
  );

  // Initialize particles
  useEffect(() => {
    const particles: Particle[] = [];
    for (let i = 0; i < Math.min(particleCount, MAX_PARTICLES); i++) {
      const p = spawnParticle();
      p.life = Math.random() * p.maxLife * 0.5; // stagger initial life
      p.alpha = Math.min(1, (p.life / 30)) * 0.8;
      particles.push(p);
    }
    particlesRef.current = particles;
  }, [particleCount, spawnParticle]);

  // Mouse/touch handlers
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.isOnCanvas = true;
    }
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    mouseRef.current.isDown = true;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // Burst of particles on click
      const burst = particlesRef.current;
      const burstCount = 30;
      for (let i = 0; i < burstCount && burst.length < MAX_PARTICLES; i++) {
        burst.push(spawnParticle(x, y, true));
      }
    }
  }, [spawnParticle]);

  const handlePointerUp = useCallback(() => {
    mouseRef.current.isDown = false;
  }, []);

  const handlePointerLeave = useCallback(() => {
    mouseRef.current.isOnCanvas = false;
    mouseRef.current.isDown = false;
  }, []);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const animate = (timestamp: number) => {
      // FPS tracking
      if (lastTimeRef.current > 0) {
        const delta = timestamp - lastTimeRef.current;
        fpsCounterRef.current.push(1000 / delta);
        if (fpsCounterRef.current.length > 30) fpsCounterRef.current.shift();
      }
      lastTimeRef.current = timestamp;

      const w = window.innerWidth;
      const h = window.innerHeight;
      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      // Trail effect - fade previous frame
      ctx.fillStyle = `hsla(${theme.bgHue}, 30%, 3%, ${1 - trailLength})`;
      ctx.fillRect(0, 0, w, h);

      // Spawn new particles to maintain count
      while (particles.length < Math.min(particleCount, MAX_PARTICLES)) {
        particles.push(spawnParticle());
      }

      // Continuous spawn at mouse if held down
      if (mouse.isDown && mouse.isOnCanvas) {
        for (let i = 0; i < SPAWN_RATE && particles.length < MAX_PARTICLES; i++) {
          particles.push(spawnParticle(
            mouse.x + (Math.random() - 0.5) * 20,
            mouse.y + (Math.random() - 0.5) * 20,
            true
          ));
        }
      }

      // Update & draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;

        // Mouse interaction
        if (mouse.isOnCanvas) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < MOUSE_FORCE_RADIUS && dist > 1) {
            const force = (1 - dist / MOUSE_FORCE_RADIUS) * MOUSE_FORCE_STRENGTH * mouseForce;
            if (mouse.isDown) {
              // Attract when clicking
              p.vx += (dx / dist) * force;
              p.vy += (dy / dist) * force;
            } else {
              // Gentle orbit when hovering
              p.vx += (-dy / dist) * force * 0.5;
              p.vy += (dx / dist) * force * 0.5;
            }
          }
        }

        // Apply velocity
        p.x += p.vx;
        p.y += p.vy;

        // Damping
        p.vx *= 0.99;
        p.vy *= 0.99;

        // Fade in/out
        const lifeRatio = p.life / p.maxLife;
        if (lifeRatio < 0.1) {
          p.alpha = (lifeRatio / 0.1) * 0.8;
        } else if (lifeRatio > 0.8) {
          p.alpha = ((1 - lifeRatio) / 0.2) * 0.8;
        } else {
          p.alpha = 0.8;
        }

        // Remove dead or out-of-bounds particles
        if (p.life >= p.maxLife || p.x < -50 || p.x > w + 50 || p.y < -50 || p.y > h + 50) {
          particles.splice(i, 1);
          continue;
        }

        // Draw particle with glow
        const size = p.size * (0.8 + Math.sin(p.life * 0.05) * 0.2);

        // Outer glow
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 4);
        gradient.addColorStop(0, `hsla(${p.hue}, ${p.saturation}%, ${p.lightness}%, ${p.alpha * 0.15})`);
        gradient.addColorStop(1, `hsla(${p.hue}, ${p.saturation}%, ${p.lightness}%, 0)`);
        ctx.fillStyle = gradient;
        ctx.arc(p.x, p.y, size * 4, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue}, ${p.saturation}%, ${p.lightness + 15}%, ${p.alpha})`;
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw connections
      if (showConnections) {
        const connDist = connectionDistance;
        const connColor = theme.connectionColor;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const a = particles[i];
            const b = particles[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < connDist) {
              const alpha = (1 - dist / connDist) * 0.15 * Math.min(a.alpha, b.alpha);
              ctx.beginPath();
              ctx.strokeStyle = connColor.replace('__ALPHA__', alpha.toFixed(3));
              ctx.lineWidth = 0.5;
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        }
      }

      // Mouse cursor glow
      if (mouse.isOnCanvas) {
        const cursorGradient = ctx.createRadialGradient(
          mouse.x, mouse.y, 0,
          mouse.x, mouse.y, MOUSE_FORCE_RADIUS
        );
        if (mouse.isDown) {
          cursorGradient.addColorStop(0, `hsla(${theme.hueRange[0] + (theme.hueRange[1] - theme.hueRange[0]) * 0.5}, ${theme.saturation}%, ${theme.lightness}%, 0.08)`);
          cursorGradient.addColorStop(1, 'transparent');
        } else {
          cursorGradient.addColorStop(0, 'rgba(255, 255, 255, 0.03)');
          cursorGradient.addColorStop(1, 'transparent');
        }
        ctx.beginPath();
        ctx.fillStyle = cursorGradient;
        ctx.arc(mouse.x, mouse.y, MOUSE_FORCE_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }

      // Report stats
      const fps = fpsCounterRef.current.length > 0
        ? fpsCounterRef.current.reduce((a, b) => a + b, 0) / fpsCounterRef.current.length
        : 60;
      onStatsUpdate({ fps: Math.round(fps), particles: particles.length });

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [theme, particleCount, connectionDistance, mouseForce, trailLength, speed, showConnections, spawnParticle, onStatsUpdate]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 cursor-crosshair"
      style={{ touchAction: 'none' }}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
    />
  );
}

export { THEMES };
export type { Theme };
