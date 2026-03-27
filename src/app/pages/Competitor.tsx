import React, { useState, useEffect } from 'react';
import { Search, Loader2, Sparkles, TrendingUp, Check, X, Lightbulb, Users, RotateCcw, Target, Shield, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { askClaudeJSON } from '../data/claude';
import { saveAIResult, getAIResult } from '../data/api';
import { supabase } from '../data/supabase';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface CompetitorResult {
  handle: string; platform: string; posting_frequency: string;
  best_posting_times: string[]; content_mix: Record<string, number>;
  top_content_types: string[]; avg_engagement_rate: string;
  top_hashtags: string[]; strengths: string[]; weaknesses: string[];
  opportunities_for_you: string[]; threat_level: string; summary: string;
}

const S = {
  page: { minHeight: '100vh', display: 'flex' } as React.CSSProperties,
  leftPanel: { width: '340px', flexShrink: 0, background: 'rgba(8,8,24,0.6)', borderRight: '1px solid var(--c-border)', padding: '32px 24px', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' } as React.CSSProperties,
  rightPanel: { flex: 1, padding: '36px 40px', overflowY: 'auto' } as React.CSSProperties,
  card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '24px' } as React.CSSProperties,
  label: { fontSize: '11px', fontWeight: 700, color: 'var(--c-text-3)', textTransform: 'uppercase' as const, letterSpacing: '0.12em', display: 'block', marginBottom: '8px' },
  badge: (color: string) => ({ display: 'inline-block', padding: '3px 10px', borderRadius: '100px', fontSize: '10px', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' as const, background: color === 'red' ? 'rgba(255,77,106,0.12)' : color === 'green' ? 'rgba(0,229,160,0.12)' : 'rgba(109,100,255,0.12)', color: color === 'red' ? '#ff4d6a' : color === 'green' ? '#00e5a0' : '#9f96ff', border: `1px solid ${color === 'red' ? 'rgba(255,77,106,0.25)' : color === 'green' ? 'rgba(0,229,160,0.25)' : 'rgba(109,100,255,0.25)'}` }),
};

const COLORS = ['#6d64ff', '#00d4ff', '#00e5a0', '#ffb547'];

const CompetitorAnalyzer = () => {
  const [handle, setHandle] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompetitorResult | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => { loadSavedData(); }, []);

  const loadSavedData = async () => {
    const saved = await getAIResult('competitor_analysis');
    if (saved) setResult(saved.result_json);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('ai_results').select('*').eq('user_id', user.id).eq('feature_type', 'competitor_analysis').order('created_at', { ascending: false }).limit(8);
        setHistory(data || []);
      }
    } catch { /* ignore auth issues */ }
  };

  const handleAnalyze = async () => {
    if (!handle.trim()) { toast.error('Enter a competitor handle'); return; }
    setLoading(true);
    const prompt = `Analyze competitor ${handle} on ${platform}. Return ONLY JSON: {"handle":"${handle}","platform":"${platform}","posting_frequency":"2x daily","best_posting_times":["9AM","6PM"],"content_mix":{"edu":40,"promo":20,"fun":30,"bts":10},"top_content_types":["Reels"],"avg_engagement_rate":"3.8%","top_hashtags":["#tag"],"strengths":["visual"],"weaknesses":["reply"],"opportunities_for_you":["Post Reels"],"threat_level":"Medium","summary":"Summary"}`;
    try {
      const res = await askClaudeJSON(prompt);
      setResult(res);
      await saveAIResult({ feature_type: 'competitor_analysis', input_data: { handle, platform }, result_json: res, platform });
      toast.success('Competitor analyzed!');
      loadSavedData();
    } catch { toast.error('Analysis failed'); }
    finally { setLoading(false); }
  };

  const chartData = result ? Object.entries(result.content_mix).map(([name, value]) => ({ name, value })) : [];

  return (
    <div style={S.page}>
      {/* Left Panel */}
      <aside style={S.leftPanel}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
          <div style={{ width: '38px', height: '38px', background: 'rgba(109,100,255,0.12)', border: '1px solid rgba(109,100,255,0.2)', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Target size={20} color="var(--c-prim-2)" />
          </div>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: '18px', color: 'var(--c-text)' }}>Competitors</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={S.label}>Platform</label>
            <select value={platform} onChange={e => setPlatform(e.target.value)} className="input-pro" style={{ padding: '12px 14px' }}>
              <option value="instagram">Instagram</option>
              <option value="twitter">Twitter / X</option>
              <option value="linkedin">LinkedIn</option>
            </select>
          </div>

          <div>
            <label style={S.label}>Competitor Handle</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: 'var(--c-text-3)', pointerEvents: 'none' }}>@</span>
              <input value={handle} onChange={e => setHandle(e.target.value.replace('@', ''))} placeholder="handle" className="input-pro" style={{ padding: '12px 14px 12px 32px' }} />
            </div>
          </div>

          <button onClick={handleAnalyze} disabled={loading} className="btn-grad" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />} Run Analysis
          </button>
        </div>

        <div style={{ marginTop: '40px' }}>
          <div style={S.label}>Recent Searches</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
            {history.map((h, i) => (
              <button key={i} onClick={() => setResult(h.result_json)} style={{ width: '100%', textAlign: 'left', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(109,100,255,0.3)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)')}>
                <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--c-text)' }}>@{h.input_data.handle}</div>
                <div style={{ fontSize: '10px', color: 'var(--c-text-3)', textTransform: 'uppercase', marginTop: '2px', letterSpacing: '0.04em' }}>{h.platform} • {new Date(h.created_at).toLocaleDateString()}</div>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Right Content */}
      <main style={S.rightPanel}>
        {!result && !loading ? (
          <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
            <Users size={64} style={{ marginBottom: '20px' }} />
            <p style={{ fontSize: '15px', fontWeight: 600 }}>Enter a handle to generate deep intelligence</p>
          </div>
        ) : loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="skeleton" style={{ height: '60px', width: '300px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="skeleton" style={{ height: '200px' }} />
              <div className="skeleton" style={{ height: '200px' }} />
            </div>
            <div className="skeleton" style={{ height: '300px' }} />
          </div>
        ) : result && (
          <div className="anim-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '32px', fontWeight: 800, color: 'var(--c-text)', letterSpacing: '-0.02em' }}>
                  @{result.handle} <span style={{ color: 'var(--c-text-3)', fontWeight: 300, fontSize: '18px' }}>Analysis</span>
                </h1>
                <p style={{ fontSize: '14px', color: 'var(--c-text-3)', marginTop: '6px', lineHeight: 1.6, maxWidth: '600px' }}>{result.summary}</p>
              </div>
              <div style={S.badge(result.threat_level === 'High' ? 'red' : result.threat_level === 'Medium' ? 'prim' : 'green')}>
                Threat: {result.threat_level}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Posting Strategy */}
              <div style={S.card}>
                <div style={{ ...S.label, marginBottom: '16px' }}>Posting Intelligence</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: 'var(--c-text-3)' }}>Frequency</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--c-text)' }}>{result.posting_frequency}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--c-prim-2)', textTransform: 'uppercase', marginBottom: '8px' }}>Peak Times</div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {result.best_posting_times.map(t => <span key={t} style={{ padding: '4px 8px', background: 'rgba(109,100,255,0.08)', borderRadius: '6px', fontSize: '11px', fontWeight: 700, color: 'var(--c-prim-2)' }}>{t}</span>)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--c-accent)', textTransform: 'uppercase', marginBottom: '8px' }}>Viral Formats</div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {result.top_content_types.map(t => <span key={t} style={{ padding: '4px 8px', background: 'rgba(0,212,255,0.08)', borderRadius: '6px', fontSize: '11px', fontWeight: 700, color: 'var(--c-accent)' }}>{t}</span>)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div style={S.card}>
                <div style={{ ...S.label, marginBottom: '16px' }}>Content Mix</div>
                <div style={{ height: '160px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData} innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
                        {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#080818', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '10px' }}>
                   {chartData.map((d, i) => (
                      <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', fontWeight: 700, color: 'var(--c-text-3)', textTransform: 'uppercase' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: COLORS[i % COLORS.length] }} /> {d.name}
                      </div>
                   ))}
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div style={{ ...S.card, gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                <div>
                  <div style={{ ...S.label, color: '#00e5a0', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} /> Dominant Strengths</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {result.strengths.map(s => <div key={s} style={{ padding: '10px 14px', background: 'rgba(0,229,160,0.04)', borderLeft: '3px solid #00e5a0', color: 'var(--c-text-2)', fontSize: '12px', fontWeight: 500 }}>{s}</div>)}
                  </div>
                </div>
                <div>
                  <div style={{ ...S.label, color: '#ff4d6a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}><X size={14} /> Core Weaknesses</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {result.weaknesses.map(w => <div key={w} style={{ padding: '10px 14px', background: 'rgba(255,77,106,0.04)', borderLeft: '3px solid #ff4d6a', color: 'var(--c-text-2)', fontSize: '12px', fontWeight: 500 }}>{w}</div>)}
                  </div>
                </div>
              </div>

              {/* Opportunities */}
              <div style={{ ...S.card, gridColumn: 'span 2', background: 'rgba(255,181,71,0.04)', border: '1px solid rgba(255,181,71,0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                  <Lightbulb size={22} color="#ffb547" />
                  <div>
                    <div style={{ fontWeight: 800, color: '#ffb547', fontSize: '15px' }}>Strategic Opportunities</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,181,71,0.6)', fontWeight: 600 }}>Actionable moves for Social Nanban</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {result.opportunities_for_you.map((o, i) => (
                    <div key={i} style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', fontSize: '13px', fontWeight: 600, color: 'var(--c-text)', border: '1px solid rgba(255,255,255,0.05)' }}>{o}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CompetitorAnalyzer;
