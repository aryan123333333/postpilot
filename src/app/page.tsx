'use client';

import { useState, useCallback } from 'react';
import NebulaCanvas, { THEMES, type Theme } from '@/components/nebula/NebulaCanvas';

export default function Home() {
  const [themeIndex, setThemeIndex] = useState(0);
  const [particleCount, setParticleCount] = useState(400);
  const [connectionDistance, setConnectionDistance] = useState(100);
  const [mouseForce, setMouseForce] = useState(0.8);
  const [trailLength, setTrailLength] = useState(0.06);
  const [speed, setSpeed] = useState(1);
  const [showConnections, setShowConnections] = useState(true);
  const [showPanel, setShowPanel] = useState(true);
  const [stats, setStats] = useState({ fps: 0, particles: 0 });
  const [showHelp, setShowHelp] = useState(true);

  const handleStatsUpdate = useCallback((s: { fps: number; particles: number }) => {
    setStats(s);
  }, []);

  const currentTheme = THEMES[themeIndex];

  return (
    <main className="relative min-h-screen overflow-hidden bg-black select-none">
      {/* Particle Canvas - Full Screen */}
      <NebulaCanvas
        theme={currentTheme}
        particleCount={particleCount}
        connectionDistance={connectionDistance}
        mouseForce={mouseForce}
        trailLength={trailLength}
        speed={speed}
        showConnections={showConnections}
        onStatsUpdate={handleStatsUpdate}
      />

      {/* Background gradient overlay */}
      <div
        className="fixed inset-0 pointer-events-none transition-opacity duration-1000"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, hsla(${currentTheme.bgHue}, 50%, 8%, 0.3) 0%, transparent 70%)`,
        }}
      />

      {/* Title & Stats - Top Left */}
      <div className="fixed top-6 left-6 z-10 animate-fade-in-up">
        <div className="glass-panel rounded-2xl p-5">
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{
              background: `linear-gradient(135deg, hsl(${currentTheme.hueRange[0]}, ${currentTheme.saturation}%, ${currentTheme.lightness}%), hsl(${currentTheme.hueRange[1]}, ${currentTheme.saturation}%, ${currentTheme.lightness}%))`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Nebula Engine
          </h1>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            Real-time generative particle physics
          </p>
          <div className="flex gap-4 mt-3 text-xs font-mono">
            <span className="animate-soft-pulse">
              <span className="text-muted-foreground">FPS</span>{' '}
              <span className="text-foreground font-semibold">{stats.fps}</span>
            </span>
            <span className="animate-soft-pulse" style={{ animationDelay: '1s' }}>
              <span className="text-muted-foreground">Particles</span>{' '}
              <span className="text-foreground font-semibold">{stats.particles}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Help Tooltip - Top Center */}
      {showHelp && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-10 animate-fade-in-up-delay-1">
          <div className="glass-panel rounded-xl px-4 py-2.5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="text-foreground font-medium">Hover</span>
            <span>to orbit</span>
            <span className="w-px h-3 bg-border" />
            <span className="text-foreground font-medium">Click</span>
            <span>to attract & burst</span>
            <span className="w-px h-3 bg-border" />
            <span className="text-foreground font-medium">Hold</span>
            <span>to stream</span>
            <button
              onClick={() => setShowHelp(false)}
              className="ml-2 text-muted-foreground/50 hover:text-foreground transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Toggle Panel Button - Top Right */}
      <div className="fixed top-6 right-6 z-20 animate-fade-in-up-delay-2">
        <button
          onClick={() => setShowPanel(!showPanel)}
          className="glass-panel rounded-xl w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-white/5 transition-all"
          title="Toggle Controls"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground"
          >
            {showPanel ? (
              <>
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </>
            ) : (
              <>
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Control Panel - Right Side */}
      {showPanel && (
        <div className="fixed top-20 right-6 z-10 w-72 animate-fade-in-up-delay-3">
          <div className="glass-panel rounded-2xl p-5 space-y-5 max-h-[calc(100vh-8rem)] overflow-y-auto">
            {/* Theme Selector */}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Theme
              </label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {THEMES.map((t, i) => (
                  <button
                    key={t.name}
                    onClick={() => setThemeIndex(i)}
                    className={`relative rounded-lg py-2 text-xs font-medium cursor-pointer transition-all ${
                      i === themeIndex
                        ? 'theme-btn-active text-foreground'
                        : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground'
                    }`}
                    style={
                      i === themeIndex
                        ? ({
                            '--glow-color': t.glowColor,
                            borderColor: t.glowColor,
                          } as React.CSSProperties)
                        : undefined
                    }
                  >
                    <div
                      className="w-3 h-3 rounded-full mx-auto mb-1"
                      style={{
                        background: `linear-gradient(135deg, hsl(${t.hueRange[0]}, ${t.saturation}%, ${t.lightness}%), hsl(${t.hueRange[1]}, ${t.saturation}%, ${t.lightness}%))`,
                        boxShadow: i === themeIndex ? `0 0 8px ${t.glowColor}` : 'none',
                      }}
                    />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-border" />

            {/* Particle Count */}
            <div>
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Particles
                </label>
                <span className="text-xs font-mono text-foreground">{particleCount}</span>
              </div>
              <input
                type="range"
                min={50}
                max={800}
                step={10}
                value={particleCount}
                onChange={(e) => setParticleCount(Number(e.target.value))}
                className="w-full mt-2 accent-[var(--glow-color)]"
                style={{ '--glow-color': currentTheme.glowColor } as React.CSSProperties}
              />
            </div>

            {/* Speed */}
            <div>
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Speed
                </label>
                <span className="text-xs font-mono text-foreground">{speed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={3}
                step={0.1}
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full mt-2"
              />
            </div>

            {/* Trail Length */}
            <div>
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Trail Length
                </label>
                <span className="text-xs font-mono text-foreground">{(trailLength * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min={0.01}
                max={0.2}
                step={0.01}
                value={trailLength}
                onChange={(e) => setTrailLength(Number(e.target.value))}
                className="w-full mt-2"
              />
            </div>

            {/* Connection Distance */}
            <div>
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Connection Range
                </label>
                <span className="text-xs font-mono text-foreground">{connectionDistance}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={200}
                step={10}
                value={connectionDistance}
                onChange={(e) => setConnectionDistance(Number(e.target.value))}
                className="w-full mt-2"
              />
            </div>

            {/* Mouse Force */}
            <div>
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Mouse Force
                </label>
                <span className="text-xs font-mono text-foreground">{mouseForce.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={3}
                step={0.1}
                value={mouseForce}
                onChange={(e) => setMouseForce(Number(e.target.value))}
                className="w-full mt-2"
              />
            </div>

            {/* Divider */}
            <div className="h-px bg-border" />

            {/* Toggles */}
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Connections
              </label>
              <button
                onClick={() => setShowConnections(!showConnections)}
                className={`relative w-10 h-5 rounded-full transition-all cursor-pointer ${
                  showConnections ? 'bg-white/20' : 'bg-white/5'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
                    showConnections ? 'left-5.5' : 'left-0.5'
                  }`}
                  style={{
                    background: showConnections
                      ? `linear-gradient(135deg, hsl(${currentTheme.hueRange[0]}, ${currentTheme.saturation}%, ${currentTheme.lightness}%), hsl(${currentTheme.hueRange[1]}, ${currentTheme.saturation}%, ${currentTheme.lightness}%))`
                      : 'rgba(255,255,255,0.2)',
                    boxShadow: showConnections ? `0 0 6px ${currentTheme.glowColor}` : 'none',
                  }}
                />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setParticleCount(800);
                  setSpeed(2);
                  setTrailLength(0.02);
                  setConnectionDistance(150);
                  setMouseForce(2);
                }}
                className="glass-panel rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all cursor-pointer"
              >
                Chaos Mode
              </button>
              <button
                onClick={() => {
                  setParticleCount(200);
                  setSpeed(0.5);
                  setTrailLength(0.01);
                  setConnectionDistance(200);
                  setMouseForce(0.3);
                }}
                className="glass-panel rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all cursor-pointer"
              >
                Zen Mode
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Info Bar */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-10">
        <div className="glass-panel rounded-full px-5 py-2 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{
                background: `hsl(${currentTheme.hueRange[0]}, ${currentTheme.saturation}%, ${currentTheme.lightness}%)`,
                boxShadow: `0 0 6px ${currentTheme.glowColor}`,
              }}
            />
            <span>{currentTheme.label}</span>
          </div>
          <div className="w-px h-3 bg-border" />
          <span className="font-mono">{stats.particles} particles</span>
          <div className="w-px h-3 bg-border" />
          <span className="font-mono">{stats.fps} fps</span>
          <div className="w-px h-3 bg-border hidden sm:block" />
          <span className="hidden sm:block">Nebula Engine v1.0</span>
        </div>
      </div>
    </main>
  );
}
