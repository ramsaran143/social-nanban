import React, { useEffect, useState } from 'react';
import { supabase } from '../data/supabase';
import { Activity, Zap, DollarSign, Clock, ShieldCheck, Database } from 'lucide-react';

const S = {
  container: { padding: '36px 40px', background: 'var(--c-bg)', minHeight: '100vh' } as React.CSSProperties,
  card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '24px' } as React.CSSProperties,
  label: { fontSize: '11px', fontWeight: 700, color: 'var(--c-text-3)', textTransform: 'uppercase' as const, letterSpacing: '0.12em', margin: '0 0 8px' },
};

export function LLMDashboard() {
  const [usage, setUsage] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ totalCalls: 0, totalTokens: 0, totalCost: 0, avgResponseTime: 0 });

  useEffect(() => {
    async function loadUsage() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('llm_usage').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(100);
      setUsage(data || []);
      if (data && data.length > 0) {
        setTotals({
          totalCalls: data.length,
          totalTokens: data.reduce((s, r) => s + (r.total_tokens || 0), 0),
          totalCost: data.reduce((s, r) => s + (r.estimated_cost_usd || 0), 0),
          avgResponseTime: Math.round(data.reduce((s, r) => s + (r.response_time_ms || 0), 0) / data.length)
        });
      }
      setLoading(false);
    }
    loadUsage();
  }, []);

  const modelUsage = usage.reduce((acc: any, row: any) => { acc[row.model_used] = (acc[row.model_used] || 0) + 1; return acc; }, {});
  const featureUsage = usage.reduce((acc: any, row: any) => { acc[row.feature_name] = (acc[row.feature_name] || 0) + 1; return acc; }, {});

  return (
    <div style={S.container}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(109,100,255,0.12)', border: '1px solid rgba(109,100,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Activity size={24} color="var(--c-prim-2)" />
        </div>
        <div>
          <label style={S.label}>System Metrics</label>
          <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 28, fontWeight: 800, color: 'var(--c-text)', letterSpacing: '-0.02em', margin: '4px 0 0' }}>AI Usage Analytics</h1>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
        {[
          { label: 'Total Calls', value: totals.totalCalls, icon: Zap, color: '#6d64ff' },
          { label: 'Tokens Consumed', value: totals.totalTokens.toLocaleString(), icon: Database, color: '#00d4ff' },
          { label: 'Estimated Cost', value: '$' + totals.totalCost.toFixed(4), icon: DollarSign, color: '#00e5a0' },
          { label: 'Avg Latency', value: totals.avgResponseTime + 'ms', icon: Clock, color: '#ffb547' }
        ].map((card, i) => (
          <div key={i} style={S.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
               <card.icon size={20} color={card.color} />
               <p style={{ ...S.label, margin: 0 }}>{card.label}</p>
            </div>
            <p style={{ fontSize: 26, fontWeight: 800, color: 'var(--c-text)', margin: 0 }}>{card.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 2fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={S.card}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: 'var(--c-text-2)' }}>Model Distribution</h3>
            {Object.entries(modelUsage).map(([model, count]: any) => (
              <div key={model} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: 13, color: 'var(--c-text-2)', fontWeight: 600 }}>{model}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--c-prim-2)' }}>{count}</span>
              </div>
            ))}
          </div>
          <div style={S.card}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: 'var(--c-text-2)' }}>Feature Distribution</h3>
            {Object.entries(featureUsage).map(([feat, count]: any) => (
              <div key={feat} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: 13, color: 'var(--c-text-2)', fontWeight: 600 }}>{feat}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--c-accent)' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--c-text-2)' }}>Recent AI Calls</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  {['Feature', 'Model', 'Tokens', 'Cost', 'Latency', 'Time'].map(h => <th key={h} style={{ textAlign: 'left', padding: '14px 24px', fontSize: '11px', fontWeight: 700, color: 'var(--c-text-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {usage.slice(0, 20).map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '16px 24px', fontSize: 13, color: 'var(--c-text)', fontWeight: 600 }}>{row.feature_name}</td>
                    <td style={{ padding: '16px 24px', fontSize: 12, color: 'var(--c-text-3)' }}>{row.model_used}</td>
                    <td style={{ padding: '16px 24px', fontSize: 13, color: 'var(--c-text)' }}>{row.total_tokens}</td>
                    <td style={{ padding: '16px 24px', fontSize: 13, color: 'var(--c-text-2)', fontWeight: 800 }}>${row.estimated_cost_usd?.toFixed(5)}</td>
                    <td style={{ padding: '16px 24px', fontSize: 13, color: 'var(--c-accent)' }}>{row.response_time_ms}ms</td>
                    <td style={{ padding: '16px 24px', fontSize: 12, color: 'var(--c-text-3)' }}>{new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
