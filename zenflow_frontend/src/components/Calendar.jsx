import React, { useState, useEffect } from 'react';

export default function Calendar({ user, backendUrl }) {
    const [calendarData, setCalendarData] = useState({ sessions: [], plans: [] });
    const [streak, setStreak] = useState(0);
    const [currentDate, setCurrentDate] = useState(new Date());

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('zenflow_token');
            if (!token) return;
            const [calendarRes, streakRes] = await Promise.all([
                fetch(`${backendUrl}/get-calendar/`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${backendUrl}/get-streak/`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (calendarRes.ok) {
                const data = await calendarRes.json();
                setCalendarData(data);
            }
            if (streakRes.ok) {
                const data = await streakRes.json();
                setStreak(data.streak);
            }
        } catch (error) {
            console.error("Failed to fetch calendar data:", error);
        }
    };

    useEffect(() => {
        fetchData();
        window.addEventListener('refreshCalendar', fetchData);
        return () => window.removeEventListener('refreshCalendar', fetchData);
    }, [user, backendUrl]);

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const renderDays = () => {
        const days = [];
        const totalDays = daysInMonth(currentDate.getFullYear(), currentDate.getMonth());
        const today = new Date();
        const isCurrentMonth = today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();

        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="h-20 border border-white/5 opacity-10"></div>);
        }

        for (let day = 1; day <= totalDays; day++) {
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = isCurrentMonth && today.getDate() === day;

            const daySessions = calendarData.sessions.filter(s => s.date.startsWith(dateStr));
            const dayPlans = calendarData.plans.filter(p => p.planned_date.startsWith(dateStr));

            days.push(
                <div key={day} className={`h-20 border border-white/5 p-2 relative group transition-all duration-300
                    ${isToday ? 'bg-primary-500/10' : 'hover:bg-white/5'}`}>
                    <span className={`text-[10px] font-bold ${isToday ? 'text-primary-400' : 'text-slate-500'} group-hover:text-white transition-colors`}>
                        {day}
                    </span>

                    {isToday && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-primary-500 rounded-full animate-ping opacity-75"></div>}

                    <div className="mt-1 flex flex-wrap gap-0.5 overflow-hidden">
                        {daySessions.map((s, idx) => (
                            <div key={`s-${idx}`} className="w-2 h-2 bg-primary-500 rounded-full shadow-[0_0_8px_rgba(139,92,246,0.6)]" title={s.pose_name}></div>
                        ))}
                        {dayPlans.map((p, idx) => (
                            <div key={`p-${idx}`} className="w-full text-[7px] leading-none bg-slate-800/80 text-primary-200 p-1 rounded border border-white/10 truncate backdrop-blur-sm" title={p.description}>
                                {p.title}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return days;
    };

    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

    return (
        <div className="zen-card overflow-hidden">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Practice Flow</h2>
                    <p className="text-[10px] text-primary-400 font-bold uppercase tracking-[0.2em] mt-1">Digital Sanctuary</p>
                </div>
                <div className="text-right group">
                    <span className="text-5xl font-black bg-gradient-to-br from-primary-400 to-accent-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all group-hover:scale-110 inline-block">
                        {streak}
                    </span>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter mt-1">Day Streak</p>
                </div>
            </div>

            <div className="flex items-center justify-between mb-4 bg-white/5 p-2 rounded-2xl">
                <h3 className="text-xs font-bold text-slate-300 ml-2">
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
                <div className="flex space-x-1">
                    <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 mb-1 text-center">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                    <div key={d} className="text-[10px] font-black text-slate-600 py-2">{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 border border-white/5 rounded-3xl overflow-hidden glass-dark">
                {renderDays()}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                    <div className="w-2.5 h-2.5 bg-primary-500 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.8)]"></div>
                    <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase">Complete</p>
                        <p className="text-[11px] text-white/80 font-bold">Sessions</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                    <div className="w-2.5 h-2.5 bg-slate-700 rounded-sm border border-white/10"></div>
                    <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase">Awaiting</p>
                        <p className="text-[11px] text-white/80 font-bold">Plans</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
