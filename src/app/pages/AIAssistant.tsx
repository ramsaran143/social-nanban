import React from 'react';
import { RAGChat } from '../components/RAGChat';
import { Bot, Sparkles, Target, Zap, Activity } from 'lucide-react';

export function AIAssistant() {
  return (
    <div style={{
      height: 'calc(100vh - 64px)',
      display: 'flex',
      flexDirection: 'column',
      padding: '36px 40px',
      gap: '24px',
      background: 'var(--c-bg)'
    }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: 'rgba(109,100,255,0.12)', border: '1px solid rgba(109,100,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(109,100,255,0.1)'
        }}>
          <Bot size={24} color="var(--c-prim-2)" />
        </div>
        <div>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--c-text-3)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>Strategic Intelligence</p>
          <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 28, fontWeight: 800, color: 'var(--c-text)', letterSpacing: '-0.02em', margin: '4px 0 0' }}>
            AI Strategist
          </h1>
        </div>
      </div>

      {/* Feature Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px'
      }}>
        {[
          { label: 'Personalized', desc: 'Uses your real posts and metrics', icon: Sparkles, color: '#6d64ff' },
          { label: 'Context Aware', desc: 'Remembers your conversation', icon: Zap, color: '#00d4ff' },
          { label: 'Data Backed', desc: 'References actual numbers', icon: Activity, color: '#00e5a0' },
          { label: 'Actionable', desc: 'Clear next steps always', icon: Target, color: '#ffb547' }
        ].map((item, i) => (
          <div key={i} style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 14,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}>
            <div style={{ padding: '8px', background: `${item.color}15`, borderRadius: '10px' }}>
              <item.icon size={18} color={item.color} />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-text)', margin: '0 0 4px' }}>
                {item.label}
              </p>
              <p style={{ fontSize: 11, color: 'var(--c-text-3)', margin: 0, fontWeight: 500 }}>
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, minHeight: 0, boxShadow: '0 20px 80px rgba(0,0,0,0.4)', borderRadius: '16px', overflow: 'hidden' }}>
        <RAGChat />
      </div>
    </div>
  );
}
