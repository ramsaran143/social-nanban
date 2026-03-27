import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2, Sparkles, Mail, Lock, ArrowRight, ShieldCheck, Globe, BarChart3, Rocket, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VAlUES = [
  { icon: BarChart3,  label: 'Precision Analytics', desc: 'Enterprise-grade data processing for actionable social insights.' },
  { icon: Globe,      label: 'Market Alignment',    desc: 'Align your brand performance with global industry standards.' },
  { icon: ShieldCheck, label: 'Brand Security',      desc: 'Advanced automated safety protocols for every piece of content.' },
  { icon: Rocket,     label: 'Strategic Growth',    desc: 'Scalable infrastructure designed for rapid channel expansion.' },
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { setMounted(true); }, []);

  const handleDemoLogin = () => {
    sessionStorage.setItem('demo_user', JSON.stringify({ email: 'demo@nanban.ai' }));
    window.location.href = '/dashboard';
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { supabase } = await import('../data/supabase');
      
      const { data, error } = isSignUp
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        throw error;
      }
      
      if (isSignUp) {
        toast.success('Registration successful. You can now access the hub.');
        setIsSignUp(false);
      } else {
        toast.success('Authentication confirmed.');
        if (data?.session) {
           navigate('/dashboard');
        }
      }
    } catch (err: any) {
      if (err.message.includes('Invalid login credentials')) {
        toast.error('Incorrect email or security phrase.');
      } else if (err.message.includes('User already registered')) {
        toast.error('This business email is already registered.');
      } else {
        toast.error(err.message || 'Authentication failed. Please verify your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', overflow: 'hidden',
      background: '#020617',
      fontFamily: "'Outfit', sans-serif",
      position: 'relative',
      color: 'white'
    }}>
      {/* ── Background Aesthetics ─────────────────────────── */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(109,100,255,0.08) 0%, transparent 70%)', filter: 'blur(100px)', animation: 'float-slow 20s infinite alternate' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)', filter: 'blur(100px)', animation: 'float-slow 25s infinite alternate-reverse' }} />
      </div>

      {/* ── Left Content Panel ─────────────────────────────── */}
      <div style={{
        flex: 1, display: 'none', flexDirection: 'column',
        padding: '80px', position: 'relative', zIndex: 1,
        justifyContent: 'center', borderRight: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(255,255,255,0.01)'
      }} className="lg-panel">
        <div style={{ maxWidth: '600px', alignSelf: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '80px' }}>
            <div style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg, #6d64ff, #00d4ff)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 40px rgba(109,100,255,0.4)' }}>
              <Sparkles size={28} color="white" />
            </div>
            <div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: '26px', letterSpacing: '-0.02em' }}>Social Nanban</div>
              <div style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6d64ff', marginTop: '-2px' }}>Strategic Platform</div>
            </div>
          </div>

          <div style={{ marginBottom: '64px' }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '64px', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.05em', marginBottom: '24px' }}>
              The <span className="text-grad">Digital Mind</span><br />
              for Modern Brands.
            </h2>
            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, maxWidth: '480px', fontWeight: 500 }}>
              Master your social presence with advanced strategic intelligence, real-time market detection, and automated scaling.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {VAlUES.map((v, i) => (
              <div key={i} style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px' }}>
                <div style={{ width: '40px', height: '40px', background: 'rgba(109,100,255,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <v.icon size={20} color="#6d64ff" />
                </div>
                <div style={{ fontWeight: 800, fontSize: '15px', marginBottom: '6px' }}>{v.label}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{v.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Authentication Panel ──────────────────────── */}
      <div style={{
        width: '100%', maxWidth: '600px', margin: '0 auto',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px', position: 'relative', zIndex: 1,
        animation: mounted ? 'auth-slide-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) both' : 'none'
      }}>
        {/* Mobile Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px', opacity: 1 }}>
          <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #6d64ff, #00d4ff)', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={24} color="white" />
          </div>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: '22px', letterSpacing: '-0.02em' }}>Social Nanban</span>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '42px', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '12px' }}>
            {isSignUp ? 'Initialize Profile' : 'Secure Access'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px', fontWeight: 500 }}>
            {isSignUp ? 'Create your professional account to begin.' : 'Enter your credentials to access the platform.'}
          </p>
        </div>

        {/* Demo Mode Button */}
        <div style={{ padding: '16px 20px', background: 'rgba(109,100,255,0.08)', border: '1px solid rgba(109,100,255,0.2)', borderRadius: '16px', marginBottom: '32px', display: 'flex', gap: '14px', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onClick={handleDemoLogin} className="hover-lift">
          <Activity size={20} color="#9f96ff" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#9f96ff' }}>Quick Demo Access</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>Skip authentication to explore the AI platform locally.</div>
          </div>
          <ArrowRight size={16} color="#9f96ff" />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '32px' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>OR CONNECT SECURELY</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
        </div>

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '10px' }}>Business Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@company.com" required className="input-pro" style={{ padding: '16px 16px 16px 52px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '10px' }}>Security Phrase</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className="input-pro" style={{ padding: '16px 16px 16px 52px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-grad" style={{ padding: '20px', borderRadius: '16px', fontWeight: 700, fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 8px 32px rgba(109,100,255,0.3)', marginTop: '10px' }}>
            {loading ? <Loader2 size={20} className="animate-spin" /> : <>{isSignUp ? 'Create Professional Account' : 'Access Hub'} <ArrowRight size={18} /></>}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button onClick={() => setIsSignUp(!isSignUp)} style={{ background: 'none', border: 'none', color: '#9f96ff', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
            {isSignUp ? 'Already registered? Access here →' : "New strategist? Initialize profile →"}
          </button>
        </div>
      </div>

      <style>{`
        @media (min-width: 1100px) { .lg-panel { display: flex !important; } }
        @keyframes auth-slide-in { from { opacity: 0; transform: translateX(40px) } to { opacity: 1; transform: translateX(0) } }
        @keyframes float-slow { from { transform: translate(0,0) scale(1) } to { transform: translate(50px, 30px) scale(1.1) } }
        .text-grad { background: linear-gradient(135deg, #6d64ff, #00d4ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hover-lift:hover { transform: translateY(-2px); background: rgba(109,100,255,0.12) !important; }
      `}</style>
    </div>
  );
};

export default Login;
