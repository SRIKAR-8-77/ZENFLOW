import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Mail, Lock, ArrowRight } from 'lucide-react';
import { FloatingParticles } from './components/FloatingParticles';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { Practice } from './components/Practice';
import { Journal } from './components/Journal';
import { Coach } from './components/Coach';
import { Library } from './components/Library';
import { Progress } from './components/Progress';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

const poses = [
    "/yoga-pose.svg",
    "/yoga-pose.svg", 
    "/yoga-pose.svg"  
];

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
    <div className="min-h-screen bg-slate-950 text-white selection:bg-purple-500/30 font-sans flex flex-col">
      <FloatingParticles />
      {user ? (
        <div className="flex flex-col min-h-screen w-full relative z-10">
          <Navigation
            currentView={currentView}
            onViewChange={setCurrentView}
            user={user}
            onLogout={handleLogout}
          />
          <main className="relative z-10 overflow-hidden flex-1 flex flex-col">
            <AnimatePresence mode="wait">
              {currentView === 'dashboard' && (
                <Dashboard
                  key="dashboard"
                  user={user}
                  backendUrl={BACKEND_URL}
                  onViewChange={setCurrentView}
                />
              )}
              {currentView === 'practice' && <Practice key="practice" user={user} backendUrl={BACKEND_URL} />}
              {currentView === 'journal' && <Journal key="journal" user={user} backendUrl={BACKEND_URL} />}
              {currentView === 'coach' && <Coach key="coach" user={user} backendUrl={BACKEND_URL} />}
              {currentView === 'library' && <Library key="library" backendUrl={BACKEND_URL} />}
              {currentView === 'progress' && <Progress key="progress" backendUrl={BACKEND_URL} />}
            </AnimatePresence>
          </main>
        </div>
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Rotate the carousel every 4 seconds
  useEffect(() => {
      const interval = setInterval(() => {
          setCurrentIndex((prev) => (prev + 1) % poses.length);
      }, 4000);
      return () => clearInterval(interval);
  }, []);

  const handleAuthAction = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
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
    // } catch (err) { setError(err.message); }
   } catch (err) {
    setError(err.message);
   } finally
    {      setIsSubmitting(false);   

    }
  };

  // Determine the position of each pose based on the current index
  const getPosition = (index) => {
      if (index === currentIndex) return "center";
      if (index === (currentIndex - 1 + poses.length) % poses.length) return "left";
      return "right";
  };

  const poseVariants = {
      center: {
          x: 0,
          scale: 1.15,
          opacity: 1,
          zIndex: 20,
          filter: "drop-shadow(0px 30px 50px rgba(168, 85, 247, 0.8))",
      },
      left: {
          x: "-45%",
          scale: 0.75,
          opacity: 0.3,
          zIndex: 10,
          filter: "drop-shadow(0px 0px 0px rgba(168, 85, 247, 0))",
      },
      right: {
          x: "45%",
          scale: 0.75,
          opacity: 0.3,
          zIndex: 10,
          filter: "drop-shadow(0px 0px 0px rgba(168, 85, 247, 0))",
      }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 md:p-8 overflow-hidden w-full">
      {/* Background Ambient Glow */}
      <div className="absolute top-[-10%] left-[50%] translate-x-[-50%] w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(99,56,249,0.05)_0%,rgba(0,0,0,0)_60%)] rounded-full pointer-events-none z-0"></div>

      <div className="max-w-6xl w-full mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-20">
        
        {/* LEFT SIDE: Input Fields */}
        <motion.div 
            className="w-full md:w-1/2 flex flex-col items-start text-left bg-white/[0.02] border border-white/5 p-8 md:p-12 rounded-3xl backdrop-blur-xl shadow-2xl"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
        >
            <motion.div 
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-purple-300 mb-8"
            >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isRegistering ? "Begin your journey" : "Welcome back"}</span>
            </motion.div>
            
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-2 leading-[1.1]">
                {isRegistering ? "Create Account" : "Sign In"}
            </h1>
            <p className="text-gray-400 text-base mb-8">
                {isRegistering ? "Sign up to track your flow and mindfulness." : "Enter your details to access your sanctuary."}
            </p>

            <form className="w-full flex flex-col gap-4" onSubmit={handleAuthAction}>
              <label htmlFor="auth-email" className="sr-only">Email address</label>
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input 
                        id="auth-email"
                        type="email" 
                        placeholder="Email Address" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.05] transition-all"
                        required
                    />
                </div>
                
                <label htmlFor="auth-password" className="sr-only">Password</label>
                <div className="relative">
                  
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input 
                        id="auth-password"
                        type="password" 
                        placeholder="Password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.05] transition-all"
                        required
                    />
                </div>

                {error && (
                    <div className="p-4 mt-2 rounded-xl bg-rose-500/10 text-rose-400 text-xs font-medium border border-rose-500/20 text-center">
                        {error}
                    </div>
                )}

                <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full mt-4 group relative px-8 py-4 rounded-xl bg-white text-black font-semibold text-sm overflow-hidden flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(168,85,247,0.4)] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                     <span className="relative z-10">
                        {isSubmitting ? "Please wait..." : isRegistering ? "Commence Journey" : "Re-enter Sanctuary"}
                    </span>
                    <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-200 to-orange-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.button>
            </form>

            <p className="mt-8 text-sm text-gray-400 self-center">
                {isRegistering ? "Already a practitioner?" : "New seeker?"}{" "}
                <button 
                    type="button"
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                >
                    {isRegistering ? "Enter" : "Create your path"}
                </button>
            </p>
        </motion.div>

        {/* RIGHT SIDE: 3D Rotating Yoga Poses */}
        <motion.div 
            className="relative w-full md:w-1/2 h-[400px] md:h-[600px] flex justify-center items-center"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
            {/* Animated Glowing Aura Behind Images */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div 
                    animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="w-64 h-64 md:w-[400px] md:h-[400px] bg-purple-600/40 rounded-full blur-[80px]"
                />
                <motion.div 
                    animate={{ 
                        scale: [1, 1.5, 1],
                        opacity: [0.2, 0.5, 0.2],
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute w-48 h-48 md:w-64 md:h-64 bg-orange-500/30 rounded-full blur-[60px]"
                />
            </div>

            {/* Carousel Container */}
            <div className="relative w-full h-full flex items-center justify-center">
                {poses.map((pose, index) => {
                    const position = getPosition(index);
                    return (
                        <motion.div
                            key={index}
                            variants={poseVariants}
                            initial={false}
                            animate={position}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                            className="absolute w-64 h-64 md:w-96 md:h-96 flex items-center justify-center"
                        >
                            <img 
                                src={pose} 
                                alt={`Yoga Pose ${index + 1}`} 
                                className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                                style={{
                                    // Temporary color filter so you can tell the placeholders apart
                                    // You can remove this style block once you add your actual 3 SVGs!
                                    filter: index === 1 ? 'hue-rotate(90deg)' : index === 2 ? 'hue-rotate(180deg)' : 'none'
                                }}
                            />
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>

      </div>
    </div>
  );
}