import React from 'react';
import { HistoryIcon, DetailIcon } from './Icons';

export const SessionDetailView = React.forwardRef(({ session, onClose }, ref) => {
    if (!session) return null;

    return (
        <div ref={ref} className="zen-card glass-dark animate-in fade-in zoom-in-95 duration-500 border-white/10">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-white flex items-center tracking-tight">
                    <span className="w-8 h-8 rounded-xl bg-primary-500/20 flex items-center justify-center mr-3 text-primary-400">
                        <DetailIcon />
                    </span>
                    Flow Analysis
                </h2>
                <button
                    onClick={onClose}
                    className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all duration-300"
                >
                    &times;
                </button>
            </div>

            <div className="overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02]">
                <table className="min-w-full divide-y divide-white/5">
                    <thead className="bg-white/5">
                        <tr>
                            <th className="py-5 px-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Asana Pattern</th>
                            <th className="py-5 px-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Flow Time</th>
                            <th className="py-5 px-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Reps</th>
                            <th className="py-5 px-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Alignment</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {session.summary.map((poseData, index) => (
                            <tr key={index} className="hover:bg-white/5 transition-colors group">
                                <td className="py-4 px-6 whitespace-nowrap font-bold text-slate-200">{poseData['Yoga Pose']}</td>
                                <td className="py-4 px-6 whitespace-nowrap text-slate-400 font-medium">{poseData['Total Time (s)']}s</td>
                                <td className="py-4 px-6 whitespace-nowrap text-slate-400 font-medium">{poseData['Repetitions']}</td>
                                <td className="py-4 px-6 whitespace-nowrap">
                                    <div className="flex items-center space-x-3">
                                        <div className="flex-1 h-1.5 bg-slate-800 rounded-full w-16 overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-1000"
                                                style={{ width: `${poseData['Average Accuracy (%)']}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs font-black text-primary-400">
                                            {poseData['Average Accuracy (%)']}%
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
});

export function SessionHistory({ sessions, onSelectSession }) {
    const calculateSessionAvgAccuracy = (session) => {
        if (!session.summary || session.summary.length === 0) return 0;
        const accuracies = session.summary.map(pose => pose['Average Accuracy (%)']);
        const sum = accuracies.reduce((a, b) => a + b, 0);
        return (sum / accuracies.length).toFixed(1);
    };

    return (
        <div className="zen-card relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-500/5 blur-[50px] rounded-full pointer-events-none"></div>

            <h2 className="text-xl font-bold mb-8 text-white flex items-center tracking-tight">
                <span className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center mr-3 text-slate-400 shadow-inner">
                    <HistoryIcon />
                </span>
                Practice Journey
            </h2>

            <div className="overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02]">
                <table className="min-w-full divide-y divide-white/5">
                    <thead className="bg-white/5">
                        <tr>
                            <th className="py-5 px-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Cycle</th>
                            <th className="py-5 px-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Duration</th>
                            <th className="py-5 px-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Alignment</th>
                            <th className="py-5 px-6 text-right text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Insights</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {sessions.length > 0 ? (
                            sessions.map((session, idx) => (
                                <tr key={session.id} className="group hover:bg-white/5 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${idx * 100}ms` }}>
                                    <td className="py-5 px-6 whitespace-nowrap">
                                        <p className="text-sm font-bold text-white">
                                            {new Date(session.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-1">{session.summary.length} patterns discovered</p>
                                    </td>
                                    <td className="py-5 px-6 whitespace-nowrap text-slate-400 font-medium text-sm">
                                        {Math.floor(session.total_time / 60)}m {session.total_time % 60}s
                                    </td>
                                    <td className="py-5 px-6 whitespace-nowrap">
                                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black bg-primary-500/10 text-primary-400 border border-primary-500/20">
                                            {calculateSessionAvgAccuracy(session)}% Alignment
                                        </span>
                                    </td>
                                    <td className="py-5 px-6 whitespace-nowrap text-right">
                                        <button
                                            onClick={() => onSelectSession(session)}
                                            className="inline-flex items-center px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white border border-white/10 hover:border-primary-500/50 hover:bg-primary-500/10 transition-all group-hover:scale-105 active:scale-95 shadow-xl shadow-black/20"
                                        >
                                            View Report
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="py-24 text-center">
                                    <div className="flex flex-col items-center animate-pulse">
                                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10 grayscale">
                                            <HistoryIcon />
                                        </div>
                                        <p className="text-slate-400 font-medium italic text-sm">"Your practice journey starts with your first breath."</p>
                                        <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em] mt-3">Sanctuary Awaiting Data</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
