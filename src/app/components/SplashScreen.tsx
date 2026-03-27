import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, Brain, TrendingUp } from 'lucide-react';

interface SplashProps {
  onComplete: () => void;
}

const LINES = [
  'Initializing AI Engine...',
  'Connecting to Claude...',
  'Loading Strategy Modules...',
  'Ready.',
];

const SplashScreen: React.FC<SplashProps> = ({ onComplete }) => {
  const [exit, setExit] = useState(false);
  const [line, setLine] = useState(0);

  useEffect(() => {
    // Cycle boot lines
    const lineTimer = setInterval(() => {
      setLine(prev => {
        if (prev < LINES.length - 1) return prev + 1;
        clearInterval(lineTimer);
        return prev;
      });
    }, 500);

    // Trigger exit animation after 3s total
    const exitTimer = setTimeout(() => setExit(true), 3000);

    // Unmount after exit animation finishes (0.6s)
    const doneTimer = setTimeout(onComplete, 3700);

    return () => {
      clearInterval(lineTimer);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  // Random particle positions (seeded for SSR safety)
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: `${(i * 37 + 11) % 100}%`,
    delay: `${(i * 0.4) % 4}s`,
    duration: `${6 + (i * 0.7) % 5}s`,
    size: `${4 + (i * 3) % 10}px`,
    opacity: 0.2 + (i % 5) * 0.1,
  }));

  return (
    <div
      className={`splash-screen ${exit ? 'exit' : ''}`}
      style={{ cursor: 'none' }}
    >
      {/* Ambient grid */}
      <div className="splash-grid" />

      {/* Orbs */}
      <div className="splash-orb-1" />
      <div className="splash-orb-2" />
      <div className="splash-orb-3" />

      {/* Floating particles */}
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: p.left,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: 'rgba(109,100,255,0.5)',
            animation: `particle-float ${p.duration} ${p.delay} linear infinite`,
            boxShadow: '0 0 6px rgba(109,100,255,0.5)',
          }}
        />
      ))}

      {/* Center Content */}
      <div className="splash-content">
        {/* Icon with rings */}
        <div className="splash-logo-wrap">
          <div className="splash-ring" />
          <div className="splash-ring splash-ring-2" />
          <div className="splash-logo-icon">
            <Sparkles size={44} color="white" strokeWidth={1.5} />
          </div>
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center' }}>
          <div className="splash-tagline">
            Social Media AI Platform
          </div>

          <h1 className="splash-title">
            <span className="splash-title-grad">Social Nanban</span>
          </h1>

          <p className="splash-subtitle">
            Where Artificial Intelligence meets Social Strategy
          </p>
        </div>

        {/* Feature chips */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', animation: 'splash-sub-in 0.8s ease 1.4s both', opacity: 0 }}>
          {[
            { icon: Brain, label: 'RAG Intelligence' },
            { icon: Zap, label: 'Claude AI Engine' },
            { icon: TrendingUp, label: 'Real-time Trends' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px',
              background: 'rgba(109,100,255,0.1)',
              border: '1px solid rgba(109,100,255,0.2)',
              borderRadius: '100px',
              fontSize: '12px', fontWeight: 600, color: '#9f96ff',
            }}>
              <Icon size={13} />
              {label}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ textAlign: 'center', animation: 'splash-sub-in 0.5s ease 1.6s both', opacity: 0 }}>
          <div className="splash-bar-wrap">
            <div className="splash-bar" />
          </div>
          <div style={{ marginTop: '12px', fontSize: '11px', fontWeight: 600, color: 'rgba(109,100,255,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase', minHeight: '16px', transition: 'all 0.3s ease' }}>
            {LINES[line]}
          </div>
        </div>
      </div>

      {/* Corner accents */}
      <div style={{ position: 'absolute', top: '24px', left: '24px', opacity: 0.3 }}>
        <div style={{ width: '30px', height: '2px', background: 'var(--c-prim)', borderRadius: '1px', marginBottom: '4px' }} />
        <div style={{ width: '2px', height: '30px', background: 'var(--c-prim)', borderRadius: '1px' }} />
      </div>
      <div style={{ position: 'absolute', top: '24px', right: '24px', opacity: 0.3 }}>
        <div style={{ width: '30px', height: '2px', background: 'var(--c-accent)', borderRadius: '1px', marginBottom: '4px', marginLeft: 'auto' }} />
        <div style={{ width: '2px', height: '30px', background: 'var(--c-accent)', borderRadius: '1px', marginLeft: 'auto' }} />
      </div>
      <div style={{ position: 'absolute', bottom: '24px', left: '24px', opacity: 0.3 }}>
        <div style={{ width: '2px', height: '30px', background: 'var(--c-prim)', borderRadius: '1px', marginBottom: '4px' }} />
        <div style={{ width: '30px', height: '2px', background: 'var(--c-prim)', borderRadius: '1px' }} />
      </div>
      <div style={{ position: 'absolute', bottom: '24px', right: '24px', opacity: 0.3 }}>
        <div style={{ width: '2px', height: '30px', background: 'var(--c-accent)', borderRadius: '1px', marginBottom: '4px', marginLeft: 'auto' }} />
        <div style={{ width: '30px', height: '2px', background: 'var(--c-accent)', borderRadius: '1px', marginLeft: 'auto' }} />
      </div>
    </div>
  );
};

export default SplashScreen;
