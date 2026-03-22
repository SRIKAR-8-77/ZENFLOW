import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Shield, Zap, Brain } from 'lucide-react';

const words = [
    { text: "Mindfulness", color: "text-purple-400", glow: "rgba(168,85,247,0.8)" },
    { text: "Balance", color: "text-pink-400", glow: "rgba(236,72,153,0.8)" },
    { text: "Strength", color: "text-orange-400", glow: "rgba(249,115,22,0.8)" },
    { text: "Serenity", color: "text-blue-400", glow: "rgba(96,165,250,0.8)" },
    { text: "Focus", color: "text-emerald-400", glow: "rgba(52,211,153,0.8)" }
];

const features = [
    {
        icon: <Brain className="w-6 h-6 text-purple-400" />,
        title: "AI-Powered Mentorship",
        description: "Personalized guidance that adapts to your mental and physical state."
    },
    {
        icon: <Zap className="w-6 h-6 text-orange-400" />,
        title: "Real-time Feedback",
        description: "Instant pose correction and breathing cues to keep you in the zone."
    },
    {
        icon: <Shield className="w-6 h-6 text-emerald-400" />,
        title: "Safe & Private",
        description: "Your sessions are processed securely, ensuring a private sanctuary."
    }
];

export function WhyZenflow() {
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % words.length);
        }, 2000); // Change word every 2 seconds
        return () => clearInterval(interval);
    }, []);

    const getSlotStyles = (slotIndex, word) => {
        switch (slotIndex) {
            case 0: return { rotate: 50, opacity: 0, scale: 0.5, filter: "blur(4px)" };
            case 1: return { rotate: 25, opacity: 0.4, scale: 0.9, filter: "blur(2px)" };
            case 2: return { rotate: 0, opacity: 1, scale: 1.1, filter: `drop-shadow(0px 0px 20px ${word.glow}) blur(0px)` };
            case 3: return { rotate: -25, opacity: 0.4, scale: 0.9, filter: "blur(2px)" };
            case 4: return { rotate: -50, opacity: 0, scale: 0.5, filter: "blur(4px)" };
            default: return { rotate: 0, opacity: 0, scale: 0, filter: "blur(0px)" };
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-24 relative rounded-3xl bg-white/[0.02] border border-white/5 p-8 md:p-12 overflow-hidden"
        >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-16 relative z-10">
                
                {/* LEFT SIDE: Info */}
                <div className="w-full md:w-1/2 flex flex-col items-start">
                    {/* <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-orange-300 mb-6">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Why Choose ZenFlow?</span>
                    </div> */}
                    
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                        Elevate your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-orange-400">
                            daily practice.
                        </span>
                    </h2>
                    
                    <p className="text-gray-400 text-lg mb-10 leading-relaxed">
                        ZenFlow merges ancient wisdom with cutting-edge AI to create a sanctuary tailored entirely to you. Experience growth like never before.
                    </p>

                    <div className="flex flex-col gap-6">
                        {features.map((feature, idx) => (
                            <motion.div 
                                key={idx}
                                whileHover={{ x: 10 }}
                                className="flex items-start gap-4"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                    {feature.icon}
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold text-lg mb-1">{feature.title}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* RIGHT SIDE: Semi-circle Wheel Animation */}
                <div className="w-full md:w-1/2 h-[450px] flex items-center justify-center relative">
                    
                    {/* The Rotating Words */}
                    <div className="absolute -right-[100px] md:-right-[150px] top-1/2 w-0 h-0">
                        {words.map((word, index) => {
                            const slotIndex = (index + activeIndex) % 5;
                            const { rotate, opacity, scale, filter } = getSlotStyles(slotIndex, word);

                            return (
                                <motion.div
                                    key={word.text}
                                    initial={false}
                                    animate={{ rotate }}
                                    transition={{ type: "spring", stiffness: 50, damping: 15, mass: 1 }}
                                    className="absolute top-0 right-0 w-0 h-0 flex items-center justify-end"
                                >
                                    <motion.div
                                        initial={false}
                                        animate={{ opacity, scale, filter }}
                                        transition={{ type: "spring", stiffness: 50, damping: 15 }}
                                        className={`absolute right-[150px] md:right-[200px] whitespace-nowrap text-3xl md:text-4xl font-bold tracking-wider ${word.color}`}
                                        style={{ y: "-50%" }}
                                    >
                                        {word.text}
                                    </motion.div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </motion.div>
    );
}