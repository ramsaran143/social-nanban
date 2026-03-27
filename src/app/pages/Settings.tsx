import React, { useState } from 'react';
import { Wand2, Sparkles, CheckCircle, Loader2, Copy, Info, Save, ExternalLink, LayoutGrid, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { askClaudeJSON } from '../data/claude';
import { saveAIResult } from '../data/api';

const bioLimits: Record<string, number> = { instagram: 150, twitter: 160, linkedin: 220, youtube: 1000 };

const Settings = () => {
  const [currentBio, setCurrentBio] = useState('');
  const [optimizedBio, setOptimizedBio] = useState('');
  const [bioPlatform, setBioPlatform] = useState('instagram');
  const [bioLoading, setBioLoading] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [improvements, setImprovements] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);

  const handleOptimizeBio = async () => {
    if (!currentBio.trim()) { toast.error('Paste your current bio first'); return; }
    setBioLoading(true);
    const prompt = `You are a social media branding expert. Platform: ${bioPlatform}, Char limit: ${bioLimits[bioPlatform]}. Bio: "${currentBio}". Rewrite to be compelling and keyword-rich. Return ONLY JSON: {"optimized_bio":"rewritten bio","character_count":0,"improvements_made":["Added value prop"],"keywords_added":["marketing"]}`;
    try {
      const result = await askClaudeJSON(prompt);
      setOptimizedBio(result.optimized_bio);
      setImprovements(result.improvements_made || []);
      setKeywords(result.keywords_added || []);
      setShowComparison(true);
      await saveAIResult({ feature_type: 'bio_optimizer', input_data: { currentBio, platform: bioPlatform }, result_json: result, platform: bioPlatform });
      toast.success('Bio optimized!');
    } catch { toast.error('Bio optimization failed'); }
    finally { setBioLoading(false); }
  };

  const label = { fontSize: '11px', fontWeight: 700, color: 'var(--c-text-3)' as const, textTransform: 'uppercase' as const, letterSpacing: '0.1em', display: 'block', marginBottom: '8px' };
  const card = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '24px' };

  return (
    <div style={{ padding: '36px 40px', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--c-text-3)' }}>Preferences</p>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '28px', fontWeight: 800, color: 'var(--c-text)', letterSpacing: '-0.02em', marginTop: '4px' }}>
          Account Settings
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Bio Optimizer */}
        <div style={card}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, #8b5cf6, #6d64ff)', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(139,92,246,0.4)' }}>
              <Wand2 size={18} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--c-text)', fontSize: '15px' }}>Bio Optimizer</div>
              <div style={{ fontSize: '11px', color: 'var(--c-prim-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Powered by Claude AI</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={label}>Platform</label>
              <select
                value={bioPlatform}
                onChange={e => setBioPlatform(e.target.value)}
                className="input-pro"
                style={{ padding: '12px 14px' }}
              >
                <option value="instagram">Instagram (150 chars)</option>
                <option value="twitter">Twitter / X (160 chars)</option>
                <option value="linkedin">LinkedIn (220 chars)</option>
                <option value="youtube">YouTube (1000 chars)</option>
              </select>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ ...label, marginBottom: 0 }}>Current Bio</label>
                <span style={{ fontSize: '11px', fontWeight: 600, color: currentBio.length > bioLimits[bioPlatform] ? '#ff4d6a' : 'var(--c-text-3)' }}>
                  {currentBio.length} / {bioLimits[bioPlatform]}
                </span>
              </div>
              <textarea
                value={currentBio}
                onChange={e => setCurrentBio(e.target.value)}
                placeholder="Paste your current bio here..."
                rows={4}
                className="input-pro"
                style={{ padding: '12px 14px', resize: 'none' }}
              />
            </div>

            <button onClick={handleOptimizeBio} disabled={bioLoading} className="btn-grad" style={{ padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px' }}>
              {bioLoading ? <Loader2 size={16} style={{ animation: 'spin-orbit 1s linear infinite' }} /> : <Sparkles size={16} />}
              Optimize My Bio
            </button>
          </div>
        </div>

        {/* Result panel */}
        {!showComparison ? (
          <div style={{ ...card, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '12px', border: '1px dashed rgba(109,100,255,0.2)', background: 'rgba(109,100,255,0.03)' }}>
            <div style={{ width: '52px', height: '52px', background: 'rgba(109,100,255,0.08)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Info size={24} color="var(--c-prim-2)" />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--c-text)', fontSize: '15px', marginBottom: '6px' }}>Why optimize your bio?</div>
              <p style={{ fontSize: '13px', color: 'var(--c-text-3)', lineHeight: 1.6, maxWidth: '280px' }}>Your bio is your digital first impression. Optimized bios improve discoverability and increase follow-rates with clear value propositions.</p>
            </div>
          </div>
        ) : (
          <div style={card}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div style={{ padding: '14px', background: 'rgba(255,77,106,0.05)', border: '1px solid rgba(255,77,106,0.15)', borderRadius: '12px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#ff4d6a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Before</div>
                <p style={{ fontSize: '12px', color: 'var(--c-text-3)', fontStyle: 'italic', lineHeight: 1.5 }}>"{currentBio}"</p>
              </div>
              <div style={{ padding: '14px', background: 'rgba(109,100,255,0.08)', border: '1px solid rgba(109,100,255,0.2)', borderRadius: '12px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--c-prim-2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>After</div>
                <p style={{ fontSize: '12px', color: 'var(--c-text)', fontWeight: 600, lineHeight: 1.5 }}>{optimizedBio}</p>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--c-text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Improvements</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {improvements.map(i => (
                  <div key={i} style={{ display: 'flex', gap: '7px', alignItems: 'center', fontSize: '12px', color: '#00e5a0', fontWeight: 500 }}>
                    <CheckCircle size={12} />{i}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--c-text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Keywords</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {keywords.map(k => <span key={k} style={{ padding: '3px 10px', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '100px', fontSize: '10px', fontWeight: 700, color: 'var(--c-accent)' }}>{k}</span>)}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { navigator.clipboard.writeText(optimizedBio); toast.success('Copied!'); }} className="btn-ghost" style={{ flex: 1, padding: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px' }}>
                <Copy size={14} /> Copy
              </button>
              <button onClick={() => { setShowComparison(false); setCurrentBio(''); setOptimizedBio(''); toast.success('Reset!'); }} className="btn-ghost" style={{ flex: 1, padding: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px' }}>
                <Save size={14} /> Save & Reset
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Connected Accounts */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
          <ExternalLink size={16} color="var(--c-text-3)" />
          <h2 style={{ fontWeight: 700, color: 'var(--c-text)', fontSize: '16px' }}>Connected Platforms</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
          {[
            { name: 'Instagram', color: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)', status: 'Connected' },
            { name: 'Twitter / X', color: '#000', status: 'Connected' },
            { name: 'LinkedIn', color: '#0077b5', status: 'Connected' },
          ].map(p => (
            <div key={p.name} style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '38px', height: '38px', background: p.color, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '14px', flexShrink: 0 }}>
                  {p.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--c-text)', fontSize: '14px' }}>{p.name}</div>
                  <div style={{ fontSize: '11px', color: '#00e5a0', fontWeight: 600 }}>{p.status}</div>
                </div>
              </div>
              <button style={{ background: 'none', border: 'none', color: 'var(--c-text-3)', cursor: 'pointer', display: 'flex', padding: '6px', borderRadius: '8px', transition: 'all 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#ff4d6a')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--c-text-3)')}>
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;
