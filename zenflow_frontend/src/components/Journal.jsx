import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Sparkles, Send, Heart, Calendar, ArrowRight, Zap, Waves, Target, Cloud } from 'lucide-react';

export function Journal({ user, backendUrl }) {
    const [entry, setEntry] = useState('');
    const [history, setHistory] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedMood, setSelectedMood] = useState('Focused');

    // Replaced emojis with premium Lucide icons and specific glow colors
    const moods = [
        { name: 'Energized', icon: Zap, activeColor: 'text-yellow-400', activeBg: 'bg-yellow-400/10', border: 'border-yellow-400/50', shadow: 'shadow-yellow-500/20' },
        { name: 'Calm', icon: Waves, activeColor: 'text-blue-400', activeBg: 'bg-blue-400/10', border: 'border-blue-400/50', shadow: 'shadow-blue-500/20' },
        { name: 'Focused', icon: Target, activeColor: 'text-purple-400', activeBg: 'bg-purple-400/10', border: 'border-purple-400/50', shadow: 'shadow-purple-500/20' },
        { name: 'Peaceful', icon: Cloud, activeColor: 'text-teal-400', activeBg: 'bg-teal-400/10', border: 'border-teal-400/50', shadow: 'shadow-teal-500/20' }
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
        <div className="w-full max-w-5xl mx-auto px-4 md:px-8 py-12 lg:py-20 font-sans">
            {/* Header */}
            <header className="text-center mb-8 mt-8" >
                <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl md:text-6xl font-bold mb-4 tracking-tight"
                >
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-400 to-orange-400">
                        Reflections
                    </span>
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-400 text-lg italic"
                >
                    Writing as a meditative act.
                </motion.p>
            </header>

            <div className="flex flex-col gap-12">
                {/* Entry Workspace */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative group"
                >
                    {/* Ambient Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-orange-500/5 rounded-[2rem] blur-2xl pointer-events-none transition-all duration-500 group-hover:from-pink-500/10 group-hover:to-orange-500/10" />
                    
                    <div className="relative bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 md:p-10 overflow-hidden transition-colors hover:bg-white/[0.03]">
                        
                        {/* Mood Selector */}
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10 border-b border-white/5 pb-8">
                            <div className="flex flex-wrap gap-3 md:gap-4">
                                {moods.map((m) => {
                                    const isSelected = selectedMood === m.name;
                                    const Icon = m.icon;
                                    return (
                                        <button
                                            key={m.name}
                                            onClick={() => setSelectedMood(m.name)}
                                            className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 border
                                                ${isSelected 
                                                    ? `${m.activeBg} ${m.border} ${m.activeColor} shadow-lg ${m.shadow} scale-105` 
                                                    : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-300'
                                                }`}
                                        >
                                            <Icon className={`w-6 h-6 md:w-8 md:h-8 mb-2 ${isSelected ? m.activeColor : 'text-current'}`} strokeWidth={isSelected ? 2.5 : 2} />
                                            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest">{m.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="text-gray-500 text-sm italic font-medium">How is your energy flowing today?</p>
                        </div>

                        {/* Text Area */}
                        <textarea
                            value={entry}
                            onChange={(e) => setEntry(e.target.value)}
                            placeholder="Pour your thoughts onto the digital canvas..."
                            className="w-full h-56 md:h-64 bg-transparent border-none focus:ring-0 outline-none text-xl md:text-2xl text-gray-200 placeholder-gray-600 resize-none font-medium leading-relaxed"
                        />

                        {/* Action Footer */}
                        <div className="mt-8 flex justify-end pt-6 border-t border-white/5">
                            <button
                                onClick={handleSave}
                                disabled={isSaving || !entry.trim()}
                                className="group flex items-center gap-3 bg-white text-black px-8 py-3.5 rounded-full font-semibold text-sm hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? 'Preserving Presence...' : 'Save Reflection'}
                                {!isSaving && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Past Reflections */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8"
                >
                    <div className="flex items-center gap-3 mb-8 px-2">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <h3 className="text-xl font-bold text-white tracking-tight">Chronicle</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {history.map((h, idx) => (
                                <motion.div
                                    key={h.id || idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl p-6 hover:bg-white/[0.04] hover:border-white/10 transition-all cursor-pointer group flex flex-col h-full"
                                >
                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">
                                        {new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                    <p className="text-gray-300 line-clamp-4 leading-relaxed text-sm mb-6 flex-grow group-hover:text-white transition-colors">
                                        {h.entry_text}
                                    </p>
                                    <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
                                        <Heart className="w-4 h-4 text-gray-600 group-hover:text-pink-500 transition-colors" />
                                        <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Memory Logged</span>
                                    </div>
                                </motion.div>
                            ))}
                            {history.length === 0 && (
                            <motion.div 
                                    key="empty-state"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                   className="col-span-full text-center py-12 border border-dashed border-white/10 rounded-3xl bg-white/[0.01]"
                                >
                                    <BookOpen className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                                    <p className="text-gray-500 text-sm">Your chronicle is empty. Begin your journey above.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}