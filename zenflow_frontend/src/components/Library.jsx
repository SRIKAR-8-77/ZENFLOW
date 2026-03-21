import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Library as LibraryIcon, Search, Filter, BookOpen, Clock, Activity, ChevronRight } from 'lucide-react';

export function Library({ backendUrl }) {
    const [exercises, setExercises] = useState([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All');
    const [selectedPose, setSelectedPose] = useState(null);

    useEffect(() => {
        const fetchExercises = async () => {
            try {
                const response = await fetch(`${backendUrl}/get-exercises/`);
                if (response.ok) setExercises(await response.json());
            } catch (e) { console.error(e); }
        };
        fetchExercises();
    }, [backendUrl]);

    const categories = ['All', 'Balance', 'Strength', 'Flexibility'];

    const filtered = exercises.filter(ex =>
        (filter === 'All' || ex.category === filter) &&
        ex.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pt-32 pb-20 px-6 min-h-screen font-sans"
        >
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div>
                        <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-emerald-400 to-cyan-400">
                            The Vault
                        </h1>
                        <p className="text-xl text-white/60">A repository of sacred movements.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-cyan-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search poses..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all w-full sm:w-64"
                            />
                        </div>
                        <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setFilter(cat)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${filter === cat ? 'bg-white/10 text-white shadow-lg' : 'text-white/40 hover:text-white/60'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <AnimatePresence>
                        {filtered.map((ex) => (
                            <motion.div
                                layout
                                key={ex.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                whileHover={{ y: -10 }}
                                onClick={() => setSelectedPose(ex)}
                                className="relative group cursor-pointer"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-emerald-500/10 rounded-3xl blur-xl group-hover:bg-blue-500/20 transition-all" />
                                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 h-full flex flex-col">
                                    <div className="aspect-video w-full rounded-2xl overflow-hidden mb-6 bg-white/5 border border-white/10">
                                        {ex.thumbnail ? (
                                            <img
                                                src={`${backendUrl}/${ex.thumbnail}`}
                                                alt={ex.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <LibraryIcon className="w-10 h-10 text-emerald-400/40" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-white mb-1">{ex.name}</h3>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60 mb-3 block">{ex.category}</span>
                                        <p className="text-white/40 text-xs line-clamp-2 italic">{ex.description}</p>
                                    </div>
                                    <div className="w-full pt-4 mt-6 border-t border-white/5 flex items-center justify-between text-white/20 group-hover:text-white/40 transition-colors">
                                        <Activity className="w-4 h-4" />
                                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Modal-like Detail View */}
                <AnimatePresence>
                    {selectedPose && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={() => setSelectedPose(null)}
                                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ scale: 0.9, y: 50, opacity: 0 }}
                                animate={{ scale: 1, y: 0, opacity: 1 }}
                                exit={{ scale: 0.9, y: 50, opacity: 0 }}
                                className="relative bg-slate-900 border border-white/10 rounded-[2.5rem] overflow-hidden max-w-4xl w-full shadow-2xl flex flex-col md:flex-row"
                            >
                                <div className="md:w-1/2 h-64 md:h-auto bg-white/5">
                                    {selectedPose.thumbnail ? (
                                        <img
                                            src={`${backendUrl}/${selectedPose.thumbnail}`}
                                            alt={selectedPose.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <LibraryIcon className="w-20 h-20 text-white/10" />
                                        </div>
                                    )}
                                </div>

                                <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                                    <div>
                                        <h2 className="text-4xl font-bold text-white mb-2">{selectedPose.name}</h2>
                                        <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">{selectedPose.category} Sanctuary</span>
                                    </div>

                                    <div className="mt-8 space-y-6">
                                        <p className="text-lg text-white/70 leading-relaxed italic">"{selectedPose.description}"</p>

                                        <div className="grid grid-cols-2 gap-4 pt-8 border-t border-white/10">
                                            <div className="p-4 bg-white/5 rounded-2xl text-center">
                                                <Clock className="w-5 h-5 text-cyan-400/40 mx-auto mb-2" />
                                                <span className="block text-lg font-bold text-white">5-10m</span>
                                                <span className="text-[8px] uppercase tracking-widest text-white/20">Recommended</span>
                                            </div>
                                            <div className="p-4 bg-white/5 rounded-2xl text-center">
                                                <Activity className="w-5 h-5 text-emerald-400/40 mx-auto mb-2" />
                                                <span className="block text-lg font-bold text-white">Steady</span>
                                                <span className="text-[8px] uppercase tracking-widest text-white/20">Pace</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setSelectedPose(null)}
                                        className="mt-10 w-full py-4 bg-white text-slate-950 rounded-xl font-bold uppercase tracking-widest hover:bg-cyan-400 transition-colors"
                                    >
                                        Return to Vault
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
