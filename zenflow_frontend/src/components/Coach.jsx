import React, { useState, useRef, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom'; 
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot } from 'lucide-react';

export function Coach({ user, backendUrl }) {
    const { username } = useParams();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

      useEffect(() => {
         if (!user) return;
        setMessages([
            { id: 0, role: 'assistant', content: `Namaste, ${user.username}. I am your ZenFlow AI Mentor. How can I guide your practice today?`, timestamp: new Date() }
        ]);
    }, [username,user]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    if (user && user.username !== username) {
        return <Navigate to={`/${user.username}/coach`} replace />;
    }

  

    const handleSend = async (message = input) => {
       if (isTyping || !message.trim()) return;

        const token = localStorage.getItem('zenflow_token');
        const userMsg = { id: Date.now(), role: 'user', content: message, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const response = await fetch(`${backendUrl}/${user.username}/ask-gemini/`, {
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
        <div className="relative w-full flex-1 min-h-0 flex flex-col pt-20 md:pt-24 font-sans bg-[#080313] overflow-hidden">
            
            {/* Header */}
            <div className="w-full max-w-4xl mx-auto px-4 md:px-8 shrink-0 mb-2 md:mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <Bot className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-lg md:text-xl font-medium text-gray-200 tracking-tight">
                    AI Mentor
                </h1>
            </div>

            {/* Messages Area */}
            <div className="flex-1 min-h-0 overflow-y-auto scroll-smooth px-4 md:px-8 pb-40 custom-scrollbar">
                <div
                    className="max-w-4xl mx-auto space-y-8 md:space-y-10"
                    role="log"
                    aria-live="polite"
                    aria-relevant="additions text"
                >
                    <AnimatePresence initial={false}>
                        {messages.map((m) => (
                            <motion.div
                                key={m.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {m.role === 'user' ? (
                                    <div className="bg-white/10 text-gray-100 px-6 py-3.5 rounded-3xl max-w-[85%] md:max-w-[75%] text-sm md:text-base leading-relaxed border border-white/5">
                                        {m.content}
                                    </div>
                                ) : (
                                    <div className="flex gap-4 md:gap-6 max-w-full md:max-w-[95%]">
                                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                                            <Bot className="w-4 h-4 md:w-5 md:h-5 text-white" />
                                        </div>
                                        <div className="flex-1 text-gray-200 leading-relaxed pt-1 md:pt-2 text-sm md:text-base whitespace-pre-line">
                                            {m.content}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    
                    {isTyping && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex gap-4 md:gap-6 max-w-4xl mx-auto"
                        >
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                                <Bot className="w-4 h-4 md:w-5 md:h-5 text-white" />
                            </div>
                            <div className="flex gap-2 items-center pt-3 md:pt-4">
                                <div className="w-2 h-2 bg-purple-400/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-purple-400/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-purple-400/60 rounded-full animate-bounce"></div>
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} className="h-4" />
                </div>
            </div>

            {/* Input Area */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#080313] via-[#080313] to-transparent pt-12 pb-6 px-4 md:px-8 pointer-events-none">
                <div className="max-w-4xl mx-auto relative flex flex-col items-center pointer-events-auto">
                    <div className="relative w-full flex items-center">
                        <input
                            id="coach-input"
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                             onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                  e.preventDefault();
                                    handleSend();
                                }   
                            }}
                            disabled={isTyping}
                            placeholder="Ask AI Mentor..."
                            className="w-full bg-[#1a1325]/80 backdrop-blur-xl border border-white/10 rounded-full pl-6 pr-14 py-4 md:py-5 text-gray-200 placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:bg-[#1a1325] transition-all shadow-2xl"
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={!input.trim() || isTyping}
                            className="absolute right-2 p-3 bg-white text-black rounded-full disabled:opacity-50 transition-all hover:bg-gray-200 flex items-center justify-center"
                        >
                            <Send className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                    </div>
                    <p className="text-center text-[10px] text-gray-500 mt-3 uppercase tracking-widest font-bold">
                        AI Guidance Mode • ZenFlow Lab
                    </p>
                </div>
            </div>
        </div>
    );
}