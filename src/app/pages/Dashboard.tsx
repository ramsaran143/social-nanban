import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Calendar, Target, RotateCcw,
  ChevronRight, AlertTriangle, Loader2, Trophy, ArrowUpRight,
  MessageSquare, Search, Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { askClaudeJSON } from '../data/claude';
import { saveAIResult, getAIResult, getMetrics } from '../data/api';
import CommentReplyGenerator from '../components/CommentReplyGenerator';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../data/supabase';

interface TrendResult {
  niche: string;
  trends: Array<{
    topic: string; hashtags: string[]; momentum: 'rising' | 'stable' | 'falling';
    volume: string; why_trending: string; post_idea: string;
    best_platform: string; urgency: string;
  }>;
  summary: string;
}
interface WeeklyStrategy {
  week_of: string; weekly_goal: string; platforms_to_focus: string[];
  posting_schedule: Array<{ day: string; platform: string; time: string; content_type: string; topic: string; reason: string; }>;
  content_themes: string[]; hashtag_strategy: string; things_to_avoid: string[];
  this_week_priority: string; predicted_result: string;
}

const S = {
  page: { padding: '36px 40px', minHeight: '100vh', background: 'var(--c-bg)', color: 'white' } as React.CSSProperties,
  card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', transition: 'all 0.25s ease' } as React.CSSProperties,
  label: { fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.4)' },
  badge: (color: string) => ({ display: 'inline-block', padding: '3px 10px', borderRadius: '100px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, background: color === 'green' ? 'rgba(0,229,160,0.12)' : 'rgba(109,100,255,0.12)', color: color === 'green' ? '#00e5a0' : '#9f96ff', border: `1px solid ${color === 'green' ? 'rgba(0,229,160,0.25)' : 'rgba(109,100,255,0.25)'}` }),
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [trends, setTrends] = useState<TrendResult | null>(null);
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [niche, setNiche] = useState(() => localStorage.getItem('niche') || 'digital marketing');
  const [weeklyStrategy, setWeeklyStrategy] = useState<WeeklyStrategy | null>(null);
  const [strategyLoading, setStrategyLoading] = useState(false);
  const [metrics, setMetrics] = useState<any[]>([]);

  useEffect(() => { initDashboard(); }, []);

  const initDashboard = async () => {
    try {
      // Fetch Metrics from Django Seeded Data
      const m = await getMetrics();
      setMetrics(m);

      const cachedTrends = await getAIResult('trend_detection');
      if (cachedTrends) {
        const ageH = (Date.now() - new Date(cachedTrends.created_at).getTime()) / 3600000;
        if (ageH < 6) setTrends(cachedTrends.result_json); else loadTrends();
      } else { loadTrends(); }

      const cachedStrat = await getAIResult('weekly_strategy');
      const days = cachedStrat ? (Date.now() - new Date(cachedStrat.created_at).getTime()) / 86400000 : 999;
      if (!cachedStrat || days > 7) loadWeeklyStrategy(); else setWeeklyStrategy(cachedStrat.result_json);
    } catch (err) { console.error("Dashboard Init failed:", err); }
  };

  const loadTrends = async (forceNiche?: string) => {
    const n = forceNiche || niche;
    setTrendsLoading(true);
    try {
      const result = await askClaudeJSON(`Create JSON for ${n} trends: {"niche":"${n}","trends":[{"topic":"AI","hashtags":["#AI"],"momentum":"rising","volume":"10K","why_trending":"New tech","post_idea":"Idea","best_platform":"Twitter","urgency":"High"}],"summary":"Sum"}`);
      setTrends(result);
      await saveAIResult({ feature_type: 'trend_detection', input_data: { niche: n }, result_json: result });
      localStorage.setItem('niche', n);
    } catch { toast.error('Could not load trends'); }
    finally { setTrendsLoading(false); }
  };

  const loadWeeklyStrategy = async () => {
    setStrategyLoading(true);
    try {
      const result = await askClaudeJSON(`Create JSON weekly strat: {"week_of":"date","weekly_goal":"Goal","platforms_to_focus":[],"posting_schedule":[],"content_themes":[],"hashtag_strategy":"STRAT","things_to_avoid":[],"this_week_priority":"UI","predicted_result":"WIN"}`);
      setWeeklyStrategy(result);
      await saveAIResult({ feature_type: 'weekly_strategy', input_data: {}, result_json: result });
    } catch { toast.error('Strategy failed'); }
    finally { setStrategyLoading(false); }
  };

  const dayColors: Record<string, string> = { Monday: '#6d64ff', Tuesday: '#00d4ff', Wednesday: '#00e5a0', Thursday: '#ffb547', Friday: '#ff6b9d', Saturday: '#9f96ff', Sunday: '#ff4d6a' };

  return (
    <div style={S.page}>
      <div className="page-header" style={{ padding: 0, borderBottom: 'none', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={S.label}>Overview</p>
            <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '28px', fontWeight: 800 }}>Strategy Dashboard</h1>
          </div>
          <div style={{ padding: '8px 14px', background: 'rgba(109,100,255,0.08)', borderRadius: '100px', fontSize: '12px', fontWeight: 700, color: '#9f96ff', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={13} /> AI Engine Active
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '28px' }}>
        {metrics.map((s, i) => (
          <div key={i} className="stat-card anim-fade-in" style={S.card}>
            <div style={{ ...S.label, marginBottom: '10px', padding: '20px 20px 0' }}>{s.metric_name}</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: s.color || 'white', padding: '0 20px 20px' }}>{s.value}</div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.3)', padding: '0 20px 20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ArrowUpRight size={11} color={s.color || 'white'} />{s.delta}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={S.card}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ fontWeight: 700, fontSize: '15px' }}>Strategic Forecast</div>
               <button onClick={loadWeeklyStrategy} disabled={strategyLoading} className="btn-ghost">{strategyLoading ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}</button>
            </div>
            <div style={{ padding: '24px' }}>
              {weeklyStrategy ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div style={{ padding: '16px', background: 'rgba(109,100,255,0.05)', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}><Target size={18} color="#9f96ff" /><div><div style={S.label}>Focus Goal</div><div style={{ fontWeight: 700, fontSize: '14px' }}>{weeklyStrategy.weekly_goal}</div></div></div>
                  <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{['Day', 'Platform', 'Type', 'Topic'].map(h => <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>{h}</th>)}</tr></thead><tbody>{weeklyStrategy.posting_schedule.map((s, i) => (<tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}><td style={{ padding: '12px', fontSize: '13px', fontWeight: 700, color: dayColors[s.day] }}>{s.day}</td><td style={{ padding: '12px' }}><span style={{ ...S.badge('prim'), fontSize: '9px' }}>{s.platform}</span></td><td style={{ padding: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{s.content_type}</td><td style={{ padding: '12px', fontSize: '12px' }}>{s.topic}</td></tr>))}</tbody></table></div>
                </div>
              ) : <div style={{ textAlign: 'center', padding: '40px' }}><Loader2 size={24} className="animate-spin" style={{ opacity: 0.2 }} /></div>}
            </div>
          </div>
          <CommentReplyGenerator />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
           <div style={S.card}><div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}><div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><TrendingUp size={14} color="#00d4ff" /><span style={{ fontWeight: 700, fontSize: '14px' }}>Live Trends</span></div></div><div style={{ padding: '16px' }}><div style={{ position: 'relative', marginBottom: '12px' }}><Search size={12} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} /><input value={niche} onChange={e => setNiche(e.target.value)} onKeyDown={e => e.key === 'Enter' && loadTrends()} className="input-pro" style={{ paddingLeft: '28px', fontSize: '12px' }} /></div><div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>{trendsLoading ? [1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '60px' }} />) : trends?.trends.map((t, i) => (<div key={i} onClick={() => navigate('/creator', { state: { prefillContent: t.post_idea } })} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ fontWeight: 700, fontSize: '13px' }}>{t.topic}</span><span style={S.badge(t.momentum === 'rising' ? 'green' : 'prim')}>{t.momentum}</span></div><p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{t.why_trending}</p></div>))}</div></div></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
