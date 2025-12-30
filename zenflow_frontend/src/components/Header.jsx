import React from 'react';

export default function Header({ user, onLogout }) {
    return (
        <nav className="sticky top-0 z-[100] px-4 py-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="glass-dark rounded-[2.5rem] px-8 py-5 flex justify-between items-center border border-white/10 shadow-2xl backdrop-blur-3xl">
                    <div className="flex items-center space-x-4 group cursor-pointer">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-primary-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                            <span className="text-white font-black text-2xl drop-shadow-md">Z</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-tighter leading-none group-hover:text-primary-400 transition-colors">
                                ZenFlow
                            </h1>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">Digital Sanctuary</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-12">
                        <div className="hidden lg:flex items-center space-x-8">
                            <button
                                onClick={() => window.dispatchEvent(new CustomEvent('switchView', { detail: 'dashboard' }))}
                                className="text-[10px] font-black text-white hover:text-primary-400 uppercase tracking-widest transition-colors"
                            >
                                Dashboard
                            </button>
                            <button
                                onClick={() => window.dispatchEvent(new CustomEvent('switchView', { detail: 'library' }))}
                                className="text-[10px] font-black text-white hover:text-primary-400 uppercase tracking-widest transition-colors"
                            >
                                Sanctuary Library
                            </button>
                        </div>

                        <div className="hidden sm:flex flex-col items-end border-r border-white/10 pr-8">
                            <span className="text-xs font-black text-white uppercase tracking-widest">{user.username}</span>
                            <span className="text-[10px] text-primary-400 font-bold uppercase tracking-tighter mt-1">{user.role || 'Enlightened Yogi'}</span>
                        </div>

                        <button
                            onClick={onLogout}
                            className="text-[10px] font-black text-slate-500 hover:text-rose-400 uppercase tracking-widest transition-all hover:scale-110 active:scale-95"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
