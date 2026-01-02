import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Activity, Heart, Calendar, TrendingUp, Sparkles } from 'lucide-react';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
};

const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 15,
        },
    },
};

export function Dashboard({ user, backendUrl }) {
    const [sessions, setSessions] = useState([]);
    const [streak, setStreak] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('zenflow_token');
            if (!token) return;

            try {
                const [sessionsRes, streakRes] = await Promise.all([
                    fetch(`${backendUrl}/get-sessions/`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${backendUrl}/get-streak/`, { headers: { Authorization: `Bearer ${token}` } })
                ]);

                if (sessionsRes.ok) setSessions(await sessionsRes.json());
                if (streakRes.ok) {
                    const data = await streakRes.json();
                    setStreak(data.streak);
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [backendUrl]);

    const avgAccuracy = sessions.length > 0
        ? Math.round(sessions.reduce((acc, s) => acc + (s.accuracy_score || 0), 0) / sessions.length)
        : 0;

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -50 }}
            className="pt-32 pb-20 px-6 font-sans"
        >
            <div className="max-w-7xl mx-auto">
                {/* Hero Section */}
                <motion.div variants={itemVariants} className="text-center mb-16">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 180, 360],
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 opacity-20 blur-3xl"
                    />
                    <motion.h1
                        className="text-6xl md:text-8xl mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 font-bold"
                        style={{ paddingBottom: '0.1em' }}
                    >
                        Welcome, {user?.username || 'Seeker'}
                    </motion.h1>
                    <p className="text-xl text-white/60">Your presence is your power.</p>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <StatCard
                        icon={<Flame className="w-10 h-10 text-orange-400" />}
                        value={streak}
                        label="Day Streak"
                        trend="🔥"
                        color="from-orange-500/20 to-red-500/20"
                        hoverColor="hover:border-orange-500/30"
                    />
                    <StatCard
                        icon={<Activity className="w-10 h-10 text-purple-400" />}
                        value={`${avgAccuracy}%`}
                        label="Avg Accuracy"
                        trend={<TrendingUp className="w-6 h-6 text-green-400" />}
                        color="from-purple-500/20 to-pink-500/20"
                        hoverColor="hover:border-purple-500/30"
                    />
                    <StatCard
                        icon={<Heart className="w-10 h-10 text-pink-400" />}
                        value="Energized"
                        label="Current State"
                        trend="⚡"
                        color="from-pink-500/20 to-rose-500/20"
                        hoverColor="hover:border-pink-500/30"
                    />
                    <StatCard
                        icon={<Calendar className="w-10 h-10 text-blue-400" />}
                        value={sessions.length}
                        label="Total Sessions"
                        trend={<Sparkles className="w-6 h-6 text-yellow-400" />}
                        color="from-blue-500/20 to-cyan-500/20"
                        hoverColor="hover:border-blue-500/30"
                    />
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <ActivityPanel
                        title="Recent Sessions"
                        icon={<Activity className="w-6 h-6 text-purple-400" />}
                        items={sessions.slice(0, 3).map(s => ({
                            title: s.pose_name,
                            value: `${Math.round(s.accuracy_score)}%`,
                            subtitle: `Duration: ${s.duration || 0} min • ${new Date(s.date).toLocaleDateString()}`,
                            color: "text-purple-400"
                        }))}
                        gradient="from-purple-500/10 to-pink-500/10"
                    />
                    <ActivityPanel
                        title="Insight Stream"
                        icon={<Sparkles className="w-6 h-6 text-cyan-400" />}
                        items={sessions.slice(0, 3).filter(s => s.feedback_text).map(s => ({
                            title: "Coach Feedback",
                            value: "✨",
                            subtitle: s.feedback_text,
                            color: "text-cyan-400"
                        }))}
                        gradient="from-cyan-500/10 to-blue-500/10"
                    />
                </div>
            </div>
        </motion.div>
    );
}

function StatCard({ icon, value, label, trend, color, hoverColor }) {
    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            className="relative group"
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${color} rounded-3xl blur-xl group-hover:blur-2xl transition-all`} />
            <div className={`relative h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 ${hoverColor} transition-colors`}>
                <div className="flex items-center justify-between mb-4">
                    {icon}
                    <div className="text-2xl">{trend}</div>
                </div>
                <div className="text-5xl font-bold mb-2 text-white">{value}</div>
                <div className="text-white/60 font-medium uppercase tracking-wider text-xs">{label}</div>
            </div>
        </motion.div>
    );
}

function ActivityPanel({ title, icon, items, gradient }) {
    return (
        <motion.div variants={itemVariants} className="relative group">
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-3xl blur-xl`} />
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
                    {icon}
                    {title}
                </h2>
                <div className="space-y-4">
                    {items.length > 0 ? items.map((item, index) => (
                        <motion.div
                            key={index}
                            whileHover={{ x: 10 }}
                            className="bg-white/5 rounded-2xl p-5 border border-white/5 hover:border-white/20 transition-all"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-lg font-semibold text-white">{item.title}</span>
                                <span className={item.color}>{item.value}</span>
                            </div>
                            <div className="text-sm text-white/60 line-clamp-2 italic">
                                {item.subtitle}
                            </div>
                        </motion.div>
                    )) : (
                        <p className="text-white/40 italic py-8 text-center">No presence data yet. Begin your journey.</p>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
