import React, { useState, useEffect, useRef } from 'react';
import { loadConversationHistory, retrieveUserData, buildContextStringWithMemory } from '../data/rag';
import { supabase } from '../data/supabase';
import { Send, Bot, User, Sparkles, RefreshCw, X, Loader2, Zap, Target, BookOpen } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { streamLLM } from '../data/llmStream';
import { callLLMWithFunctions } from '../data/llmFunctions';
import { searchKnowledge } from '../data/ragKnowledgeSeeder';
import { extractAndSaveMemories } from '../data/llmMemory';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

const SUGGESTED_PROMPTS = [
  { text: "When to post on LinkedIn?", icon: <Target size={14} /> },
  { text: "Best Instagram hashtags?", icon: <Sparkles size={14} /> },
  { text: "Analyze my performance", icon: <Bot size={14} /> },
  { text: "Compare platform rates", icon: <BookOpen size={14} /> }
];

export function RAGChat({ onClose }: { onClose?: () => void }) {
  const [messages, setMessages] = useState<Message[]>([{
    id: uuidv4(),
    role: 'assistant',
    content: "Hi! I'm your Social Nanban AI Strategist. I have full access to your account data + 2026 industry research. How can I grow your platforms today?",
    timestamp: new Date()
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('demo-user-id');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { initChat(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const initChat = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const history = await loadConversationHistory(user.id, 10);
        if (history.length > 0) {
          const historyMsgs = history.flatMap(h => [
            { id: `q-${h.id}`, role: 'user', content: h.question, timestamp: new Date(h.created_at) },
            { id: `a-${h.id}`, role: 'assistant', content: h.answer, timestamp: new Date(h.created_at) }
          ]) as Message[];
          setMessages([...historyMsgs, { id: uuidv4(), role: 'assistant', content: "Welcome back! How else can I help your social strategy?", timestamp: new Date() }]);
        }
      } else {
        // Fallback for demo mode
        const demoUser = sessionStorage.getItem('demo_user');
        if (demoUser) {
          setUserId('demo-user-id');
        }
      }
    } catch (err) {
      console.warn("Auth initialization failed, but continuing in demo mode.", err);
      setUserId('demo-user-id');
    }
  };

  const handleSend = async (question?: string) => {
    const q = question || input.trim();
    if (!q || loading || !userId) return;

    const userMsg: Message = { id: uuidv4(), role: 'user', content: q, timestamp: new Date() };
    const loadingMsg: Message = { id: uuidv4(), role: 'assistant', content: '', timestamp: new Date(), isLoading: true };

    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setInput('');
    setLoading(true);

    try {
      const platforms = ['instagram', 'linkedin', 'twitter', 'tiktok', 'youtube'];
      const detectedPlatform = platforms.find(p => q.toLowerCase().includes(p)) || 'all';
      
      const data = await retrieveUserData(userId);
      const userContext = await buildContextStringWithMemory(data, q, userId);
      const expertKnowledge = await searchKnowledge(q, detectedPlatform);

      const isCommand = /create|schedule|post|show me|get|analyze|make/i.test(q);

      if (isCommand) {
        const { reply, actionTaken } = await callLLMWithFunctions(q, userContext + '\n' + expertKnowledge, userId);
        setMessages(prev => prev.map(m => m.id === loadingMsg.id ? { ...m, content: reply + (actionTaken ? `\n\n✅ Action taken: ${actionTaken}` : ''), isLoading: false } : m));
        setLoading(false);
        return;
      }

      const systemPrompt = `
You are "Social Nanban AI", a elite social media strategist.
RULES:
1. Reference numbers from [USER ACCOUNT DATA]
2. Cite [EXPERT 2026 KNOWLEDGE] for benchmarks
3. Be direct, actionable, and premium in tone
4. End with one clear "NEXT ACTION"

=== EXPERT 2026 KNOWLEDGE ===
${expertKnowledge || 'No specific benchmarks found.'}

=== USER ACCOUNT DATA ===
${userContext}
      `.trim();

      let streamedText = '';
      await streamLLM(q, 
        (chunk) => {
          streamedText += chunk;
          setMessages(prev => prev.map(m => m.id === loadingMsg.id ? { ...m, content: streamedText, isLoading: false } : m));
        },
        async (fullText) => {
          setMessages(prev => prev.map(m => m.id === loadingMsg.id ? { ...m, content: fullText, isLoading: false } : m));
          await extractAndSaveMemories(userId, q, fullText);
          if (userId !== 'demo-user-id') {
            await supabase.from('rag_conversations').insert({
              user_id: userId, session_id: 'default', question: q, answer: fullText,
              context_used: { metrics_count: data.metrics.length, posts_count: data.posts.length }
            });
          }
          setLoading(false);
        },
        (error) => {
          setMessages(prev => prev.map(m => m.isLoading ? { ...m, content: 'Error streaming response. Please try again.', isLoading: false } : m));
          setLoading(false);
        },
        systemPrompt
      );
    } catch (err: any) { 
      console.error("Chat Error: ", err);
      setMessages(prev => prev.map(m => m.id === loadingMsg.id ? { ...m, content: 'Error: ' + err.message, isLoading: false } : m));
      setLoading(false); 
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'rgba(15, 23, 42, 0.98)', backdropFilter: 'blur(32px)', color: 'white', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 24px 64px rgba(0,0,0,0.6)', borderRadius: '24px', overflow: 'hidden', fontFamily: "'Outfit', sans-serif" }}>
      {/* Premium Header */}
      <div style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'linear-gradient(135deg, #6d64ff, #00d4ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(109,100,255,0.3)' }}><Bot size={22} color="white" /></div>
            <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '12px', height: '12px', background: '#00e5a0', borderRadius: '50%', border: '2px solid rgba(15, 23, 42, 1)' }} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '15px', letterSpacing: '0.01em' }}>Nanban AI <span style={{ fontSize: '9px', background: 'rgba(109,100,255,0.2)', padding: '2px 6px', borderRadius: '100px', marginLeft: '6px', border: '1px solid rgba(109,100,255,0.3)', color: '#9f96ff' }}>v2.0 PRO</span></div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><Zap size={10} color="#00d4ff" /> 2026 Strategic Intelligence</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setMessages([{ id: uuidv4(), role: 'assistant', content: 'Chat reset. How can I help?', timestamp: new Date() }])} style={{ background: 'rgba(255,255,255,0.03)', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '8px', borderRadius: '10px' }}><RefreshCw size={16} /></button>
          {onClose && <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.03)', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '8px', borderRadius: '10px' }}><X size={16} /></button>}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {messages.map((m) => (
          <div key={m.id} style={{ display: 'flex', gap: '14px', flexDirection: m.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '12px', flexShrink: 0, background: m.role === 'user' ? '#6d64ff' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
              {m.role === 'user' ? <User size={16} /> : <Sparkles size={16} color="#00d4ff" />}
            </div>
            <div style={{ maxWidth: '82%', display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ padding: '14px 18px', borderRadius: '18px', fontSize: '14px', lineHeight: 1.6, background: m.role === 'user' ? '#6d64ff' : 'rgba(255,255,255,0.04)', color: 'white', border: '1px solid rgba(255,255,255,0.06)', whiteSpace: 'pre-wrap', borderTopRightRadius: m.role === 'user' ? '4px' : '18px', borderTopLeftRadius: m.role === 'assistant' ? '4px' : '18px' }}>
                {m.isLoading && !m.content ? <div style={{ display: 'flex', gap: '4px' }}><div className="dot-anim" /><div className="dot-anim" /><div className="dot-anim" /></div> : m.content}
              </div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', marginTop: '6px', fontWeight: 600 }}>{m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>
        ))}
        {messages.length < 5 && !loading && (
          <div style={{ marginTop: 'auto', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ width: '100%', fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Suggested Actions</div>
            {SUGGESTED_PROMPTS.map((p, i) => (
              <button key={i} onClick={() => handleSend(p.text)} style={{ background: 'rgba(109,100,255,0.08)', border: '1px solid rgba(109,100,255,0.15)', borderRadius: '12px', padding: '10px 16px', color: '#9f96ff', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(109,100,255,0.15)' }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(109,100,255,0.08)' }}>
                {p.icon} {p.text}
              </button>
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div style={{ padding: '24px', background: 'rgba(0,0,0,0.25)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', position: 'relative' }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()} disabled={loading} placeholder="Ask about trends, benchmarks, or take action..." style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '16px 20px', paddingRight: '54px', color: 'white', fontSize: '14px', fontWeight: 500, outline: 'none', transition: 'all 0.2s' }} onFocus={e => (e.target.style.borderColor = 'rgba(109,100,255,0.4)')} onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} />
          <button onClick={() => handleSend()} disabled={!input.trim() || loading} style={{ position: 'absolute', right: '8px', top: '8px', bottom: '8px', width: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: input.trim() ? '#6d64ff' : 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }}>
            <Send size={18} color="white" />
          </button>
        </div>
      </div>

      <style>{`
        .dot-anim { width: 6px; height: 6px; background: #00d4ff; borderRadius: 50%; opacity: 0.3; animation: blink 1.4s infinite reverse; }
        .dot-anim:nth-child(2) { animation-delay: 0.2s; }
        .dot-anim:nth-child(3) { animation-delay: 0.4s; }
        @keyframes blink { 0% { opacity: 0.3; } 50% { opacity: 1; transform: scale(1.2); } 100% { opacity: 0.3; } }
      `}</style>
    </div>
  );
}
