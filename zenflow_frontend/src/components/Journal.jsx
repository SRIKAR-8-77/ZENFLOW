import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Sparkles, Send, Heart, Calendar, ArrowRight } from 'lucide-react';

export function Journal({ user, backendUrl }) {
    const [entry, setEntry] = useState('');
    const [history, setHistory] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedMood, setSelectedMood] = useState('Focused');

    const moods = [
        { name: 'Energized', icon: '⚡' },
        { name: 'Calm', icon: '🌊' },
        { name: 'Focused', icon: '🎯' },
        { name: 'Peaceful', icon: '☁️' }
    ];

    useEffect(() => {
        const fetchHistory = async () => {
            const token = localStorage.getItem('zenflow_token');
            if (!token) return;
            try {
                const response = await fetch(`${backendUrl}/get-journal-entries/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.ok) setHistory(await response.json());
            } catch (e) { console.error(e); }
        };
        fetchHistory();
    }, [backendUrl]);

    const handleSave = async () => {
        if (!entry.trim()) return;
        setIsSaving(true);
        const token = localStorage.getItem('zenflow_token');
        try {
            const response = await fetch(`${backendUrl}/add-journal-entry/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ entry: `[Mood: ${selectedMood}] ${entry}` })
            });
            if (response.ok) {
                setEntry('');
                const fresh = await fetch(`${backendUrl}/get-journal-entries/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (fresh.ok) setHistory(await fresh.json());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pt-32 pb-20 px-6 min-h-screen font-sans"
        >
            <div className="max-w-6xl mx-auto">
                <header className="text-center mb-12">
                    <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-rose-400 to-orange-400">
                        Reflections
                    </h1>
                    <p className="text-xl text-white/60 italic">Writing as a meditative act.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Entry Workspace */}
                    <div className="lg:col-span-12 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-orange-500/5 rounded-[3rem] blur-3xl pointer-events-none" />
                        <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-10 overflow-hidden shadow-2xl">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
                                <div className="flex gap-4">
                                    {moods.map((m) => (
                                        <button
                                            key={m.name}
                                            onClick={() => setSelectedMood(m.name)}
                                            className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center transition-all ${selectedMood === m.name ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30' : 'bg-white/5 text-white/40 hover:bg-white/10'
                                                }`}
                                        >
                                            <span className="text-2xl mb-1">{m.icon}</span>
                                            <span className="text-[8px] font-bold uppercase tracking-tighter">{m.name}</span>
                                        </button>
                                    ))}
                                </div>
                                <p className="text-white/40 text-sm italic font-medium">How is your energy flowing today?</p>
                            </div>

                            <textarea
                                value={entry}
                                onChange={(e) => setEntry(e.target.value)}
                                placeholder="Pour your thoughts onto the digital canvas..."
                                className="w-full h-64 bg-transparent border-none focus:ring-0 text-2xl text-white placeholder-white/20 resize-none font-medium leading-relaxed"
                            />

                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving || !entry.trim()}
                                    className="group flex items-center gap-3 bg-gradient-to-r from-pink-500 to-orange-500 px-10 py-5 rounded-3xl font-bold text-white shadow-xl shadow-pink-500/20 hover:shadow-orange-500/40 transition-all disabled:opacity-30"
                                >
                                    {isSaving ? 'Preserving Presence...' : 'Save Reflection'}
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Past Reflections */}
                    <div className="lg:col-span-12">
                        <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3 px-4">
                            <Calendar className="w-6 h-6 text-pink-400" />
                            Chronicle
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <AnimatePresence>
                                {history.map((h) => (
                                    <motion.div
                                        key={h.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-3xl p-6 hover:border-pink-500/30 transition-all cursor-pointer group"
                                    >
                                        <div className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4">
                                            {new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                        <p className="text-white/80 line-clamp-4 leading-relaxed font-medium mb-4 group-hover:text-white transition-colors">
                                            {h.entry_text}
                                        </p>
                                        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                            <Heart className="w-4 h-4 text-pink-500/20 group-hover:text-pink-500 transition-colors" />
                                            <span className="text-[10px] text-white/40 uppercase font-black">Memory Logged</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
