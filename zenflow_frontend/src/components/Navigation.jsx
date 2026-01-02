import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Camera, BookOpen, MessageCircle, Library, TrendingUp, LogOut } from 'lucide-react';

const navItems = [
    { id: 'dashboard', label: 'Flow', icon: Sparkles },
    { id: 'practice', label: 'Vision', icon: Camera },
    { id: 'journal', label: 'Reflect', icon: BookOpen },
    { id: 'coach', label: 'Mentor', icon: MessageCircle },
    { id: 'library', label: 'Vault', icon: Library },
    { id: 'progress', label: 'Journey', icon: TrendingUp },
];

export function Navigation({ currentView, onViewChange, user, onLogout }) {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6 font-sans">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-2"
                >
                    <div className="flex items-center justify-between">
                        <motion.div
                            className="flex items-center gap-3 px-4"
                            whileHover={{ scale: 1.05 }}
                        >
                            <img src="/logo.png" alt="ZenFlow Logo" className="w-10 h-10 rounded-xl shadow-lg shadow-purple-500/20" />
                            <span className="text-xl tracking-wider text-white">ZenFlow</span>
                        </motion.div>

                        <div className="flex gap-2 items-center">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = currentView === item.id;

                                return (
                                    <motion.button
                                        key={item.id}
                                        onClick={() => onViewChange(item.id)}
                                        className={`relative px-5 py-2.5 rounded-xl transition-colors ${isActive ? 'text-white' : 'text-white/60 hover:text-white/80'
                                            }`}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeNav"
                                                className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        <span className="relative flex items-center gap-2">
                                            <Icon className="w-4 h-4" />
                                            <span className="hidden lg:inline">{item.label}</span>
                                        </span>
                                    </motion.button>
                                );
                            })}
                        </div>

                        {user && (
                            <div className="flex items-center gap-4 pl-4 border-l border-white/10 ml-2">
                                <div className="hidden sm:flex flex-col items-end">
                                    <span className="text-xs font-bold text-white tracking-wide">{user.username}</span>
                                    <span className="text-[8px] uppercase tracking-widest text-emerald-400/60 font-black">Practitioner</span>
                                </div>
                                <motion.button
                                    onClick={onLogout}
                                    whileHover={{ scale: 1.1, color: '#f43f5e' }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all group"
                                    title="Leave Sanctuary"
                                >
                                    <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                </motion.button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </nav>
    );
}
