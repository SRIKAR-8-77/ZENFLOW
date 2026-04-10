import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Calendar, ArrowRight, Zap, Waves, Target, Cloud, Heart } from 'lucide-react';

export function Journal({ user, backendUrl }) {
    const { username } = useParams();
    const [entry, setEntry] = useState('');
    const [history, setHistory] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedMood, setSelectedMood] = useState('Focused');

    // 1. Enhanced Mood Theme Configuration
    // Higher opacities for darker colors to ensure they pop against the sanctuary background
    const moodConfigs = {
        'Energized': { 
            icon: Zap, 
            color: 'text-yellow-400', 
            bg: 'bg-yellow-400/10', 
            border: 'border-yellow-400/30', 
            hoverBorder: 'group-hover:border-yellow-400/80',
            glow: 'group-hover:shadow-[0_0_30px_rgba(250,204,21,0.3)]' 
        },
        'Calm': { 
            icon: Waves, 
            color: 'text-blue-400', 
            bg: 'bg-blue-400/10', 
            border: 'border-blue-400/40', // Slightly higher base opacity
            hoverBorder: 'group-hover:border-blue-400/90',
            glow: 'group-hover:shadow-[0_0_35px_rgba(96,165,250,0.35)]' 
        },
        'Focused': { 
            icon: Target, 
            color: 'text-purple-400', 
            bg: 'bg-purple-400/10', 
            border: 'border-purple-400/40', 
            hoverBorder: 'group-hover:border-purple-400/90',
            glow: 'group-hover:shadow-[0_0_35px_rgba(192,132,252,0.35)]' 
        },
        'Peaceful': { 
            icon: Cloud, 
            color: 'text-teal-400', 
            bg: 'bg-teal-400/10', 
            border: 'border-teal-400/40', 
            hoverBorder: 'group-hover:border-teal-400/90',
            glow: 'group-hover:shadow-[0_0_35px_rgba(45,212,191,0.35)]' 
        }
    };

    // 2. Data Fetching with BOLA Guard
    useEffect(() => {
        if (user && user.username.toLowerCase() === username.toLowerCase()) {
            const fetchHistory = async () => {
                const token = localStorage.getItem('zenflow_token');
                try {
                    const response = await fetch(`${backendUrl}/${username}/get-journal-entries/`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (response.ok) setHistory(await response.json());
                } catch (e) { console.error("Journal Fetch Error:", e); }
            };
            fetchHistory();
        }
    }, [backendUrl, user, username]);

    // 3. Early Returns (Authentication & Redirects)
    if (!user) {
        return (
            <div className="min-h-screen bg-[#080313] flex items-center justify-center">
                <div className="animate-pulse text-purple-400 font-medium tracking-widest uppercase text-sm">
                    Opening Sanctuary...
                </div>
            </div>
        );
    }

    // Case-insensitive BOLA redirect
    if (user.username.toLowerCase() !== username.toLowerCase()) {
        return <Navigate to={`/${user.username}/journal`} replace />;
    }

    const handleSave = async () => {
        if (!entry.trim()) return;
        setIsSaving(true);
        const token = localStorage.getItem('zenflow_token');
        try {
            const response = await fetch(`${backendUrl}/${user.username}/add-journal-entry/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ entry: `[Mood: ${selectedMood}] ${entry}` })
            });
            if (response.ok) {
                setEntry('');
                const fresh = await fetch(`${backendUrl}/${user.username}/get-journal-entries/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (fresh.ok) setHistory(await fresh.json());
            }
        } catch (e) { console.error(e); }
        finally { setIsSaving(false); }
    };

    return (
        <div className="w-full max-w-5xl mx-auto px-4 md:px-8 py-12 lg:py-20 font-sans">
            <header className="text-center mb-8 mt-8">
                <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl md:text-6xl font-bold mb-4 tracking-tight"
                >
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-400 to-orange-400">
                        Reflections
                    </span>
                </motion.h1>
                <p className="text-gray-400 text-lg italic">Writing as a meditative act.</p>
            </header>

            <div className="flex flex-col gap-12">
                {/* Entry Workspace */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-orange-500/5 rounded-[2rem] blur-2xl pointer-events-none" />
                    <div className="relative bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 md:p-10 transition-colors hover:bg-white/[0.03]">
                        
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10 border-b border-white/5 pb-8">
                            <div className="flex flex-wrap gap-3 md:gap-4">
                                {Object.keys(moodConfigs).map((mKey) => {
                                    const m = moodConfigs[mKey];
                                    const isSelected = selectedMood === mKey;
                                    const Icon = m.icon;
                                    return (
                                        <button
                                            key={mKey}
                                            onClick={() => setSelectedMood(mKey)}
                                            className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 border
                                                ${isSelected 
                                                    ? `${m.bg} ${m.border.replace('/30', '/60').replace('/40', '/60')} ${m.color} shadow-lg scale-105` 
                                                    : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-300'
                                                }`}
                                        >
                                            <Icon className="w-6 h-6 md:w-8 md:h-8 mb-2" strokeWidth={isSelected ? 2.5 : 2} />
                                            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest">{mKey}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="text-gray-500 text-sm italic font-medium">How is your energy flowing today?</p>
                        </div>

                        <textarea
                            value={entry}
                            onChange={(e) => setEntry(e.target.value)}
                            placeholder="Pour your thoughts onto the digital canvas..."
                            className="w-full h-56 md:h-64 bg-transparent border-none focus:ring-0 outline-none text-xl md:text-2xl text-gray-200 placeholder-gray-600 resize-none font-medium leading-relaxed"
                        />

                        <div className="mt-8 flex justify-end pt-6 border-t border-white/5">
                            <button
                                onClick={handleSave}
                                disabled={isSaving || !entry.trim()}
                                className="group flex items-center gap-3 bg-white text-black px-8 py-3.5 rounded-full font-semibold text-sm hover:bg-gray-200 transition-all disabled:opacity-50"
                            >
                                {isSaving ? 'Preserving Presence...' : 'Save Reflection'}
                                {!isSaving && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Chronicle History with Fixed Aura UI */}
                <div className="mt-8">
                    <div className="flex items-center gap-3 mb-8 px-2">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <h3 className="text-xl font-bold text-white tracking-tight">Chronicle</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {history.map((h, idx) => {
                                // Extract mood from entry text
                                const moodMatch = h.entry_text.match(/^\[Mood:\s*(.*?)\]\s*(.*)/s);
                                const rawMood = moodMatch ? moodMatch[1] : 'Focused';
                                const mainContent = moodMatch ? moodMatch[2] : h.entry_text;

                                // Case-insensitive lookup to ensure theme is found
                                const moodKey = Object.keys(moodConfigs).find(k => k.toLowerCase() === rawMood.toLowerCase()) || 'Focused';
                                const theme = moodConfigs[moodKey];

                                return (
                                    <motion.div
                                        key={h.id || idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        whileHover={{ scale: 1.04, y: -8 }}
                                        className={`group relative bg-white/[0.02] backdrop-blur-xl border rounded-3xl p-6 transition-all duration-300 flex flex-col h-full cursor-default ${theme.border} ${theme.hoverBorder} ${theme.glow}`}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                                {new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                            <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-md bg-white/5 ${theme.color}`}>
                                                {moodKey}
                                            </span>
                                        </div>

                                        <p className="text-gray-300 line-clamp-6 leading-relaxed text-sm mb-6 flex-grow group-hover:text-white transition-colors">
                                            {mainContent}
                                        </p>

                                        <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
                                            <Heart className={`w-4 h-4 transition-all duration-300 ${theme.color} opacity-20 group-hover:opacity-100 group-hover:scale-110`} />
                                            <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest group-hover:text-gray-400 transition-colors">
                                                Memory Logged
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}