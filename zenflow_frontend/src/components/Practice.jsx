import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Play, Upload, RotateCcw, Sparkles, Target, Zap, AlertCircle } from 'lucide-react';

export function Practice({ user, backendUrl, onAnalysisComplete }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [analysisResult, setAnalysisResult] = useState(null);
    const [currentResultIndex, setCurrentResultIndex] = useState(0);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setError('');
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        setIsLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('file', selectedFile);

        const token = localStorage.getItem('zenflow_token');

        try {
            const response = await fetch(`${backendUrl}/analyze-session/`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                setAnalysisResult(data);
                if (onAnalysisComplete) onAnalysisComplete();
            } else {
                const data = await response.json();
                setError(data.detail || 'The digital temple is busy. Try again later.');
            }
        } catch (err) {
            setError('Connection with the cloud was interrupted.');
        } finally {
            setIsLoading(false);
        }
    };

    const reset = () => {
        setSelectedFile(null);
        setAnalysisResult(null);
        setError('');
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="pt-32 pb-20 px-6 min-h-screen font-sans"
        >
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-12">
                    <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
                        Vision Lab
                    </h1>
                    <p className="text-xl text-white/60">Analyze your presence with AI</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Interaction Area */}
                    <div className="lg:col-span-2 relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-3xl blur-2xl group-hover:blur-3xl transition-all" />
                        <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden min-h-[400px] flex flex-col">
                            <div className="flex-1 flex items-center justify-center p-8">
                                <AnimatePresence mode="wait">
                                    {!selectedFile && !analysisResult ? (
                                        <motion.div
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                            className="text-center"
                                        >
                                            <div
                                                onClick={() => fileInputRef.current.click()}
                                                className="w-32 h-32 rounded-3xl bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center cursor-pointer hover:border-cyan-500/50 hover:bg-white/10 transition-all mb-6 mx-auto"
                                            >
                                                <Camera className="w-12 h-12 text-white/40" />
                                            </div>
                                            <p className="text-white/60 text-lg">Upload your practice clip (MP4/MOV)</p>
                                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="video/*" />
                                        </motion.div>
                                    ) : selectedFile && !analysisResult ? (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                                            <Upload className="w-16 h-16 text-cyan-400 mx-auto mb-4 animate-bounce" />
                                            <h3 className="text-2xl font-bold text-white mb-2">{selectedFile.name}</h3>
                                            <p className="text-white/40 mb-8 uppercase tracking-widest text-xs">Ready for analysis</p>
                                            <button
                                                disabled={isLoading}
                                                onClick={handleUpload}
                                                className="zen-button-primary px-12"
                                            >
                                                {isLoading ? 'Decrypting Form...' : 'Start Vision Analysis'}
                                            </button>
                                        </motion.div>
                                    ) : (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full p-8 flex flex-col items-center justify-center text-center">
                                            {analysisResult.results && analysisResult.results.length > 1 && (
                                                <div className="flex gap-2 mb-8 bg-white/5 p-1.5 rounded-2xl border border-white/10 overflow-x-auto max-w-full">
                                                    {analysisResult.results.map((res, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={() => setCurrentResultIndex(idx)}
                                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${currentResultIndex === idx
                                                                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                                                                : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                                                                }`}
                                                        >
                                                            {res.pose}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="w-40 h-40 rounded-full border-4 border-cyan-500/30 flex items-center justify-center mb-8 relative">
                                                <div className="absolute inset-0 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin"></div>
                                                <span className="text-5xl font-bold text-cyan-400">
                                                    {analysisResult.results ? analysisResult.results[currentResultIndex].accuracy : analysisResult.accuracy}%
                                                </span>
                                            </div>
                                            <h2 className="text-3xl font-bold text-white mb-2">
                                                {analysisResult.results ? analysisResult.results[currentResultIndex].pose : analysisResult.pose}
                                            </h2>
                                            <p className="text-white/60 max-w-md mx-auto italic">
                                                "{analysisResult.results ? analysisResult.results[currentResultIndex].feedback : analysisResult.feedback}"
                                            </p>
                                            <button onClick={reset} className="mt-12 flex items-center gap-2 text-white/40 hover:text-white transition-colors">
                                                <RotateCcw className="w-5 h-5" /> Start New Session
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-500/10 border-t border-red-500/20 flex items-center gap-3 text-red-400">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <span className="text-sm font-medium">{error}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <SidebarCard icon={<Sparkles className="w-6 h-6 text-yellow-400" />} title="Coach Insight">
                            <p className="text-white/70 text-sm leading-relaxed">
                                {analysisResult?.results
                                    ? analysisResult.results[currentResultIndex].details
                                    : analysisResult?.details
                                        ? analysisResult.details
                                        : "Upload your session to receive deep biomechanical feedback and alignment suggestions."}
                            </p>
                        </SidebarCard>

                        <SidebarCard icon={<Target className="w-6 h-6 text-purple-400" />} title="Peak Performance">
                            <div className="space-y-4">
                                <StatRow
                                    label="Accuracy"
                                    value={analysisResult?.results ? `${analysisResult.results[currentResultIndex].accuracy}%` : analysisResult?.accuracy ? `${analysisResult.accuracy}%` : '--'}
                                />
                                <StatRow
                                    label="Duration"
                                    value={analysisResult?.results ? `${analysisResult.results[currentResultIndex].duration}s` : analysisResult?.duration ? `${analysisResult.duration}s` : '--'}
                                />
                                <StatRow
                                    label="Confidence"
                                    value={analysisResult?.results ? '--' : analysisResult?.confidence_score ? `${Math.round(analysisResult.confidence_score * 100)}%` : '--'}
                                />
                            </div>
                        </SidebarCard>

                        <SidebarCard icon={<Zap className="w-6 h-6 text-green-400" />} title="Energy Flow">
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{
                                        width: analysisResult?.results
                                            ? `${analysisResult.results[currentResultIndex].accuracy}%`
                                            : analysisResult?.accuracy
                                                ? `${analysisResult.accuracy}%`
                                                : '5%'
                                    }}
                                    className="h-full bg-gradient-to-r from-green-400 to-emerald-400"
                                />
                            </div>
                            <p className="text-xs text-white/40 mt-3 uppercase tracking-tighter">
                                {analysisResult ? 'Presence detected. Flow state active.' : 'Awakening energy channels...'}
                            </p>
                        </SidebarCard>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function SidebarCard({ icon, title, children }) {
    return (
        <div className="relative group">
            <div className="absolute inset-0 bg-white/5 rounded-3xl blur-xl group-hover:bg-purple-500/5 transition-all" />
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    {icon}
                    <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
                </div>
                {children}
            </div>
        </div>
    );
}

function StatRow({ label, value }) {
    return (
        <div className="flex justify-between items-center text-sm">
            <span className="text-white/40 uppercase tracking-widest text-[10px] font-bold">{label}</span>
            <span className="text-white font-bold text-lg">{value}</span>
        </div>
    );
}
