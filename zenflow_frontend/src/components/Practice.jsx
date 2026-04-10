import React, { useState, useRef } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom'; // Added useParams and Navigate
import { motion, AnimatePresence } from 'framer-motion'; 
import { Camera, Play, Upload, RotateCcw, Sparkles, Target, Zap, AlertCircle } from 'lucide-react';

export function Practice({ user, backendUrl }) {
    const navigate = useNavigate();
    const { username } = useParams(); // Get username from URL
    
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [analysisResult, setAnalysisResult] = useState(null);
    const [currentResultIndex, setCurrentResultIndex] = useState(0);
    const [isHovering, setIsHovering] = useState(false);
    const fileInputRef = useRef(null);

    // FRONTEND BOLA PROTECTION
    // If the URL username doesn't match the logged-in user, redirect them to their own lab
    if (user && user.username !== username) {
        return <Navigate to={`/${user.username}/practice`} replace />;
    }

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
            const response = await fetch(`${backendUrl}/${user.username}/analyze-session/`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                setAnalysisResult(data);
                
                // Example of personalized navigation if needed later:
                // setTimeout(() => navigate(`/${user.username}/journal`), 5000); 
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
        // Ensure we stay on the personalized URL after reset
        navigate(`/${username}/practice`);
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-12 lg:py-20 font-sans">
            {/* Header */}
            <div className="text-center mb-8 mt-4">
                <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl md:text-6xl font-bold mb-4 tracking-tight"
                >
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                        Vision Lab
                    </span>
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-400 text-lg"
                >
                    Analyze your presence with AI
                </motion.p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Interaction Area */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-2 relative group"
                >
                    <div 
                        className={`relative h-[400px] md:h-[500px] rounded-3xl border-2 transition-all duration-300 flex flex-col items-center justify-center overflow-hidden group
                            ${!selectedFile && !analysisResult ? 'border-dashed cursor-pointer' : 'border-solid'}
                            ${isHovering && !selectedFile && !analysisResult
                                ? 'border-purple-500/50 bg-purple-500/5' 
                                : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                            }`}
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => setIsHovering(false)}
                        onClick={() => {
                            if (!selectedFile && !analysisResult) {
                                fileInputRef.current?.click();
                            }
                        }}
                    >
                        <div className="relative z-10 flex flex-col items-center w-full h-full p-8">
                            <AnimatePresence mode="wait">
                                {!selectedFile && !analysisResult ? (
                                    <motion.div
                                        key="upload"
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        className="text-center flex flex-col items-center justify-center h-full"
                                    >
                                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300 shadow-xl">
                                            <Camera className="w-8 h-8 md:w-10 md:h-10 text-gray-400 group-hover:text-purple-400 transition-colors" />
                                        </div>
                                        <p className="text-gray-300 text-sm md:text-base font-medium">
                                            Upload your practice clip (MP4/MOV)
                                        </p>
                                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="video/*" />
                                    </motion.div>
                                ) : selectedFile && !analysisResult ? (
                                    <motion.div key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center flex flex-col items-center justify-center h-full">
                                        <Upload className="w-16 h-16 text-purple-400 mx-auto mb-4 animate-bounce" />
                                        <h3 className="text-2xl font-bold text-white mb-2">{selectedFile.name}</h3>
                                        <p className="text-gray-400 mb-8 uppercase tracking-widest text-xs">Ready for analysis</p>
                                        <button
                                            disabled={isLoading}
                                            onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                                            className="bg-white text-black px-8 py-3.5 rounded-full font-semibold text-sm hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isLoading ? 'Decrypting Form...' : 'Start Vision Analysis'}
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full flex flex-col items-center justify-center text-center">
                                        {analysisResult.results && analysisResult.results.length > 1 && (
                                            <div className="flex gap-2 mb-8 bg-white/5 p-1.5 rounded-2xl border border-white/10 overflow-x-auto max-w-full">
                                                {analysisResult.results.map((res, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={(e) => { e.stopPropagation(); setCurrentResultIndex(idx); }}
                                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${currentResultIndex === idx
                                                            ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                                            }`}
                                                    >
                                                        {res.pose}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        <div className="w-40 h-40 rounded-full border-4 border-purple-500/30 flex items-center justify-center mb-8 relative">
                                            <div className="absolute inset-0 rounded-full border-4 border-purple-400 border-t-transparent animate-spin"></div>
                                            <span className="text-5xl font-bold text-purple-400">
                                                {analysisResult.results ? analysisResult.results[currentResultIndex].accuracy : analysisResult.accuracy}%
                                            </span>
                                        </div>
                                        <h2 className="text-3xl font-bold text-white mb-2">
                                            {analysisResult.results ? analysisResult.results[currentResultIndex].pose : analysisResult.pose}
                                        </h2>
                                        <p className="text-gray-400 max-w-md mx-auto italic">
                                            "{analysisResult.results ? analysisResult.results[currentResultIndex].feedback : analysisResult.feedback}"
                                        </p>
                                        <button onClick={(e) => { e.stopPropagation(); reset(); }} className="mt-12 flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                                            <RotateCcw className="w-5 h-5" /> Start New Session
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {error && (
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-red-500/10 border-t border-red-500/20 flex items-center gap-3 text-red-400 z-20">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm font-medium">{error}</span>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Right Column: Info Cards */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col gap-6"
                >
                    <SidebarCard icon={<Sparkles className="w-6 h-6 text-yellow-400" />} title="Coach Insight">
                        <p className="text-gray-400 text-sm leading-relaxed">
                            {analysisResult?.results
                                ? analysisResult.results[currentResultIndex].details
                                : analysisResult?.details
                                    ? analysisResult.details
                                    : "Upload your session to receive deep biomechanical feedback and alignment suggestions."}
                        </p>
                    </SidebarCard>

                    <SidebarCard icon={<Target className="w-6 h-6 text-purple-500" />} title="Peak Performance">
                        <div className="space-y-6">
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
                        <p className="text-xs text-gray-500 mt-3 uppercase tracking-widest font-bold">
                            {analysisResult ? 'Presence detected. Flow state active.' : 'Awakening energy channels...'}
                        </p>
                    </SidebarCard>
                </motion.div>
            </div>
        </div>
    );
}

function SidebarCard({ icon, title, children }) {
    return (
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 backdrop-blur-xl hover:bg-white/[0.04] transition-colors">
            <div className="flex items-center gap-3 mb-6">
                {icon}
                <h3 className="text-xl font-bold text-white">{title}</h3>
            </div>
            {children}
        </div>
    );
}

function StatRow({ label, value }) {
    return (
        <div className="flex justify-between items-center border-b border-white/5 pb-4 last:border-0 last:pb-0">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{label}</span>
            <span className="text-white font-mono font-bold">{value}</span>
        </div>
    );
}