import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Sparkles, User, Bot, TrendingUp, Calendar as CalendarIcon } from 'lucide-react';

export function Coach({ user, backendUrl }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const fetchHistory = async () => {
            const token = localStorage.getItem('zenflow_token');
            if (!token) return;
            try {
                const response = await fetch(`${backendUrl}/get-coach-history/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.ok) {
                    const history = await response.json();
                    const formattedHistory = history.flatMap(chat => [
                        { id: `u-${chat.id}`, role: 'user', content: chat.user_query, timestamp: new Date(chat.created_date) },
                        { id: `a-${chat.id}`, role: 'assistant', content: chat.bot_response, timestamp: new Date(chat.created_date) }
                    ]);

                    if (formattedHistory.length > 0) {
                        setMessages(formattedHistory);
                    } else {
                        setMessages([
                            { id: 0, role: 'assistant', content: "Namaste. I am your ZenFlow AI Mentor. How can I guide your practice today?", timestamp: new Date() }
                        ]);
                    }
                }
            } catch (error) {
                console.error("Error fetching chat history:", error);
            }
        };
        fetchHistory();
    }, [backendUrl]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (message = input) => {
        if (!message.trim()) return;

        const token = localStorage.getItem('zenflow_token');
        const userMsg = { id: Date.now(), role: 'user', content: message, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const response = await fetch(`${backendUrl}/ask-gemini/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ query: message }),
            });

            if (response.ok) {
                const data = await response.json();
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    role: 'assistant',
                    content: data.response,
                    timestamp: new Date()
                }]);
            }
        } catch (error) {
            console.error("Coach error:", error);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pt-32 pb-20 px-6 min-h-screen font-sans"
        >
            <div className="max-w-5xl mx-auto h-[calc(100vh-16rem)] flex flex-col">
                {/* Header */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-center mb-8"
                >
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <Bot className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                        AI Mentor
                    </h1>
                    <p className="text-white/60">Guidance tailored to your path</p>
                </motion.div>

                {/* Chat Container */}
                <div className="flex-1 relative flex flex-col min-h-0 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        <AnimatePresence>
                            {messages.map((m) => (
                                <motion.div
                                    key={m.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === 'user' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                                        }`}>
                                        {m.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                                    </div>
                                    <div className={`max-w-[80%] rounded-2xl p-4 ${m.role === 'user' ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-white/5 border border-white/10'
                                        }`}>
                                        <p className="text-white/90 whitespace-pre-line leading-relaxed">{m.content}</p>
                                        <p className="text-[10px] text-white/30 mt-2 uppercase tracking-widest">
                                            {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {isTyping && (
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                                    <Bot className="w-5 h-5" />
                                </div>
                                <div className="bg-white/5 rounded-2xl p-4 flex gap-1 items-center">
                                    <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-6 bg-black/20 border-t border-white/10">
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Seek guidance..."
                                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-purple-500/50 transition-all font-medium"
                            />
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleSend()}
                                disabled={!input.trim()}
                                className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20"
                            >
                                <Send className="w-5 h-5 text-white" />
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
