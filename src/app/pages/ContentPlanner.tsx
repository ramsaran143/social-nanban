import React, { useState, useEffect } from 'react';
import { supabase } from '../data/supabase';
import { semanticSearchPosts } from '../data/llmEmbeddings';
import { Search, Loader2, Calendar, Target, TrendingUp, Sparkles, Filter, MoreHorizontal, Activity } from 'lucide-react';
import { toast } from 'sonner';

const S = {
  page: { padding: '36px 40px', minHeight: '100vh', background: 'var(--c-bg)' } as React.CSSProperties,
  card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '24px' } as React.CSSProperties,
  label: { fontSize: '11px', fontWeight: 700, color: 'var(--c-text-3)', textTransform: 'uppercase' as const, letterSpacing: '0.12em', display: 'block', marginBottom: '8px' },
};

const ContentPlanner = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadPosts(); }, []);

  const loadPosts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('posts').select('*').eq('user_id', user.id).order('scheduled_at', { ascending: true });
    setPosts(data || []);
    setLoading(false);
  };

  const handleSemanticSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const results = await semanticSearchPosts(user.id, searchQuery, 5);
      setSearchResults(results);
    } catch { toast.error('Semantic search failed'); }
    finally { setSearching(false); }
  };

  return (
    <div style={S.page}>
      <div className="page-header" style={{ padding: 0, borderBottom: 'none', marginBottom: '32px' }}>
        <p style={S.label}>Strategic Management</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '28px', fontWeight: 800, color: 'var(--c-text)', letterSpacing: '-0.02em', marginTop: '4px' }}>
              Content Planner
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--c-text-3)', marginTop: '4px' }}>Master your channel strategy with semantic vector search.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
             <button className="btn-ghost" style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px' }}><Filter size={16} /> Filters</button>
             <button className="btn-grad" style={{ padding: '10px 22px', display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={16} /> Add Post Plan</button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Semantic Search Box */}
        <div style={S.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <Target size={16} color="var(--c-accent)" />
            </div>
            <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--c-text)' }}>AI Semantic Search</span>
          </div>

          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--c-text-3)' }} />
            <input 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && handleSemanticSearch()}
              placeholder="Search by meaning... e.g. 'motivational content for business' or 'trending topics'" 
              className="input-pro" 
              style={{ paddingLeft: '48px', height: '52px' }} 
            />
            {searching && <Loader2 size={18} className="animate-spin" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--c-prim)' }} />}
          </div>

          {searchResults.length > 0 && (
            <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
              {searchResults.map((res: any, i: number) => (
                <div key={i} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--c-prim-2)', textTransform: 'uppercase' }}>Match {Math.round(res.similarity * 100)}%</div>
                    <Sparkles size={12} color="var(--c-accent)" />
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--c-text-2)', lineHeight: 1.5, margin: 0, height: '54px', overflow: 'hidden' }}>{res.content_text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Content Pipeline / List */}
        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
             <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--c-text)', display: 'flex', alignItems: 'center', gap: '10px' }}>
               <TrendingUp size={18} color="var(--c-prim-2)" /> Post Pipeline
             </div>
             <div style={{ fontSize: '12px', color: 'var(--c-text-3)', fontWeight: 600 }}>Total: {posts.length} entries</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '100px 0' }}><Loader2 size={32} className="animate-spin" color="var(--c-prim)" /></div>
            ) : posts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', border: '1px dashed rgba(255,255,255,0.06)', borderRadius: '16px' }}>
                 <Calendar size={40} style={{ opacity: 0.1, marginBottom: '12px' }} />
                 <p style={{ color: 'var(--c-text-3)', fontSize: '13px' }}>Your planning pipeline is empty.</p>
              </div>
            ) : posts.map(post => (
              <div key={post.id} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '16px 20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', transition: 'transform 0.2s ease' }} className="hover-lift">
                 <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(109,100,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Activity size={18} color="var(--c-prim-2)" />
                 </div>
                 <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                       <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--c-prim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{post.platform}</span>
                       <span style={{ fontSize: '10px', color: 'var(--c-text-3)' }}>•</span>
                       <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--c-text-2)' }}>{post.scheduled_at ? new Date(post.scheduled_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'}) : 'Draft'}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--c-text)', margin: 0, fontWeight: 500 }}>{post.content?.substring(0, 100)}...</p>
                 </div>
                 <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: post.status === 'published' ? 'rgba(0,229,160,0.1)' : 'rgba(255,181,71,0.1)', color: post.status === 'published' ? '#00e5a0' : '#ffb547', fontSize: '10px', fontWeight: 800, padding: '4px 10px', borderRadius: '100px', border: post.status === 'published' ? '1px solid rgba(0,229,160,0.2)' : '1px solid rgba(255,181,71,0.2)', textTransform: 'uppercase' }}>{post.status}</div>
                    <button style={{ background: 'none', border: 'none', color: 'var(--c-text-3)', cursor: 'pointer' }}><MoreHorizontal size={18} /></button>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentPlanner;
