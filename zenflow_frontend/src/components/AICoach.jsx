import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { CoachIcon } from './Icons';

export function AICoach({ user, backendUrl, refreshChats }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [chatId, setChatId] = useState(() => crypto.randomUUID());
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages, isLoading]);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;
        const userMsg = input.trim();
        const newMessages = [...messages, { role: 'user', content: userMsg }];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const token = localStorage.getItem('zenflow_token');
            if (!token) return;
            const res = await fetch(`${backendUrl}/chat-gemini/`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId, messages: newMessages }),
            });
            const data = await res.json();
            setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
        } catch (error) {
            console.error("Coach disconnect:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const endChat = async () => {
        try {
            const token = localStorage.getItem('zenflow_token');
            if (!token) return;
            await fetch(`${backendUrl}/end-chat/`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId }),
            });
            setMessages([]);
            setChatId(crypto.randomUUID());
            refreshChats();
        } catch (error) {
            console.error("Failed to end journey:", error);
        }
    };

    const approvePlan = async (planData) => {
        try {
            const token = localStorage.getItem('zenflow_token');
            if (!token) return;
            const res = await fetch(`${backendUrl}/approve-plan/`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ plans: planData }),
            });
            if (res.ok) {
                window.dispatchEvent(new CustomEvent('refreshCalendar'));
                alert("The flow has been synchronized with your path.");
            }
        } catch (error) {
            console.error("Approval error:", error);
        }
    };

    const renderMessage = (m, idx) => {
        const planMatch = m.content.match(/```plan-json\n([\s\S]*?)```/);
        let cleanContent = m.content;
        let planData = null;

        if (planMatch) {
            try {
                planData = JSON.parse(planMatch[1]);
                cleanContent = m.content.replace(planMatch[0], "");
            } catch (e) {
                console.error("JSON parse error:", e);
            }
        }

        return (
            <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className={`max-w-[90%] p-5 rounded-[2rem] text-sm leading-relaxed shadow-lg backdrop-blur-md
                    ${m.role === 'user'
                        ? 'bg-primary-600 text-white rounded-tr-none'
                        : 'bg-white/5 text-slate-200 border border-white/10 rounded-tl-none'}`}>
                    <ReactMarkdown className="prose prose-sm prose-invert max-w-none prose-p:leading-relaxed">
                        {cleanContent}
                    </ReactMarkdown>

                    {planData && (
                        <div className="mt-6 bg-slate-900/50 rounded-2xl p-4 border border-white/10 shadow-2xl overflow-hidden relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent"></div>
                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <span className="text-[10px] font-black text-primary-400 uppercase tracking-widest">Digital Flow Plan</span>
                                <button
                                    onClick={() => approvePlan(planData)}
                                    className="bg-primary-600 text-white text-[10px] font-bold py-2 px-4 rounded-xl hover:bg-primary-500 transition-all shadow-lg shadow-primary-500/20 active:scale-95"
                                >
                                    Approve & Sync
                                </button>
                            </div>
                            <div className="space-y-3 relative z-10">
                                {planData.map((item, i) => (
                                    <div key={i} className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 text-lg">🧘</div>
                                        <div>
                                            <p className="font-bold text-white text-xs">{item.title}</p>
                                            <p className="text-[10px] text-slate-500 font-medium">{new Date(item.planned_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="zen-card flex flex-col h-[700px] relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 blur-[60px] rounded-full pointer-events-none"></div>

            <div className="flex justify-between items-center mb-8 relative z-10">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center tracking-tight">
                        <span className="w-8 h-8 rounded-xl bg-primary-500/20 flex items-center justify-center mr-3 text-primary-400">
                            <CoachIcon />
                        </span>
                        Flow AI Coach
                    </h2>
                </div>
                {messages.length > 0 && (
                    <button onClick={endChat} className="text-[10px] font-black text-slate-500 hover:text-rose-400 uppercase tracking-widest transition-colors">
                        End Session
                    </button>
                )}
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto mb-6 space-y-6 pr-2 custom-scrollbar relative z-10">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                        <div className="w-56 h-56 bg-white/5 rounded-full flex items-center justify-center mb-8 overflow-hidden relative group p-2">
                            <div className="absolute inset-0 bg-primary-500/5 animate-pulse-glow"></div>
                            <img src="/assets/coach.png" alt="ZenFlow Spirit" className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-1000 mix-blend-lighten" />
                        </div>
                        <p className="text-slate-400 font-medium italic mb-2">"The silent mind is the first step to wisdom."</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.25em]">Initiate your digital guide</p>
                    </div>
                ) : (
                    messages.map((m, idx) => renderMessage(m, idx))
                )}
                {isLoading && (
                    <div className="flex justify-start animate-pulse">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                            <div className="flex space-x-2">
                                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="relative z-10">
                <div className="flex space-x-3 p-1.5 bg-white/5 rounded-[1.5rem] border border-white/10 backdrop-blur-xl ring-1 ring-white/5">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Seek wisdom or plan your path..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-white px-4 py-3 placeholder:text-slate-600"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!input.trim() || isLoading}
                        className="w-12 h-12 flex items-center justify-center bg-primary-600 text-white rounded-[1.25rem] hover:bg-primary-500 transition-all shadow-lg shadow-primary-500/20 disabled:grayscale disabled:opacity-30 disabled:shadow-none"
                    >
                        <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

export function CoachHistory({ plans }) {
    if (!plans || plans.length === 0) return null;
    return (
        <div className="zen-card glass-dark">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 px-1">Past Consultations</h3>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {plans.map((chat, idx) => (
                    <div key={idx} className="group p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-primary-500/30 transition-all cursor-pointer">
                        <p className="text-xs font-bold text-white mb-2 line-clamp-1 group-hover:text-primary-400 transition-colors">"{chat.user_query}"</p>
                        <div className="flex justify-between items-center text-[10px] text-slate-500">
                            <span className="font-medium">{new Date(chat.date).toLocaleDateString()}</span>
                            <span className="bg-primary-500/10 text-primary-400 px-2 py-0.5 rounded-full font-black text-[8px] uppercase tracking-tighter">Insights Gained</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
