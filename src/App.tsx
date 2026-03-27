import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuth } from './context/AuthContext';
import ErrorBoundary from './app/components/ErrorBoundary';
import SplashScreen from './app/components/SplashScreen';
import {
  LayoutDashboard, PenTool, Users, BarChart3,
  Settings as SettingsIcon, LogOut, Sparkles, Loader2,
  Bot, MessageCircle, X, Activity, Calendar
} from 'lucide-react';

import Dashboard from './app/pages/Dashboard';
import ContentCreator from './app/pages/ContentCreator';
import ContentPlanner from './app/pages/ContentPlanner';
import CompetitorAnalyzer from './app/pages/Competitor';
import Analytics from './app/pages/Analytics';
import Settings from './app/pages/Settings';
import Login from './app/pages/Login';
import { AIAssistant } from './app/pages/AIAssistant';
import { Chatbot } from './app/components/Chatbot';
import { LLMDashboard } from './app/pages/LLMDashboard';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: '' },
  { path: '/assistant', label: 'AI Strategist', icon: Bot, badge: 'PRO' },
  { path: '/analytics', label: 'Analytics', icon: BarChart3, badge: '' },
  { path: '/creator',   label: 'Content Creator', icon: PenTool, badge: 'AI' },
  { path: '/planner',   label: 'Content Planner', icon: Calendar, badge: '' },
  { path: '/competitor',label: 'Competitor', icon: Users, badge: '' },
  { path: '/llm-usage', label: 'AI Usage', icon: Activity, badge: '' },
  { path: '/settings',  label: 'Settings', icon: SettingsIcon, badge: '' },
];

/* ─── Sidebar ─────────────────────────────────────────────── */
const Sidebar = () => {
  const { signOut, user, isDemo } = useAuth();
  const navigate = useNavigate();

  const userEmail = user?.email || (sessionStorage.getItem('demo_user') ? 'demo@nanban.ai' : 'user@company.com');
  const initial   = userEmail.charAt(0).toUpperCase();

  const handleSignout = async () => {
    await signOut();
    navigate('/login');
  }

  return (
    <aside className="sidebar" style={{
      width: '256px', flexShrink: 0,
      display: 'flex', flexDirection: 'column',
      padding: '20px 12px',
      position: 'sticky', top: 0, height: '100vh',
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', marginBottom: '28px' }}>
        <div style={{
          width: '38px', height: '38px', flexShrink: 0,
          background: 'linear-gradient(135deg, #6d64ff, #00d4ff)',
          borderRadius: '11px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(109,100,255,0.5)',
        }}>
          <Sparkles size={20} color="white" strokeWidth={2} />
        </div>
        <div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: '16px', color: 'var(--c-text)', letterSpacing: '-0.02em' }}>
            Social Nanban
          </div>
          <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--c-prim)', marginTop: '-1px' }}>
            AI Platform
          </div>
        </div>
      </div>

      <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--c-text-3)', paddingLeft: '10px', marginBottom: '8px' }}>
        Navigation
      </div>

      {/* Nav links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 }}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <item.icon size={16} strokeWidth={2} />
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.badge && (
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#6d64ff', background: 'rgba(109,100,255,0.12)', padding: '2px 7px', borderRadius: '100px', letterSpacing: '0.08em', border: '1px solid rgba(109,100,255,0.2)' }}>
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: User block */}
      <div style={{ borderTop: '1px solid var(--c-border)', paddingTop: '14px', marginTop: '14px' }}>
        {isDemo && (
          <div style={{ padding: '8px 10px', background: 'rgba(109,100,255,0.07)', borderRadius: '10px', marginBottom: '10px', border: '1px solid rgba(109,100,255,0.15)' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--c-prim-2)' }}>🚀 Demo Mode Active</div>
            <div style={{ fontSize: '10px', color: 'var(--c-text-3)', marginTop: '2px' }}>Authentication bypassed for testing.</div>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{
            width: '34px', height: '34px', flexShrink: 0,
            background: 'linear-gradient(135deg, #6d64ff, #9f96ff)',
            borderRadius: '10px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '14px',
          }}>{initial}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--c-text)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {userEmail.split('@')[0]}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--c-text-3)' }}>AI Strategist</div>
          </div>
          <button
            onClick={handleSignout}
            title="Secure Signout"
            style={{ background: 'none', border: 'none', color: 'var(--c-text-3)', cursor: 'pointer', padding: '6px', borderRadius: '8px', transition: 'all 0.2s', display: 'flex' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#ff4d6a')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--c-text-3)')}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
};

/* ─── Layout ──────────────────────────────────────────────── */
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--c-bg)' }}>
      <Sidebar />
      <main style={{ flex: 1, minHeight: '100vh', overflowX: 'hidden', overflowY: 'auto', position: 'relative' }}>
        {children}
      </main>
      <Chatbot />
    </div>
  );
};

/* ─── Protected Route ─────────────────────────────────────── */
const Protected = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isDemo } = useAuth();
  
  if (loading) return null;
  
  // Allow demo user bypass
  if (!user && !isDemo) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

/* ─── App ─────────────────────────────────────────────────── */
function App() {
  const { loading } = useAuth();
  const [splashDone, setSplashDone] = useState(false);

  // Boot sequence loader
  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', background: '#020617' }}>
        <div style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg, #6d64ff, #00d4ff)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(109,100,255,0.5)' }}>
          <Sparkles size={26} color="white" strokeWidth={1.5} />
        </div>
        <Loader2 size={20} color="#6d64ff" style={{ animation: 'spin-orbit 1s linear infinite' }} />
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Verifying Identity...
        </p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      {/* Cinematic Splash Screen — only on first load */}
      {!splashDone && <SplashScreen onComplete={() => setSplashDone(true)} />}

      <Router>
        <Toaster position="top-right" richColors theme="dark" />
        <Routes>
          <Route path="/login"      element={<Login />} />
          <Route path="/dashboard"  element={<Protected><Layout><Dashboard /></Layout></Protected>} />
          <Route path="/assistant"  element={<Protected><Layout><AIAssistant /></Layout></Protected>} />
          <Route path="/creator"    element={<Protected><Layout><ContentCreator /></Layout></Protected>} />
          <Route path="/planner"    element={<Protected><Layout><ContentPlanner /></Layout></Protected>} />
          <Route path="/competitor" element={<Protected><Layout><CompetitorAnalyzer /></Layout></Protected>} />
          <Route path="/analytics"  element={<Protected><Layout><Analytics /></Layout></Protected>} />
          <Route path="/llm-usage"  element={<Protected><Layout><LLMDashboard /></Layout></Protected>} />
          <Route path="/settings"   element={<Protected><Layout><Settings /></Layout></Protected>} />
          <Route path="/"           element={<Navigate to="/login" replace />} />
          <Route path="*"           element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
