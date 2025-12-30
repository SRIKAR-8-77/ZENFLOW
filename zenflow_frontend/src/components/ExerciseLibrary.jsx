import React, { useState, useEffect } from 'react';
import { SearchIcon, CloseIcon } from './Icons';

// Mapping pose IDs to image filenames
const getPoseImg = (id) => {
    const nameMap = {
        'adho_mukha_svanasana': 'Adho Mukha Svanasana.jpeg',
        'adho_mukha_vrksasana': 'Adho Mukha Vrksasana.jpg',
        'alanasana': 'Alanasana.jpg',
        'anjaneyasana': 'Anjaneyasana.jpg',
        'ardha_chandrasana': 'Ardha Chandrasana.jpg',
        'ardha_matsyendrasana': 'Ardha Matsyendrasana.jpg',
        'ardha_navasana': 'Ardha Navasana.jpg',
        'ardha_pincha_mayurasana': 'Ardha Pincha Mayurasana.jpg',
        'ashta_chandrasana': 'Ashta Chandrasana.jpg',
        'baddha_konasana': 'Baddha Konasana.jpg',
        'bakasana': 'Bakasana.jpg',
        'balasana': 'Balasana.jpg',
        'bitilasana': 'Bitilasana.jpg',
        'camatkarasana': 'Camatkarasana.jpg',
        'chaturanga_dandasana': 'Chaturanga Dandasana.jpg',
        'dhanurasana': 'Dhanurasana.jpg',
        'eka_pada_rajakapotasana': 'Eka Pada Rajakapotasana.jpg',
        'garudasana': 'Garudasana.jpg',
        'halasana': 'Halasana.jpg',
        'hanumanasana': 'Hanumanasana.jpg',
        'malasana': 'Malasana.jpg',
        'marjaryasana': 'Marjaryasana.jpg',
        'navasana': 'Navasana.jpg',
        'padmasana': 'Padmasana.jpg',
        'parsva_virabhadrasana': 'Parsva Virabhadrasana.jpg',
        'parsvottanasana': 'Parsvottanasana.jpg',
        'paschimottanasana': 'Paschimottanasana.jpg',
        'phalakasana': 'Phalakasana.jpg',
        'pincha_mayurasana': 'Pincha Mayurasana.jpg',
        'salamba_bhujangasana': 'Salamba Bhujangasana.jpg',
        'salamba_sarvangasana': 'Salamba Sarvangasana.jpg',
        'setu_bandha_sarvangasana': 'Setu Bandha Sarvangasana.jpg',
        'sivasana': 'Sivasana.jpg',
        'supta_kapotasana': 'Supta Kapotasana.jpg',
        'trikonasana': 'Trikonasana.jpg',
        'upavistha_konasana': 'Upavistha Konasana.jpg',
        'urdhva_dhanurasana': 'Urdhva Dhanurasana.jpg',
        'urdhva_mukha_svsnssana': 'Urdhva Mukha Svsnssana.jpg',
        'ustrasana': 'Ustrasana.jpg',
        'utkatasana': 'Utkatasana.jpg',
        'uttanasana': 'Uttanasana.jpg',
        'utthita_hasta_padangusthasana': 'Utthita Hasta Padangusthasana.jpg',
        'utthita_parsvakonasana': 'Utthita Parsvakonasana.jpg',
        'vasisthana': 'Vasisthana.jpg',
        'virabhadrasana_one': 'Virabhadrasana One.jpg',
        'virabhadrasana_three': 'Virabhadrasana Three.jpg',
        'virabhadrasana_two': 'Virabhadrasana Two.jpg',
        'vrkasana': 'Vrkasana.jpg'
    };
    return nameMap[id] ? `/assets/asanas/${nameMap[id]}` : null;
};

export default function ExerciseLibrary({ user, backendUrl, onBack }) {
    const [exercises, setExercises] = useState([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAsana, setSelectedAsana] = useState(null);

    useEffect(() => {
        const fetchExercises = async () => {
            try {
                const res = await fetch(`${backendUrl}/get-exercises/`);
                if (res.ok) {
                    const data = await res.json();
                    setExercises(data);
                }
            } catch (error) {
                console.error("Failed to fetch exercises:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchExercises();
    }, [backendUrl]);

    const categories = ['All', 'Balance', 'Strength', 'Flexibility'];

    const filteredExercises = exercises.filter(ex => {
        const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'All' || ex.category === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Library Hero Section */}
            <div className="relative rounded-[3rem] overflow-hidden mb-12 group h-64 shadow-2xl">
                <img
                    src="/assets/library_hero.png"
                    alt="Asana Sanctuary"
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>

                <div className="absolute bottom-8 left-10">
                    <h2 className="text-5xl font-black text-white tracking-tighter">Asana Sanctuary</h2>
                    <p className="text-sm text-primary-400 font-bold uppercase tracking-[0.3em] mt-2">The Digital Archives of Presence</p>
                </div>

                <div className="absolute top-8 right-10">
                    <button
                        onClick={onBack}
                        className="zen-button-secondary py-3 px-6 text-[10px] uppercase tracking-widest font-black flex items-center bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
                    >
                        <span className="mr-2">←</span> Return to Dashboard
                    </button>
                </div>
            </div>

            <div className="grid md:grid-cols-12 gap-8 mb-12">
                {/* Search Bar */}
                <div className="md:col-span-8">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                            <span className="text-slate-500 group-focus-within:text-primary-400 transition-colors">
                                <SearchIcon />
                            </span>
                        </div>
                        <input
                            type="text"
                            placeholder="Discover a pose (e.g., Warrior, Tree, Lotus)..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="zen-input w-full pl-16 py-5 text-lg bg-white/5 border-white/10 focus:border-primary-500/50 shadow-2xl"
                        />
                    </div>
                </div>

                {/* Categories */}
                <div className="md:col-span-4 flex items-center space-x-2 overflow-x-auto pb-2 custom-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all
                                ${filter === cat
                                    ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/20 scale-105'
                                    : 'bg-white/5 text-slate-500 hover:bg-white/10 border border-white/5'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="zen-card h-64 animate-pulse bg-white/5 border-white/5"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredExercises.map((ex, idx) => (
                        <div key={ex.id}
                            className="zen-card flex flex-col items-center text-center group hover:border-primary-500/50 transition-all duration-500 animate-in fade-in zoom-in-95"
                            style={{ animationDelay: `${idx * 30}ms` }}
                        >
                            <div
                                onClick={() => setSelectedAsana(ex)}
                                className="w-40 h-40 bg-slate-900 rounded-3xl flex items-center justify-center mb-6 relative group-hover:scale-105 transition-transform duration-700 cursor-pointer overflow-hidden border border-white/5 shadow-inner"
                            >
                                {/* Photographic Visual */}
                                <img
                                    src={getPoseImg(ex.id)}
                                    alt={ex.description}
                                    className="w-full h-full object-cover"
                                />

                                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent">
                                    <div className="bg-primary-500/20 backdrop-blur-md border border-primary-500/20 px-2 py-1 rounded-lg text-[8px] font-black text-primary-400 uppercase tracking-tighter w-fit">
                                        {ex.category}
                                    </div>
                                </div>
                            </div>
                            <h3 className="text-sm font-bold text-white mb-1 tracking-tight group-hover:text-primary-400 transition-colors uppercase">{ex.name}</h3>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-3">Archival Wisdom • 00{idx + 1}</p>

                            {/* Subtle Inline Description for Card */}
                            <p className="text-[9px] text-slate-600 line-clamp-2 px-4 leading-tight mb-4">
                                {ex.description}
                            </p>

                            <div className="mt-auto pt-4 border-t border-white/5 w-full">
                                <button className="text-[9px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors flex items-center justify-center mx-auto group/btn">
                                    Study Alignment
                                    <span className="ml-2 group-hover/btn:translate-x-1 transition-transform">→</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Image Detail Modal */}
            {selectedAsana && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-500"
                    onClick={() => setSelectedAsana(null)}
                >
                    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"></div>

                    <div
                        className="relative zen-card max-w-4xl w-full p-0 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-700 shadow-[0_0_100px_rgba(139,92,246,0.3)] border-white/10"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedAsana(null)}
                            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all z-20 group"
                        >
                            <CloseIcon className="group-hover:rotate-90 transition-transform duration-500 scale-75" />
                        </button>

                        <div className="grid md:grid-cols-2">
                            <div className="relative aspect-square bg-slate-900 overflow-hidden border-r border-white/5">
                                <img
                                    src={getPoseImg(selectedAsana.id)}
                                    alt={selectedAsana.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="p-10 flex flex-col justify-center">
                                <div className="bg-primary-500/10 border border-primary-500/20 px-2 py-1 rounded-lg text-[9px] font-black text-primary-400 uppercase tracking-widest self-start mb-4">
                                    {selectedAsana.category}
                                </div>
                                <h2 className="text-2xl font-black text-white tracking-tighter mb-4 uppercase">{selectedAsana.name}</h2>
                                <p className="text-[10px] text-slate-400 leading-relaxed mb-10 tracking-wide max-w-xs">
                                    {selectedAsana.description}
                                </p>

                                <div className="space-y-6 pt-6 border-t border-white/5">
                                    <h4 className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Technical Focus</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                            <p className="text-[8px] text-slate-500 uppercase font-black mb-1">Complexity</p>
                                            <p className="text-[10px] text-white font-bold">Zen Level 0{Math.floor(Math.random() * 5) + 1}</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                            <p className="text-[8px] text-slate-500 uppercase font-black mb-1">Stability</p>
                                            <p className="text-[10px] text-white font-bold">Harmonious</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
