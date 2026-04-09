// import React from 'react';
// import { motion } from 'framer-motion';
// import { Sparkles, Camera, BookOpen, MessageCircle, Library, TrendingUp, LogOut } from 'lucide-react';

// const navItems = [
//     { id: 'dashboard', label: 'Flow', icon: Sparkles },
//     { id: 'practice', label: 'Vision', icon: Camera },
//     { id: 'journal', label: 'Reflect', icon: BookOpen },
//     { id: 'coach', label: 'Mentor', icon: MessageCircle },
//     { id: 'library', label: 'Vault', icon: Library },
//     { id: 'progress', label: 'Journey', icon: TrendingUp },
// ];

// export function Navigation({ currentView, onViewChange, user, onLogout }) {
//     return (
//         <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-3 md:px-8 md:py-4 font-sans bg-[#080313]/80 backdrop-blur-md border-b border-white/5">
//             <div className="max-w-7xl mx-auto flex items-center justify-between">
                
//                 {/* Logo Section */}
//                 <motion.div
//                     className="flex items-center gap-3"
//                     whileHover={{ scale: 1.02 }}
//                 >
//                     <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20 overflow-hidden relative">
//                         {/* Keeps your original logo, but adds the Finotive gradient as a fallback/background */}
//                         <div className="w-3 h-3 bg-white rounded-sm absolute -z-10"></div>
//                         <img 
//                             src="/logo.png" 
//                             alt="ZenFlow Logo" 
//                             className="w-full h-full object-cover z-10" 
//                             onError={(e) => e.currentTarget.style.opacity = '0'} 
//                         />
//                     </div>
//                     <span className="text-xl font-semibold tracking-tight text-white">ZenFlow</span>
//                 </motion.div>

//                 {/* Navigation Links - Premium Glass Track */}
//                 <div className="hidden lg:flex items-center gap-1 bg-white/[0.02] border border-white/5 rounded-full p-1.5">
//                     {navItems.map((item) => {
//                         const Icon = item.icon;
//                         const isActive = currentView === item.id;

//                         return (
//                             <button
//                                 key={item.id}
//                                 onClick={() => onViewChange(item.id)}
//                                 className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
//                                     isActive 
//                                         ? 'text-white bg-white/10 shadow-sm' 
//                                         : 'text-gray-400 hover:text-white hover:bg-white/5'
//                                 }`}
//                             >
//                                 <Icon className="w-4 h-4" />
//                                 <span>{item.label}</span>
//                             </button>
//                         );
//                     })}
//                 </div>

//                 {/* User & Actions */}
//                 <div className="flex items-center gap-4">
//                     {user && (
//                         <div className="flex items-center gap-3">
//                             {/* Finotive-style User Pill */}
//                             <div className="hidden sm:flex items-center gap-2 bg-white/5 rounded-full py-1 px-1 pr-4 border border-white/5">
//                                 <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-orange-400 flex items-center justify-center text-xs font-bold text-white shadow-inner">
//                                     {user.username?.charAt(0).toUpperCase() || 'U'}
//                                 </div>
//                                 <div className="flex flex-col items-start">
//                                     <span className="text-xs text-gray-200 font-medium leading-none">{user.username}</span>
//                                     <span className="text-[9px] text-gray-500 uppercase tracking-wider mt-1">Practitioner</span>
//                                 </div>
//                             </div>
                            
//                             {/* Logout Button */}
//                             <button
//                                 onClick={onLogout}
//                                 aria-label="Log out"
//                                 className="p-2 rounded-full border border-white/5 bg-white/[0.02] text-gray-400 hover:text-red-400 hover:bg-red-400/10 hover:border-red-400/20 transition-all"
//                                 title="Leave Sanctuary"
//                             >
//                                 <LogOut className="w-4 h-4" />
//                             </button>
//                         </div>
//                     )}
//                 </div>
                
//             </div>
//         </nav>
//     );
// }

import React from 'react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { Sparkles, Camera, BookOpen, MessageCircle, Library, TrendingUp, LogOut } from 'lucide-react';

const navItems = [
    // Updated paths to work as suffixes to the username
    { id: 'dashboard', label: 'Flow', icon: Sparkles, path: '' }, 
    { id: 'practice', label: 'Vision', icon: Camera, path: '/practice' },
    { id: 'journal', label: 'Reflect', icon: BookOpen, path: '/journal' },
    { id: 'coach', label: 'Mentor', icon: MessageCircle, path: '/coach' },
    { id: 'library', label: 'Vault', icon: Library, path: '/library' },
    { id: 'progress', label: 'Journey', icon: TrendingUp, path: '/progress' },
];

export function Navigation({ user, onLogout }) {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-3 md:px-8 md:py-4 font-sans bg-[#080313]/80 backdrop-blur-md border-b border-white/5">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                
                {/* Logo Section */}
                <motion.div
                    className="flex items-center gap-3 cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                >
                    {/* Updated to point to /username */}
                    <NavLink to={user ? `/${user.username}` : "/"} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20 overflow-hidden relative">
                            <div className="w-3 h-3 bg-white rounded-sm absolute -z-10"></div>
                            <img 
                                src="/logo.png" 
                                alt="ZenFlow Logo" 
                                className="w-full h-full object-cover z-10" 
                                onError={(e) => e.currentTarget.style.opacity = '0'} 
                            />
                        </div>
                        <span className="text-xl font-semibold tracking-tight text-white">ZenFlow</span>
                    </NavLink>
                </motion.div>

                {/* Navigation Links - Premium Glass Track */}
                <div className="hidden lg:flex items-center gap-1 bg-white/[0.02] border border-white/5 rounded-full p-1.5">
                    {navItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.id}
                                // Prefixing the username to create paths like /nallanikhil21/practice
                                to={user ? `/${user.username}${item.path}` : "/"}
                                className={({ isActive }) => `
                                    relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 
                                    ${isActive 
                                        ? 'text-white bg-white/10 shadow-sm' 
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }
                                `}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{item.label}</span>
                            </NavLink>
                        );
                    })}
                </div>

                {/* User & Actions */}
                <div className="flex items-center gap-4">
                    {user && (
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center gap-2 bg-white/5 rounded-full py-1 px-1 pr-4 border border-white/5">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-orange-400 flex items-center justify-center text-xs font-bold text-white shadow-inner">
                                    {user.username?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-xs text-gray-200 font-medium leading-none">{user.username}</span>
                                    <span className="text-[9px] text-gray-500 uppercase tracking-wider mt-1">Practitioner</span>
                                </div>
                            </div>
                            
                            <button
                                onClick={onLogout}
                                aria-label="Log out"
                                className="p-2 rounded-full border border-white/5 bg-white/[0.02] text-gray-400 hover:text-red-400 hover:bg-red-400/10 hover:border-red-400/20 transition-all"
                                title="Leave Sanctuary"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
                
            </div>
        </nav>
    );
}