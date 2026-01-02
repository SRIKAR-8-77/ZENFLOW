import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FloatingParticles } from './components/FloatingParticles';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { Practice } from './components/Practice';
import { Journal } from './components/Journal';
import { Coach } from './components/Coach';
import { Library } from './components/Library';
import { Progress } from './components/Progress';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8001";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');

  useEffect(() => {
    const token = localStorage.getItem('zenflow_token');
    const storedUser = localStorage.getItem('zenflow_user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('zenflow_token', token);
    localStorage.setItem('zenflow_user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('zenflow_token');
    localStorage.removeItem('zenflow_user');
    setUser(null);
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans">
      <div className="relative">
        <div className="w-24 h-24 border-4 border-white/5 border-t-purple-500 rounded-full animate-spin"></div>
        <p className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-[10px] font-black text-white/20 uppercase tracking-[0.5em] whitespace-nowrap">Initializing Sanctuary</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-purple-500/30 font-sans">
      <FloatingParticles />
      {user ? (
        <>
          <Navigation
            currentView={currentView}
            onViewChange={setCurrentView}
            user={user}
            onLogout={handleLogout}
          />
          <main className="relative z-10 overflow-hidden">
            <AnimatePresence mode="wait">
              {currentView === 'dashboard' && <Dashboard key="dashboard" user={user} backendUrl={BACKEND_URL} />}
              {currentView === 'practice' && <Practice key="practice" user={user} backendUrl={BACKEND_URL} />}
              {currentView === 'journal' && <Journal key="journal" user={user} backendUrl={BACKEND_URL} />}
              {currentView === 'coach' && <Coach key="coach" user={user} backendUrl={BACKEND_URL} />}
              {currentView === 'library' && <Library key="library" backendUrl={BACKEND_URL} />}
              {currentView === 'progress' && <Progress key="progress" backendUrl={BACKEND_URL} />}
            </AnimatePresence>
          </main>
        </>
      ) : (
        <AuthScreen onLogin={handleLogin} />
      )}
    </div>
  );
}

function AuthScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  const handleAuthAction = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegistering) {
        const res = await fetch(`${BACKEND_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: email.split('@')[0], email, password })
        });
        if (!res.ok) throw new Error((await res.json()).detail);
        setIsRegistering(false);
        setError('Registration successful. Please login.');
      } else {
        const formData = new FormData();
        formData.append('username', email.split('@')[0]);
        formData.append('password', password);

        const res = await fetch(`${BACKEND_URL}/auth/token`, {
          method: 'POST',
          body: formData
        });
        if (!res.ok) throw new Error((await res.json()).detail);
        const data = await res.json();
        onLogin({ username: email.split('@')[0], email }, data.access_token);
      }
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950 via-slate-950 to-purple-950 z-0"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-12 shadow-2xl">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/20 mx-auto mb-8">
              <span className="text-white font-black text-4xl">Z</span>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter mb-4">ZenFlow</h1>
            <p className="text-white/40 font-bold uppercase tracking-[0.2em] text-[10px]">The Digital Path to Presence</p>
          </div>

          <form onSubmit={handleAuthAction} className="space-y-6">
            <div className="space-y-4">
              <input
                placeholder="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="zen-input w-full"
                required
              />
              <input
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="zen-input w-full"
                required
              />
            </div>

            <button
              type="submit"
              className="zen-button-primary w-full py-5 text-sm uppercase tracking-[0.2em]"
            >
              {isRegistering ? 'Commence Journey' : 'Re-enter Sanctuary'}
            </button>

            {error && (
              <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-400 text-[10px] font-black uppercase tracking-wider border border-rose-500/20 text-center">
                ⚠️ {error}
              </div>
            )}

            <div className="text-center mt-8">
              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-[10px] font-black text-white/20 hover:text-purple-400 uppercase tracking-widest transition-colors"
              >
                {isRegistering ? 'Already a practitioner? Enter' : 'New seeker? Create your path'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

