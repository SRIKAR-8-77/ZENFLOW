import React, { useState, useRef } from 'react';
import { UploadIcon } from './Icons';

export function VideoAnalysis({ onAnalysisComplete, user, backendUrl }) {
    const [isLoading, setIsLoading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !user) return;
        setIsLoading(true);
        setUploadError('');
        try {
            const token = localStorage.getItem('zenflow_token');
            if (!token) return;
            const formData = new FormData();
            formData.append('file', selectedFile);

            const response = await fetch(`${backendUrl}/analyze-session/`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                onAnalysisComplete();
                setSelectedFile(null);
            } else {
                const data = await response.json();
                setUploadError(`Flow interrupted: ${data.detail || 'The temple is busy.'}`);
            }
        } catch (err) {
            setUploadError('Wait, the digital winds are too strong. Try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="zen-card relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 blur-[50px] rounded-full pointer-events-none"></div>

            <h2 className="text-xl font-bold mb-8 text-white flex items-center tracking-tight">
                <span className="w-8 h-8 rounded-xl bg-primary-500/20 flex items-center justify-center mr-3 text-primary-400">
                    <UploadIcon />
                </span>
                New Practice
            </h2>

            <div className="space-y-6">
                <div
                    onClick={() => fileInputRef.current.click()}
                    className={`relative cursor-pointer rounded-[2.5rem] p-12 border-2 border-dashed transition-all duration-700 flex flex-col items-center justify-center text-center overflow-hidden
                        ${selectedFile
                            ? 'border-primary-500/50 bg-primary-500/5'
                            : 'border-white/10 hover:border-primary-500/30 hover:bg-white/5'}`}
                >
                    {/* Preview Image if selected */}
                    {selectedFile && previewUrl && (
                        <div className="absolute inset-0 z-0">
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover opacity-30 blur-sm group-hover:blur-0 transition-all duration-700" />
                        </div>
                    )}

                    {/* Animated Ripple for hover effect */}
                    <div className="absolute inset-0 bg-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 scale-150 animate-pulse-glow"></div>

                    <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-6 transition-all duration-500 relative z-10
                        ${selectedFile ? 'bg-primary-500 text-white shadow-2xl scale-110' : 'bg-slate-800 text-slate-500 group-hover:text-primary-400'}`}>
                        <UploadIcon />
                    </div>

                    <p className="font-bold text-white relative z-10 text-lg tracking-tight">
                        {selectedFile ? selectedFile.name : "Align your flow here"}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-2 font-black uppercase tracking-widest relative z-10">MP4 • MOV • Digital Vibe</p>

                    <input
                        type="file"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        className="hidden"
                        accept="video/*"
                    />
                </div>

                <button
                    onClick={handleUpload}
                    disabled={isLoading || !selectedFile}
                    className="zen-button-primary w-full disabled:grayscale disabled:opacity-30 disabled:shadow-none relative overflow-hidden group/btn"
                >
                    <span className="relative z-10">
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-3"></div>
                                Analyzing Presence...
                            </div>
                        ) : 'Commence Analysis'}
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 skew-x-[-20deg]"></div>
                </button>

                {uploadError && (
                    <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-400 text-xs font-black uppercase tracking-wider border border-rose-500/20 animate-in fade-in zoom-in-95">
                        ⚠️ {uploadError}
                    </div>
                )}
            </div>
        </div>
    );
}
