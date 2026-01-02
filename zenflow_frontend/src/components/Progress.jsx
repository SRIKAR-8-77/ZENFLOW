import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, Heart, Award, ChevronRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Progress({ backendUrl }) {
    const [sessions, setSessions] = useState([]);

    useEffect(() => {
        const fetchHistory = async () => {
            const token = localStorage.getItem('zenflow_token');
            if (!token) return;
            try {
                const response = await fetch(`${backendUrl}/get-sessions/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.ok) setSessions(await response.json());
            } catch (e) { console.error(e); }
        };
        fetchHistory();
    }, [backendUrl]);

    const chartData = [...sessions].reverse().map(s => ({
        date: new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        accuracy: Math.round(s.accuracy_score)
    }));

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pt-32 pb-20 px-6 min-h-screen font-sans"
        >
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-16">
                    <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400">
                        The Journey
                    </h1>
                    <p className="text-xl text-white/60">Visualization of your path to presence.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Chart Area */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-purple-500/5 rounded-[3rem] blur-3xl" />
                            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-10">
                                <div className="flex items-center justify-between mb-12">
                                    <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                        <TrendingUp className="w-6 h-6 text-purple-400" />
                                        Accuracy Velocity
                                    </h3>
                                    <span className="px-5 py-2 bg-purple-500/20 text-purple-400 rounded-full text-xs font-bold uppercase tracking-widest">30 Day Flow</span>
                                </div>

                                <div className="h-[400px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                            <XAxis
                                                dataKey="date"
                                                stroke="rgba(255,255,255,0.3)"
                                                fontSize={10}
                                                tickLine={false}
                                                axisLine={false}
                                                dy={10}
                                            />
                                            <YAxis
                                                stroke="rgba(255,255,255,0.3)"
                                                fontSize={10}
                                                tickLine={false}
                                                axisLine={false}
                                                domain={[0, 100]}
                                            />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' }}
                                                itemStyle={{ color: '#fff' }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="accuracy"
                                                stroke="#8b5cf6"
                                                strokeWidth={4}
                                                fillOpacity={1}
                                                fill="url(#colorAcc)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <AchievementCard
                                icon={<Award className="w-8 h-8 text-yellow-400" />}
                                title="Early Adopter"
                                description="One of the first 100 practitioners to enter the sanctuary."
                                status="complete"
                            />
                            <AchievementCard
                                icon={<Heart className="w-8 h-8 text-pink-400" />}
                                title="Perfect Alignment"
                                description="Achieve 100% accuracy in any advanced pose."
                                status="locked"
                            />
                        </div>
                    </div>

                    {/* Session Timeline */}
                    <div className="lg:col-span-4 relative">
                        <div className="absolute inset-0 bg-pink-500/5 rounded-3xl blur-3xl" />
                        <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-h-[800px] overflow-y-auto custom-scrollbar">
                            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-pink-400" />
                                Memory Stream
                            </h3>
                            <div className="space-y-6">
                                {sessions.map((s, idx) => (
                                    <div key={s.id} className="relative pl-8 border-l border-white/5 pb-6 last:pb-0">
                                        <div className="absolute left-[-5px] top-0 w-[10px] h-[10px] rounded-full bg-purple-500 shadow-[0_0_10px_#8b5cf6]" />
                                        <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-2">
                                            {new Date(s.date).toLocaleDateString()}
                                        </div>
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all">
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-white">{s.pose_name}</span>
                                                <span className="text-sm font-black text-cyan-400">{Math.round(s.accuracy_score)}%</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function AchievementCard({ icon, title, description, status }) {
    return (
        <div className={`relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 transition-all ${status === 'locked' ? 'opacity-40 grayscale' : 'hover:border-white/30'}`}>
            <div className="flex items-start gap-6">
                <div className="p-4 bg-white/5 rounded-2xl flex-shrink-0">{icon}</div>
                <div>
                    <h4 className="text-lg font-bold text-white mb-1">{title}</h4>
                    <p className="text-white/40 text-xs leading-relaxed">{description}</p>
                </div>
            </div>
            {status === 'complete' && <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#2dd4bf]" />}
        </div>
    );
}
