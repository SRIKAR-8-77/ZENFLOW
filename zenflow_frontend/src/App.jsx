import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import { SessionHistory, SessionDetailView } from './components/SessionHistory';
import { VideoAnalysis } from './components/VideoAnalysis';
import { Journal, JournalHistory } from './components/Journal';
import { AICoach, CoachHistory } from './components/AICoach';
import Calendar from './components/Calendar';
import ExerciseLibrary from './components/ExerciseLibrary';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8001";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      <div className="premium-bg"></div>
      <div className="relative">
        <div className="w-24 h-24 border-[3px] border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 bg-accent-400 rounded-full animate-pulse-glow shadow-[0_0_15px_rgba(45,212,191,0.8)]"></div>
        </div>
      </div>
      <p className="absolute bottom-12 text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] animate-pulse">Initializing Sanctuary</p>
    </div>
  );

  return user ? <Dashboard user={user} onLogout={handleLogout} /> : <AuthScreen onLogin={handleLogin} />;
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
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      <div className="premium-bg"></div>
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
        <img src="/assets/hero.png" alt="" className="w-full h-full object-cover mix-blend-overlay scale-110" />
      </div>

      <div className="zen-card glass-dark p-12 w-full max-w-lg relative z-10 border-white/5 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in-95 duration-1000">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-primary-500/30 mx-auto mb-8 animate-float">
            <span className="text-white font-black text-4xl drop-shadow-lg">Z</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter mb-4">ZenFlow</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">The Digital Path to Presence</p>
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
            <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-400 text-[10px] font-black uppercase tracking-wider border border-rose-500/20 text-center animate-shake">
              ⚠️ {error}
            </div>
          )}

          <div className="text-center mt-4">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-[10px] font-black text-slate-500 hover:text-primary-400 uppercase tracking-widest transition-colors"
            >
              {isRegistering ? 'Already a practitioner? Enter' : 'New seeker? Create your path'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Dashboard({ user }) {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [journalEntries, setJournalEntries] = useState([]);
  const [chats, setChats] = useState([]);
  const [view, setView] = useState('dashboard');

  const sessionDetailRef = useRef(null);

  const fetchData = async (endpoint, setter) => {
    const token = localStorage.getItem('zenflow_token');
    if (!token) return;
    try {
      const response = await fetch(`${BACKEND_URL}/${endpoint}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setter(await response.json());
      } else {
        setter([]);
      }
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
    }
  };

  useEffect(() => {
    fetchData("get-sessions", setSessions);
    fetchData("get-journal-entries", setJournalEntries);
    fetchData("get-chats", setChats);

    const handleSwitchView = (e) => setView(e.detail);
    window.addEventListener('switchView', handleSwitchView);
    return () => window.removeEventListener('switchView', handleSwitchView);
  }, [user]);

  const handleSelectSession = (session) => {
    setSelectedSession(session);
    setTimeout(() => {
      if (sessionDetailRef.current) {
        sessionDetailRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <div className="premium-bg"></div>

      <Header user={user} onLogout={() => signOut(auth)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {view === 'library' ? (
          <ExerciseLibrary
            user={user}
            backendUrl={BACKEND_URL}
            onBack={() => setView('dashboard')}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Main Feed - 8 Columns */}
            <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <VideoAnalysis
                  onAnalysisComplete={() => {
                    fetchData("get-sessions", setSessions);
                    window.dispatchEvent(new CustomEvent('refreshCalendar'));
                  }}
                  user={user}
                  backendUrl={BACKEND_URL}
                />
                <Journal
                  onEntrySaved={() => fetchData("get-journal-entries", setJournalEntries)}
                  user={user}
                  backendUrl={BACKEND_URL}
                />
              </div>

              {selectedSession && (
                <div className="animate-in zoom-in-95 duration-500">
                  <SessionDetailView
                    ref={sessionDetailRef}
                    session={selectedSession}
                    onClose={() => setSelectedSession(null)}
                  />
                </div>
              )}

              <SessionHistory
                sessions={sessions}
                onSelectSession={handleSelectSession}
              />

              <JournalHistory entries={journalEntries} />
            </div>

            {/* Right Sidebar - 4 Columns */}
            <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-8 duration-1000">
              <Calendar user={user} backendUrl={BACKEND_URL} />
              <AICoach
                refreshChats={() => fetchData("get-chats", setChats)}
                user={user}
                backendUrl={BACKEND_URL}
              />
              <CoachHistory plans={chats} />
            </div>
          </div>
        )}
      </main>

      {/* Subtle bottom glow */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-[30%] bg-primary-500/10 blur-[120px] pointer-events-none rounded-full"></div>
    </div>
  );
}

