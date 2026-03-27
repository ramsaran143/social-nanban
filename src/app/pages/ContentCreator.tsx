import React, { useState, useRef } from 'react';
import { Star, Loader2, Sparkles, Image as ImageIcon, AlertTriangle, Save, CalendarPlus, Copy, Zap, PenTool, TrendingUp, Trophy, ShieldCheck, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import { askClaudeJSON, askClaudeWithImage } from '../data/claude';
import { saveAIResult, createPost } from '../data/api';
import { useNavigate } from 'react-router-dom';
import { moderateContent, ModerationResult } from '../data/llmModeration';

const limits: Record<string, number> = {
  instagram: 2200, twitter: 280, linkedin: 3000, facebook: 5000
};

const S = {
  page: { padding: '36px 40px', minHeight: '100vh' } as React.CSSProperties,
  card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '24px' } as React.CSSProperties,
  label: { fontSize: '11px', fontWeight: 700, color: 'var(--c-text-3)', textTransform: 'uppercase' as const, letterSpacing: '0.1em', display: 'block', marginBottom: '8px' },
};

const ContentCreator = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [scoreLoading, setScoreLoading] = useState(false);
  const [captionLoading, setCaptionLoading] = useState(false);
  const [moderating, setModerating] = useState(false);
  const [moderation, setModeration] = useState<ModerationResult | null>(null);
  const [score, setScore] = useState<{
    total: number;
    breakdown: { clarity: number; engagement: number; hashtags: number; length: number; cta: number; };
    suggestions: string[];
    verdict: string;
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image is too large (max 5MB)'); return; }
    const reader = new FileReader();
    reader.onloadend = () => setUploadedImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleGenerateCaption = async () => {
    if (!uploadedImage) return;
    setCaptionLoading(true);
    try {
      const base64Data = uploadedImage.split(',')[1];
      const mediaType = uploadedImage.split(';')[0].split(':')[1] || 'image/jpeg';
      const prompt = `Look at this image. Write a ${platform} social media caption. Returns ONLY the caption text.`;
      const caption = await askClaudeWithImage(prompt, base64Data, mediaType);
      setContent(caption);
      toast.success('Caption generated!');
      await saveAIResult({ feature_type: 'caption_from_image', input_data: { platform }, result_text: caption, platform });
    } catch { toast.error('Caption generation failed'); }
    finally { setCaptionLoading(false); }
  };

  const handleScorePost = async () => {
    setScoreLoading(true);
    try {
      const prompt = `Score this ${platform} post: "${content}". Return JSON: {"total":0,"breakdown":{"clarity":0,"engagement":0,"hashtags":0,"length":0,"cta":0},"suggestions":["str"],"verdict":"str"}`;
      const result = await askClaudeJSON(prompt);
      setScore(result);
      await saveAIResult({ feature_type: 'post_score', input_data: { content, hashtags, platform }, result_json: result, platform });
      toast.success('Post analyzed!');
    } catch { toast.error('Scoring failed'); }
    finally { setScoreLoading(false); }
  };

  const handlePublish = async () => {
    if (!content.trim()) return;
    setModerating(true);
    try {
      const check = await moderateContent(content, platform);
      setModeration(check);
      if (!check.safe) {
        toast.error('Content flagged. Review AI suggestions.');
        return;
      }
      await createPost({ platform, content, hashtags, status: 'published' });
      toast.success('Post published successfully!');
      setContent('');
      setHashtags('');
      setModeration(null);
    } catch { toast.error('Publishing failed'); }
    finally { setModerating(false); }
  };

  return (
    <div style={S.page}>
      <div className="page-header" style={{ padding: 0, borderBottom: 'none', marginBottom: '32px' }}>
        <p style={S.label}>Creative Suite</p>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '28px', fontWeight: 800, color: 'var(--c-text)', letterSpacing: '-0.02em', marginTop: '4px' }}>
          Content Creator
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={S.card}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ width: '38px', height: '38px', background: 'rgba(109,100,255,0.12)', border: '1px solid rgba(109,100,255,0.2)', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PenTool size={18} color="var(--c-prim-2)" />
              </div>
              <div style={{ fontWeight: 700, color: 'var(--c-text)', fontSize: '15px' }}>Visual Editor</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={S.label}>Target Platform</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['instagram', 'twitter', 'linkedin', 'facebook'].map(p => (
                    <button key={p} onClick={() => setPlatform(p)} style={{ 
                      flex: 1, padding: '10px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, textTransform: 'capitalize', cursor: 'pointer', transition: 'all 0.2s',
                      background: platform === p ? 'var(--c-prim)' : 'rgba(255,255,255,0.04)',
                      color: platform === p ? 'white' : 'var(--c-text-3)',
                      border: platform === p ? '1px solid var(--c-prim)' : '1px solid rgba(255,255,255,0.07)'
                    }}>{p}</button>
                  ))}
                </div>
              </div>

              <div>
                <label style={S.label}>Caption Content</label>
                <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Write something inspiring..." className="input-pro" style={{ height: '220px', padding: '16px' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                  <div style={{ fontSize: '10px', color: 'var(--c-text-3)', fontWeight: 600 }}>Tip: Use emojis for higher engagement</div>
                  <div style={{ fontSize: '11px', color: content.length > limits[platform] ? '#ff4d6a' : 'var(--c-text-3)', fontWeight: 600 }}>
                    {content.length} / {limits[platform]}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button onClick={handleScorePost} disabled={content.length < 5 || scoreLoading} className="btn-ghost" style={{ padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {scoreLoading ? <Loader2 size={16} className="animate-spin" /> : <Star size={16} />} Score Post
                </button>
                <button onClick={handlePublish} disabled={content.length < 5 || moderating} className="btn-grad" style={{ padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {moderating ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />} Publish Now
                </button>
              </div>

              {moderation && (
                <div style={{ ...S.card, background: moderation.safe ? 'rgba(0,229,160,0.05)' : 'rgba(255,77,106,0.05)', border: `1px solid ${moderation.safe ? 'rgba(0,229,160,0.2)' : 'rgba(255,77,106,0.2)'}`, marginTop: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <ShieldCheck size={18} color={moderation.safe ? '#00e5a0' : '#ff4d6a'} />
                    <span style={{ fontWeight: 800, fontSize: '13px', color: 'var(--c-text)' }}>Content Safety Check</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', marginBottom: '20px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${moderation.score}%`, background: moderation.score > 70 ? '#00e5a0' : moderation.score > 40 ? '#ffb547' : '#ff4d6a' }} />
                  </div>
                  {moderation.suggestions.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', marginBottom: '8px', fontSize: '12px', color: 'var(--c-text-2)' }}>
                      <Lightbulb size={14} color="#ffb547" style={{ flexShrink: 0 }} /> {s}
                    </div>
                  ))}
                  <div style={{ fontSize: '12px', fontWeight: 700, color: moderation.safe ? '#00e5a0' : '#ff4d6a', marginTop: '8px' }}>Verdict: {moderation.verdict}</div>
                </div>
              )}
            </div>
          </div>

          <div style={{ ...S.card, border: '2px dashed rgba(109,100,255,0.2)', background: 'rgba(109,100,255,0.02)', padding: '20px', cursor: 'pointer', textAlign: 'center' }} onClick={() => fileInputRef.current?.click()}>
            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageUpload} />
            {uploadedImage ? (
              <div style={{ position: 'relative' }}>
                <img src={uploadedImage} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '12px' }} />
                <button onClick={(e) => { e.stopPropagation(); setUploadedImage(null); }} style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px' }}>×</button>
              </div>
            ) : (
              <div style={{ padding: '24px' }}>
                <ImageIcon size={32} color="var(--c-text-3)" style={{ marginBottom: '12px' }} />
                <div style={{ fontWeight: 700, color: 'var(--c-text)', fontSize: '14px' }}>AI Visual Analytics</div>
                <div style={{ fontSize: '12px', color: 'var(--c-text-3)', marginTop: '4px' }}>Generate captions from images</div>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={S.card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <TrendingUp size={18} color="var(--c-accent)" />
              <div style={{ fontWeight: 700, color: 'var(--c-text)', fontSize: '15px' }}>Engagement Probability</div>
            </div>
            {!score ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--c-text-3)' }}>
                <Sparkles size={32} style={{ opacity: 0.1, marginBottom: '12px' }} />
                <p style={{ fontSize: '12px' }}>Analyze your copy to see forecasted performance metrics.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(109,100,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 800, color: score.total > 80 ? '#00e5a0' : '#6d64ff' }}>{score.total}</div>
                    <div><div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--c-text)' }}>AI Forecast</div><div style={{ fontSize: '11px', color: 'var(--c-text-3)' }}>{score.verdict}</div></div>
                 </div>
                 {Object.entries(score.breakdown).map(([k, v]) => (
                   <div key={k}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 700, color: 'var(--c-text-3)', textTransform: 'uppercase', marginBottom: '4px' }}><span>{k}</span><span>{v}/20</span></div>
                     <div style={{ height: '4px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}><div style={{ height: '100%', width: `${(v/20)*100}%`, background: v > 15 ? '#00e5a0' : '#6d64ff', borderRadius: '10px' }} /></div>
                   </div>
                 ))}
                 <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ ...S.label, color: '#ffb547' }}>Strategic Advice</div>
                    {score.suggestions.map(s => <div key={s} style={{ fontSize: '12px', color: 'var(--c-text-2)', marginBottom: '8px', display: 'flex', gap: '8px' }}>• {s}</div>)}
                 </div>
              </div>
            )}
          </div>
          <div style={S.card}>
            <Trophy size={20} color="var(--c-accent)" style={{ marginBottom: '12px' }} />
            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--c-text)', marginBottom: '4px' }}>Elite Status</div>
            <p style={{ fontSize: '11px', color: 'var(--c-text-3)', lineHeight: 1.6 }}>Consistent high scores unlock premium data insights from our global repository.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentCreator;
