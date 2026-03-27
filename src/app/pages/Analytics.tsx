import React, { useState, useEffect } from 'react';
import { 
  Users, Target, MapPin, Heart, AlertCircle, CheckCircle, 
  Clock, Zap, ShieldAlert, RotateCcw, Loader2, BarChart3, 
  TrendingUp, LayoutGrid, Info
} from 'lucide-react';
import { toast } from 'sonner';
import { askClaudeJSON } from '../data/claude';
import { saveAIResult, getAIResult } from '../data/api';

interface AudiencePersona {
  persona_name: string; age_range: string; gender_split: string;
  top_locations: string[]; interests: string[]; pain_points: string[];
  content_they_love: string[]; best_times_active: string[];
  preferred_format: string; tone_that_works: string;
  what_makes_them_follow: string; what_makes_them_unfollow: string;
  summary: string;
}

const S = {
  page: { padding: '36px 40px', minHeight: '100vh' } as React.CSSProperties,
  card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '24px' } as React.CSSProperties,
  label: { fontSize: '11px', fontWeight: 700, color: 'var(--c-text-3)', textTransform: 'uppercase' as const, letterSpacing: '0.12em', display: 'block', marginBottom: '8px' },
  badge: (color: string) => ({ display: 'inline-block', padding: '3px 10px', borderRadius: '100px', fontSize: '10px', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' as const, background: color === 'red' ? 'rgba(255,77,106,0.12)' : color === 'green' ? 'rgba(0,229,160,0.12)' : 'rgba(109,100,255,0.12)', color: color === 'red' ? '#ff4d6a' : color === 'green' ? '#00e5a0' : '#9f96ff', border: `1px solid ${color === 'red' ? 'rgba(255,77,106,0.25)' : color === 'green' ? 'rgba(0,229,160,0.25)' : 'rgba(109,100,255,0.25)'}` }),
};

const Analytics = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [persona, setPersona] = useState<AudiencePersona | null>(null);
  const [personaLoading, setPersonaLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'audience') loadPersonaData();
  }, [activeTab]);

  const loadPersonaData = async (force: boolean = false) => {
    if (!force) {
      const cached = await getAIResult('audience_persona');
      if (cached) { setPersona(cached.result_json); return; }
    }
    setPersonaLoading(true);
    const prompt = `Build detailed audience persona. Return ONLY JSON: {"persona_name":"Marketing Maria","age_range":"28-35","gender_split":"62% F, 38% M","top_locations":["USA"],"interests":["Marketing"],"pain_points":["Time"],"content_they_love":["Tutorials"],"best_times_active":["Tue 7PM"],"preferred_format":"Short Video","tone_that_works":"Direct","what_makes_them_follow":"Value","what_makes_them_unfollow":"Spam","summary":"Summary"}`;
    try {
      const result = await askClaudeJSON(prompt);
      setPersona(result);
      await saveAIResult({ feature_type: 'audience_persona', result_json: result });
      toast.success('Audience persona built!');
    } catch { toast.error('Could not build persona'); }
    finally { setPersonaLoading(false); }
  };

  return (
    <div style={S.page}>
      {/* Header */}
      <div className="page-header" style={{ padding: 0, borderBottom: 'none', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={S.label}>Growth Intelligence</p>
            <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '28px', fontWeight: 800, color: 'var(--c-text)', letterSpacing: '-0.02em', marginTop: '4px' }}>
              Analytics & Insights
            </h1>
          </div>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.07)' }}>
            {['overview', 'audience', 'reports'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{ 
                padding: '8px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, textTransform: 'capitalize', cursor: 'pointer', transition: 'all 0.2s', border: 'none',
                background: activeTab === t ? 'var(--c-prim)' : 'transparent',
                color: activeTab === t ? 'white' : 'var(--c-text-3)'
              }}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="anim-fade-in">
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {[
                { label: 'Followers', value: '12,840', change: '+12%', icon: Users, color: '#6d64ff' },
                { label: 'Engagement', value: '4.2%', change: '+0.5%', icon: TrendingUp, color: '#ff6b9d' },
                { label: 'Reach', value: '1.2M', change: '+24%', icon: BarChart3, color: '#00d4ff' }
              ].map((stat, i) => (
                <div key={i} style={S.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                     <p style={{ ...S.label, marginBottom: 0 }}>{stat.label}</p>
                     <stat.icon size={18} color={stat.color} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                     <h3 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--c-text)', letterSpacing: '-0.03em' }}>{stat.value}</h3>
                     <div style={{ ...S.badge('green'), fontSize: '11px' }}>{stat.change}</div>
                  </div>
                </div>
              ))}
           </div>
           <div style={{ ...S.card, height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', borderStyle: 'dashed' }}>
              <div style={{ textAlign: 'center', opacity: 0.3 }}>
                <TrendingUp size={48} style={{ margin: '0 auto 12px' }} />
                <p style={{ fontWeight: 600 }}>Interactive Growth Charts coming soon</p>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'audience' && (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }} className="anim-fade-in">
          {personaLoading ? (
             <div style={{ ...S.card, height: '500px' }} className="skeleton" />
          ) : persona ? (
            <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
               <div style={{ background: 'linear-gradient(135deg, #6d64ff, #00d4ff)', padding: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 900, color: 'white' }}>
                      {persona.persona_name.charAt(0)}
                    </div>
                    <div>
                      <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '32px', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>{persona.persona_name}</h2>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>
                        {persona.age_range} • {persona.gender_split}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => loadPersonaData(true)} style={{ padding: '12px', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '12px', color: 'white', cursor: 'pointer', display: 'flex' }}>
                    <RotateCcw size={20} />
                  </button>
               </div>

               <div style={{ padding: '40px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                       <section>
                          <label style={S.label}><MapPin size={12} style={{ marginRight: '6px' }} /> Locations</label>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {persona.top_locations.map(l => <span key={l} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--c-text-2)', border: '1px solid rgba(255,255,255,0.07)' }}>{l}</span>)}
                          </div>
                       </section>
                       <section>
                          <label style={S.label}><Zap size={12} style={{ marginRight: '6px' }} /> Interests</label>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {persona.interests.map(i => <span key={i} style={{ ...S.badge('prim') }}>{i}</span>)}
                          </div>
                       </section>
                       <section>
                          <label style={{ ...S.label, color: '#ff4d6a' }}><AlertCircle size={12} style={{ marginRight: '6px' }} /> Pain Points</label>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {persona.pain_points.map(p => <div key={p} style={{ padding: '12px', background: 'rgba(255,77,106,0.04)', borderRadius: '12px', fontSize: '13px', color: '#ff4d6a', fontWeight: 500, border: '1px solid rgba(255,77,106,0.1)' }}>{p}</div>)}
                          </div>
                       </section>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                       <section>
                          <label style={{ ...S.label, color: '#00e5a0' }}><Heart size={12} style={{ marginRight: '6px' }} /> Content Value</label>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {persona.content_they_love.map(p => <div key={p} style={{ padding: '12px', background: 'rgba(0,229,160,0.04)', borderRadius: '12px', fontSize: '13px', color: '#00e5a0', fontWeight: 500, border: '1px solid rgba(0,229,160,0.1)' }}>{p}</div>)}
                          </div>
                       </section>
                       <div style={{ gridTemplateColumns: '1fr 1fr', display: 'grid', gap: '16px' }}>
                          <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                             <Clock size={20} color="var(--c-prim-2)" style={{ marginBottom: '10px' }} />
                             <div style={S.label}>Active Times</div>
                             <div style={{ fontWeight: 700, fontSize: '14px' }}>{persona.best_times_active.join(', ')}</div>
                          </div>
                          <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                             <LayoutGrid size={20} color="var(--c-accent)" style={{ marginBottom: '10px' }} />
                             <div style={S.label}>Format</div>
                             <div style={{ fontWeight: 700, fontSize: '14px' }}>{persona.preferred_format}</div>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div style={{ padding: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', margin: '40px 0' }} />

                  <div style={{ padding: '32px', background: 'rgba(109,100,255,0.08)', borderRadius: '24px', border: '1px solid rgba(109,100,255,0.2)' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                      <Target size={22} color="var(--c-prim-2)" />
                      <div style={{ fontWeight: 800, color: 'var(--c-prim-2)', textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '12px' }}>Strategic Summary</div>
                    </div>
                    <p style={{ fontSize: '17px', fontWeight: 500, color: 'var(--c-text)', lineHeight: 1.7 }}>{persona.summary}</p>
                  </div>
               </div>
            </div>
          ) : (
            <div style={{ ...S.card, height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', opacity: 0.5 }}>
              <Users size={64} style={{ marginBottom: '20px' }} />
              <button onClick={() => loadPersonaData()} className="btn-grad" style={{ padding: '14px 28px' }}>Generate Audience Intelligence</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Analytics;
