import React, { useState } from 'react';
import { JournalIcon, JournalHistoryIcon } from './Icons';

function SentimentIndicator({ label, score }) {
    const sentiment = label?.toUpperCase();
    const isPositive = sentiment === 'POSITIVE';
    const isNegative = sentiment === 'NEGATIVE';

    const colorClass = isPositive ? 'text-accent-400 bg-accent-400/10 border-accent-400/20' : isNegative ? 'text-rose-400 bg-rose-400/10 border-rose-400/20' : 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    const emoji = isPositive ? '✨' : isNegative ? '🌊' : '🍃';

    if (!sentiment || typeof score !== 'number') return null;

    return (
        <div className={`mt-4 inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black border tracking-wider animate-in fade-in duration-500 ${colorClass}`}>
            <span className="mr-2 text-xs">{emoji}</span>
            {sentiment} • {(score * 100).toFixed(0)}% resonance
        </div>
    );
}

export function Journal({ user, backendUrl, onEntrySaved }) {
    const [entry, setEntry] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!entry.trim()) return;

        setIsSubmitting(true);
        setMessage(null);

        try {
            const token = localStorage.getItem('zenflow_token');
            if (!token) return;
            const response = await fetch(`${backendUrl}/add-journal-entry/`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ entry: entry }),
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Reflection anchored in your digital sanctuary.' });
                setEntry('');
                onEntrySaved();
            } else {
                setMessage({ type: 'error', text: 'The flow is blocked. Seek the connection again.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'The sanctuary is disconnected. Check your connection.' });
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setMessage(null), 5000);
        }
    };

    return (
        <div className="zen-card relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-24 h-24 bg-accent-500/5 blur-[40px] rounded-full pointer-events-none"></div>

            <h2 className="text-xl font-bold mb-8 text-white flex items-center tracking-tight">
                <span className="w-8 h-8 rounded-xl bg-accent-500/20 flex items-center justify-center mr-3 text-accent-400">
                    <JournalIcon />
                </span>
                Daily Reflection
            </h2>

            <div className="mb-8 flex justify-center">
                <div className="w-40 h-40 bg-white/5 rounded-full flex items-center justify-center p-6 relative group-hover:scale-105 transition-transform duration-700">
                    <div className="absolute inset-0 bg-accent-500/5 animate-pulse-glow rounded-full"></div>
                    <img src="/assets/journal.png" alt="Journaling" className="w-full h-full object-contain mix-blend-screen opacity-90 drop-shadow-[0_0_15px_rgba(45,212,191,0.3)]" />
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <textarea
                    value={entry}
                    onChange={(e) => setEntry(e.target.value)}
                    placeholder="Capture your inner flow..."
                    className="zen-input w-full min-h-[160px] resize-none leading-relaxed text-slate-200 placeholder:text-slate-600"
                ></textarea>

                <button
                    type="submit"
                    disabled={isSubmitting || !entry.trim()}
                    className="zen-button-primary w-full !bg-gradient-to-r from-accent-600 to-teal-500 shadow-accent-500/20 disabled:grayscale disabled:opacity-30 disabled:shadow-none"
                >
                    {isSubmitting ? 'Anchoring...' : 'Anchor Reflection'}
                </button>

                {message && (
                    <div className={`p-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.1em] border animate-in fade-in zoom-in-95 duration-500
                        ${message.type === 'success' ? 'bg-accent-500/10 text-accent-400 border-accent-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                        {message.text}
                    </div>
                )}
            </form>
        </div>
    );
}

export function JournalHistory({ entries }) {
    return (
        <div className="zen-card glass-dark relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/5 blur-[80px] rounded-full pointer-events-none"></div>

            <h2 className="text-xl font-bold mb-8 text-white flex items-center tracking-tight">
                <span className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center mr-3 text-slate-400 shadow-inner">
                    <JournalHistoryIcon />
                </span>
                Reflection Path
            </h2>

            <div className="space-y-8 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar relative z-10">
                {entries.length > 0 ? (
                    entries.map((entry, idx) => (
                        <div key={entry.id} className="group relative pl-8 pb-8 border-l border-white/10 last:pb-0 animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                            <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-slate-900 border border-accent-400 shadow-[0_0_10px_rgba(45,212,191,0.5)] group-hover:scale-150 transition-transform"></div>
                            <div className="bg-white/5 rounded-3xl p-6 border border-white/5 group-hover:bg-white/[0.08] group-hover:border-white/10 transition-all shadow-xl">
                                <div className="flex justify-between items-start mb-4">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">
                                        {new Date(entry.date).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                    </p>
                                    <div className="w-1.5 h-1.5 bg-accent-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>
                                <p className="text-slate-300 leading-relaxed italic text-sm">"{entry.entry_text}"</p>
                                <SentimentIndicator label={entry.sentiment} score={entry.sentiment_score} />
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5 opacity-30">
                            <JournalIcon />
                        </div>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-2">The path is clear</p>
                        <p className="text-[10px] text-slate-600 italic">"Write for yourself, no one else is watching."</p>
                    </div>
                )}
            </div>
        </div>
    );
}
