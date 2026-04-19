import React, { useState, useEffect } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom'; // Added useParams and Navigate
import { motion } from 'framer-motion';
import { Flame, Activity, Heart, Calendar, Sparkles, ChevronRight } from 'lucide-react';
import { WhyZenflow } from './WhyZenflow';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { y: 40, opacity: 0 },
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
    const { username } = useParams(); // Get the username from the URL
    const [sessions, setSessions] = useState([]);
    const [streak, setStreak] = useState(0);
    const [loading, setLoading] = useState(true);

   

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('zenflow_token');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const [sessionsRes, streakRes] = await Promise.all([
                    fetch(`${backendUrl}/${user.username}/get-sessions/`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${backendUrl}/${user.username}/get-streak/`, { headers: { Authorization: `Bearer ${token}` } })
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


    if (user && user.username !== username) {
        return <Navigate to={`/${user.username}`} replace />;
    }

    const avgAccuracy = sessions.length > 0
        ? Math.round(sessions.reduce((acc, s) => acc + (s.accuracy_score || 0), 0) / sessions.length)
        : 0;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="pt-28 pb-20 px-4 md:px-8 font-sans min-h-screen bg-[#080313] text-white relative overflow-hidden"
        >
            <div className="absolute top-[-10%] left-[50%] translate-x-[-50%] w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(99,56,249,0.05)_0%,rgba(0,0,0,0)_60%)] rounded-full pointer-events-none z-0"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: false, amount: 0.1 }}
                    variants={containerVariants} 
                    className="mb-20 mt-8 relative"
                >
                    <div className="flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-20">
                        <motion.div variants={itemVariants} className="relative w-full md:w-1/2 flex justify-center items-center">
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <motion.div 
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-80 h-80 md:w-[450px] md:h-[450px] bg-purple-600/40 rounded-full blur-[80px]"
                                />
                            </div>
                            <motion.div
                                whileHover={{ scale: 1.15, y: -15, filter: "drop-shadow(0px 30px 50px rgba(168, 85, 247, 0.8))" }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className="relative z-10 cursor-pointer"
                            >
                                <img src="/yoga-pose.svg" alt="Yoga Pose" className="w-80 h-80 md:w-[500px] md:h-[500px] object-contain drop-shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all duration-500" />
                            </motion.div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="w-full md:w-1/2 flex flex-col items-start text-left">
                            <motion.div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-purple-300 mb-6 backdrop-blur-md">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Your sanctuary awaits</span>
                            </motion.div>
                            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
                                Welcome <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400">
                                    {username || 'Seeker'}
                                </span>
                            </h1>
                            <p className="text-gray-400 text-lg md:text-xl max-w-md mb-10 leading-relaxed">
                                Your presence is your power. Step into your flow and continue your journey to mindfulness.
                            </p>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                {/* Updated to personalized /username/practice path */}
                                <Link to={`/${username}/practice`} className="group relative px-8 py-4 rounded-full bg-white text-black font-semibold text-sm overflow-hidden flex items-center gap-2 shadow-lg transition-all duration-300">
                                    <span className="relative z-10">Start Session</span>
                                    <ChevronRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-200 to-orange-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </Link>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>

                <WhyZenflow />

                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    variants={containerVariants}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8"
                >
                    <StatCard icon={<Flame className="w-5 h-5 text-orange-400" />} value={streak} label="Day Streak" trend="+1 today" trendUp={true} />
                    <StatCard icon={<Activity className="w-5 h-5 text-purple-400" />} value={`${avgAccuracy}%`} label="Avg Accuracy" trend="Looking good" trendUp={true} />
                    <StatCard icon={<Heart className="w-5 h-5 text-pink-400" />} value="Energized" label="Current State" trend="Optimal" trendUp={true} />
                    <StatCard icon={<Calendar className="w-5 h-5 text-blue-400" />} value={sessions.length} label="Total Sessions" trend="Keep it up" trendUp={true} />
                </motion.div>

                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    variants={containerVariants}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                    <ActivityPanel
                        title="Recent Sessions"
                        icon={<Activity className="w-5 h-5 text-purple-400" />}
                        items={sessions.slice(0, 3).map(s => ({
                            title: s.pose_name,
                            value: `${Math.round(s.accuracy_score ?? 0)}%`,
                            subtitle: `Duration: ${s.duration || 0} min • ${new Date(s.date).toLocaleDateString()}`,
                            valueColor: "text-purple-400"
                        }))}
                    />
                    <ActivityPanel
                        title="Insight Stream"
                        icon={<Sparkles className="w-5 h-5 text-orange-400" />}
                        items={sessions.slice(0, 3).filter(s => s.feedback_text).map(s => ({
                            title: "Coach Feedback",
                            value: "View",
                            subtitle: s.feedback_text,
                            valueColor: "text-orange-400"
                        }))}
                    />
                </motion.div>
            </div>
        </motion.div>
    );
}

// Helper components remain unchanged
function StatCard({ icon, value, label, trend, trendUp }) {
    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex flex-col justify-between h-full hover:bg-white/[0.04] transition-all duration-300"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">{icon}</div>
                {trend && <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${trendUp ? 'bg-purple-500/10 text-purple-400' : 'bg-gray-500/10 text-gray-400'}`}>{trend}</span>}
            </div>
            <div>
                <div className="text-3xl font-semibold text-white mb-1">{value}</div>
                <div className="text-sm text-gray-400">{label}</div>
            </div>
        </motion.div>
    );
}

function ActivityPanel({ title, icon, items }) {
    return (
        <motion.div variants={itemVariants} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex flex-col h-full transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">{icon}</div>
                <h2 className="text-lg font-medium text-white">{title}</h2>
            </div>
            <div className="flex-1 flex flex-col gap-3">
                {items.length > 0 ? items.map((item, index) => (
                    <motion.div key={index} whileHover={{ x: 4 }} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.04] transition-all">
                        <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium text-gray-200">{item.title}</span>
                            <span className="text-xs text-gray-500 line-clamp-1">{item.subtitle}</span>
                        </div>
                        <span className={`text-sm font-medium ${item.valueColor}`}>{item.value}</span>
                    </motion.div>
                )) : (
                    <div className="flex-1 flex items-center justify-center py-8">
                        <p className="text-sm text-gray-500 italic">No presence data yet.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}