
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile } from '../types';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import VideoCameraIcon from '../components/icons/VideoCameraIcon';
import MicrophoneIcon from '../components/icons/MicrophoneIcon';
import { SifraMainLogo } from '../components/SifraBrandedIcons';
import BoltIcon from '../components/icons/BoltIcon';
import XMarkIcon from '../components/icons/XMarkIcon';

const TXOnView: React.FC<{ userProfile: UserProfile; onClose: () => void }> = ({ userProfile, onClose }) => {
    const [isBooting, setIsBooting] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [hasSynced, setHasSynced] = useState(false);
    const [message, setMessage] = useState("");
    const [aiName, setAiName] = useState("Sifra");
    const [isMicOn, setIsMicOn] = useState(false);
    const [isCamOn, setIsCamOn] = useState(false);
    const [permissionError, setPermissionError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const stopMedia = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsCamOn(false);
        setIsMicOn(false);
    };

    const startMedia = async () => {
        try {
            setIsSyncing(true);
            setPermissionError(null);
            
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("Media devices not supported in this environment.");
            }

            // Try to get both first
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: true, 
                    audio: true 
                });
                streamRef.current = stream;
                if (videoRef.current) videoRef.current.srcObject = stream;
                setIsMicOn(true);
                setIsCamOn(true);
                setHasSynced(true);
            } catch (initialErr) {
                console.warn("Could not get both video and audio, trying individual...", initialErr);
                
                // Fallback: try video only
                try {
                    const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
                    streamRef.current = videoStream;
                    if (videoRef.current) videoRef.current.srcObject = videoStream;
                    setIsCamOn(true);
                    setIsMicOn(false);
                    setHasSynced(true);
                } catch (videoErr) {
                    console.warn("Video also failed", videoErr);
                    // Fallback: try audio only
                    const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    streamRef.current = audioStream;
                    setIsCamOn(false);
                    setIsMicOn(true);
                    setHasSynced(true);
                }
            }
        } catch (err: any) {
            console.error("Media Error:", err);
            let userFriendlyMessage = "Permission denied";
            if (err.name === 'NotAllowedError') userFriendlyMessage = "Access was blocked by the user or browser";
            else if (err.name === 'NotFoundError') userFriendlyMessage = "No camera or microphone detected";
            else if (err.name === 'NotReadableError') userFriendlyMessage = "Hardware is already in use by another app";
            
            setPermissionError(err.message || userFriendlyMessage);
        } finally {
            setIsSyncing(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsBooting(false);
        }, 2000);
        
        setMessage(`Hello ${userProfile.name}, Neural Core is standing by. All modules optimized for performance.`);

        // Handle tab visibility to save background internet/resources
        const handleVisibilityChange = () => {
            if (document.hidden) {
                console.log("Entering Power Save Mode: Terminating streams...");
                stopMedia();
                setMessage("Neural Link Suspended. Power Optimizing...");
            } else if (hasSynced) {
                setMessage("Welcome back. Request re-sync if needed.");
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        
        return () => {
            clearTimeout(timer);
            stopMedia();
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [hasSynced]);

    const handleSyncRequest = () => {
        if (!hasSynced || !streamRef.current) {
            startMedia();
        } else {
            stopMedia();
            setHasSynced(false);
        }
    };

    const handleShutdown = () => {
        setMessage("Neural Link Terminated. Goodbye, User.");
        setTimeout(() => {
            onClose();
        }, 1500);
    };

    if (isBooting) {
        return (
            <div className="fixed inset-0 z-[600] bg-black flex flex-col items-center justify-center">
                <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <SifraMainLogo showText={false} className="w-24 h-24" />
                </motion.div>
                <h1 className="text-white font-black italic tracking-widest mt-8 uppercase">Initialising TX-ON</h1>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[500] bg-zinc-950 text-white flex flex-col font-sans overflow-hidden">
            {/* Background Neural Matrix */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-zinc-950" />
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none" />
            
            {/* Camera Overlay (Top Right Floating) */}
            <AnimatePresence>
                {isCamOn && !permissionError && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute top-8 right-8 w-32 h-44 bg-black rounded-3xl overflow-hidden border border-purple-500/30 shadow-2xl z-50"
                    >
                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover grayscale contrast-125" />
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Permission Error Overlay */}
            <AnimatePresence>
                {permissionError && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
                    >
                        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6 border border-red-500/40">
                            <XMarkIcon className="w-10 h-10 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-black italic uppercase tracking-tight text-white mb-2">Neural Link Failed</h2>
                        <p className="text-gray-400 font-bold text-sm mb-8 max-w-xs">{permissionError}. Please allow camera and microphone access to synchronise with the Matrix.</p>
                        <div className="flex flex-col gap-4 w-full max-w-xs">
                            <button 
                                onClick={startMedia}
                                className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl active:scale-95 transition-all shadow-xl shadow-white/10"
                            >
                                Grant Permission
                            </button>
                            <button 
                                onClick={() => setPermissionError(null)}
                                className="w-full py-4 bg-white/5 text-white/40 border border-white/10 font-black uppercase tracking-widest text-xs rounded-2xl active:scale-95 transition-all"
                            >
                                Continue Offline
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <header className="px-8 pt-12 pb-6 flex justify-between items-center relative z-10">
                <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl border border-white/10 active:scale-90 transition-transform">
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <div className="flex flex-col items-center">
                    <h2 className="text-xl font-black italic tracking-tighter text-purple-400 uppercase">TX-ON MATRIX</h2>
                    <p className="text-[6px] font-black uppercase tracking-[0.6em] text-white/30">Active Neural Session v4.1</p>
                </div>
                <div className="w-11 h-11" /> {/* Spacer */}
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
                {/* AI AVATAR ROBOT GIRL (Animated SVG Stylized) */}
                <div className="relative w-80 h-80 flex items-center justify-center">
                    {/* Pulsing Aura */}
                    <motion.div 
                        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="absolute inset-0 rounded-full bg-purple-500/20 blur-[80px]"
                    />
                    
                    <motion.div 
                        className="relative w-full h-full flex items-center justify-center"
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    >
                        {/* THE ASSISTANT FACE/BODY MOCKUP */}
                        <svg viewBox="0 0 200 200" className="w-64 h-64 drop-shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                            <defs>
                                <linearGradient id="cyber-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#c084fc" />
                                    <stop offset="100%" stopColor="#6366f1" />
                                </linearGradient>
                            </defs>
                            {/* Hair/Horns Background */}
                            <motion.path 
                                d="M40 80 Q20 40 50 20 Q100 0 150 20 Q180 40 160 80" 
                                fill="none" stroke="url(#cyber-grad)" strokeWidth="2" strokeLinecap="round"
                                animate={{ d: ["M40 80 Q20 40 50 20 Q100 0 150 20 Q180 40 160 80", "M45 80 Q25 45 55 25 Q100 5 145 25 Q175 45 155 80", "M40 80 Q20 40 50 20 Q100 0 150 20 Q180 40 160 80"] }}
                                transition={{ duration: 3, repeat: Infinity }}
                            />
                            {/* Main Face Plate */}
                            <ellipse cx="100" cy="100" rx="60" ry="75" fill="#09090b" stroke="url(#cyber-grad)" strokeWidth="4" />
                            {/* Eyes */}
                            <motion.g animate={{ opacity: [1, 0, 1] }} transition={{ duration: 4, repeat: Infinity, times: [0, 0.9, 1] }}>
                                <circle cx="75" cy="90" r="8" fill="url(#cyber-grad)" />
                                <circle cx="125" cy="90" r="8" fill="url(#cyber-grad)" />
                                <circle cx="75" cy="90" r="2" fill="white" />
                                <circle cx="125" cy="90" r="2" fill="white" />
                            </motion.g>
                            {/* Voice Wave */}
                            <motion.path 
                                d="M80 140 Q100 130 120 140" 
                                fill="none" 
                                stroke="url(#cyber-grad)" 
                                strokeWidth="3" 
                                strokeLinecap="round"
                                animate={{ d: ["M80 140 Q100 130 120 140", "M80 140 Q100 160 120 140", "M80 140 Q100 130 120 140"] }}
                                transition={{ duration: 0.2, repeat: Infinity }}
                            />
                        </svg>
                    </motion.div>
                </div>

                {/* Subtitles / AI Expression */}
                <div className="w-full max-w-sm mt-12 text-center">
                    <motion.p 
                        key={message}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-lg font-bold text-white/90 leading-relaxed px-4"
                    >
                        "{message}"
                    </motion.p>
                    <p className="text-[8px] font-black uppercase tracking-[0.4em] text-purple-500 mt-4">AI Identity: {aiName}</p>
                </div>
            </main>

            {/* Interaction Controls */}
            <footer className="px-8 pb-16 flex flex-col items-center gap-12 relative z-10 w-full max-w-lg mx-auto">
                <div className="flex flex-col items-center gap-6 w-full">
                    {hasSynced ? (
                        <div className="flex gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <button 
                                onClick={() => setIsMicOn(!isMicOn)}
                                className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all bg-white/5 border border-white/10 ${isMicOn ? 'text-purple-400 border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.2)]' : 'text-gray-500'}`}
                            >
                                <MicrophoneIcon className="w-6 h-6" />
                            </button>
                            <button 
                                onClick={() => setIsCamOn(!isCamOn)}
                                className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all bg-white/5 border border-white/10 ${isCamOn ? 'text-purple-400 border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.2)]' : 'text-gray-500'}`}
                            >
                                <VideoCameraIcon className="w-6 h-6" />
                            </button>
                        </div>
                    ) : (
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSyncRequest}
                            disabled={isSyncing}
                            className={`w-full py-5 rounded-[2rem] bg-gradient-to-r from-purple-600 to-indigo-600 font-black uppercase tracking-[0.2em] text-xs shadow-2xl transition-all relative overflow-hidden ${isSyncing ? 'opacity-50 grayscale' : 'hover:shadow-purple-500/20'}`}
                        >
                            {isSyncing ? (
                                <div className="flex items-center justify-center gap-3">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Syncing Neural Matrix...</span>
                                </div>
                            ) : (
                                "Establish Real-Time Link"
                            )}
                        </motion.button>
                    )}

                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                        <div className={`w-1.5 h-1.5 rounded-full ${hasSynced ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'}`} />
                        <span className="text-[7px] font-black uppercase tracking-widest text-white/40">
                            {hasSynced ? 'Data Transmission Active' : 'Efficient Mode: Background Optimized'}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-4">
                    <button 
                        onClick={handleShutdown}
                        className="group flex items-center gap-3 px-8 py-4 bg-zinc-900 border border-white/10 rounded-3xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all text-white/60 hover:text-white"
                    >
                        <BoltIcon className="w-4 h-4" />
                        TERMINATE LINK
                    </button>
                    <p className="text-[6px] font-black text-white/20 uppercase tracking-[0.6em]">System Idle Detection Active</p>
                </div>
            </footer>
        </div>
    );
};

export default TXOnView;
