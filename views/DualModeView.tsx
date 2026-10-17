
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UserProfile, QuantumProfile, QuantumVoice, QuantumPersona, SIFRA_ADVANCED_VOICES, VoiceProfile } from '../types';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { encode, decode, decodeAudioData } from '../utils/audioUtils';
import { motion, AnimatePresence } from 'framer-motion';

import VoiceStudioView from './VoiceStudioView';

// Components
import XMarkIcon from '../components/icons/XMarkIcon';
import SparklesIcon from '../components/icons/SparklesIcon';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import SpeakerWaveIcon from '../components/icons/SpeakerWaveIcon';
import UserIcon from '../components/icons/UserIcon';
import CheckCircleIcon from '../components/icons/CheckCircleIcon';
import PlusCircleIcon from '../components/icons/PlusCircleIcon';
import MicrophoneIcon from '../components/icons/MicrophoneIcon';
import EllipsisVerticalIcon from '../components/icons/EllipsisVerticalIcon';
import LogoutIcon from '../components/icons/LogoutIcon';
import CodeBracketIcon from '../components/icons/CodeBracketIcon';
import BoltIcon from '../components/icons/BoltIcon';
import CubeTransparentIcon from '../components/icons/CubeTransparentIcon';
import MicrophoneSlashIcon from '../components/icons/MicrophoneSlashIcon';
import SifraLogo from '../components/SifraLogo';

import { generateSampleSpeech } from '../services/geminiService';

if (!(process.env.API_KEY || process.env.GEMINI_API_KEY as string)) {
    throw new Error("API_KEY environment variable is not set");
}

// --- QUANTUM THEME CONSTANTS ---
const THEME = {
    colors: {
        bg: '#0D0D16',
        primary: '#2B0A3D',
        secondary: '#B45CFF',
        accent: '#3BB7FF',
        glass: 'rgba(255, 255, 255, 0.05)',
        textMain: '#FFFFFF',
        textMuted: '#A0A0B0',
    },
    gradients: {
        main: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#2B0A3D] via-[#0D0D16] to-[#000000]',
    }
};

// --- UTILS ---
const createBlob = (data: Float32Array): Blob => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        const s = Math.max(-1, Math.min(1, data[i]));
        int16[i] = s * 32767;
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
};

const safeCloseAudioContext = async (ctx: AudioContext | null) => {
    if (ctx && ctx.state !== 'closed') {
        try {
            await ctx.close();
        } catch (e) {
            console.warn("Error closing AudioContext:", e);
        }
    }
};

// --- 1. QUANTUM SPLASH (LONG PRESS INTERACTION) ---
const QuantumSplash: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [isPressed, setIsPressed] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isExploding, setIsExploding] = useState(false);
    const requestRef = useRef<number>();

    const startPress = () => setIsPressed(true);
    
    const endPress = () => {
        setIsPressed(false);
        if (progress < 100) setProgress(0);
    };

    useEffect(() => {
        const animate = () => {
            if (isPressed && !isExploding) {
                setProgress(prev => {
                    const next = prev + 1.5; // Speed of fill
                    if (next >= 100) {
                        setIsExploding(true);
                        setTimeout(onComplete, 1000);
                        return 100;
                    }
                    return next;
                });
            } else if (!isPressed && !isExploding) {
                setProgress(prev => Math.max(0, prev - 2));
            }
            requestRef.current = requestAnimationFrame(animate);
        };
        requestRef.current = requestAnimationFrame(animate);
        return () => { if(requestRef.current) cancelAnimationFrame(requestRef.current); };
    }, [isPressed, isExploding, onComplete]);

    return (
        <div 
            className={`fixed inset-0 z-[100] flex flex-col items-center justify-center ${THEME.gradients.main} overflow-hidden select-none`}
            onMouseDown={startPress}
            onMouseUp={endPress}
            onTouchStart={startPress}
            onTouchEnd={endPress}
        >
            <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-50 contrast-150"></div>
            
            {/* Main Logo Container */}
            <motion.div 
                animate={isExploding ? { scale: 15, opacity: 0 } : { scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="relative z-10 flex flex-col items-center"
            >
                {/* Progress Ring */}
                <div className="relative w-40 h-40 mb-10 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full rotate-[-90deg]">
                        <circle cx="80" cy="80" r="75" stroke="#333" strokeWidth="2" fill="none" />
                        <circle 
                            cx="80" cy="80" r="75" 
                            stroke="#3BB7FF" strokeWidth="4" fill="none"
                            strokeDasharray="471"
                            strokeDashoffset={471 - (471 * progress) / 100}
                            className="transition-all duration-75 ease-linear"
                        />
                    </svg>

                    {/* Premium Logo Mark */}
                    <div className="relative z-10 scale-125">
                        <SifraLogo showText={false} size="lg" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold tracking-[0.2em] text-white">SIFRA <span className="text-[#3BB7FF]">∞</span></h1>
                <p className="text-[10px] text-[#B45CFF] tracking-[0.4em] uppercase mt-2 font-black">Quantum Mode</p>
                
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    transition={{ delay: 1, repeat: Infinity, repeatType: "reverse" }}
                    className="text-[10px] text-white mt-10 tracking-widest"
                >
                    HOLD TO INITIALIZE
                </motion.p>
            </motion.div>
        </div>
    );
};

// --- 2. POST-ONBOARDING INTRO ---
const QuantumPostOnboardingSplash: React.FC<{ userName: string, onComplete: () => void }> = ({ userName, onComplete }) => {
    useEffect(() => {
        const timer = setTimeout(onComplete, 3500);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center ${THEME.gradients.main} overflow-hidden`}>
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                className="text-center"
            >
                <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-[#B45CFF] text-xs tracking-[0.3em] uppercase mb-4"
                >
                    Identity Recognized
                </motion.p>
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-wider drop-shadow-[0_0_25px_rgba(59,183,255,0.5)]">
                    Welcome, <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3BB7FF] to-[#B45CFF]">
                        {userName}
                    </span>
                </h1>
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 1.5, duration: 1 }}
                    className="h-[1px] bg-gradient-to-r from-transparent via-white to-transparent mt-6"
                />
            </motion.div>
        </div>
    );
};

// --- 3. 7-STAGE ONBOARDING ---
const QuantumOnboarding: React.FC<{ userProfile: UserProfile; onComplete: (qp: QuantumProfile) => void }> = ({ userProfile, onComplete }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<Partial<QuantumProfile>>({
        displayName: userProfile.name || '',
        gender: 'Not Specified',
        emotionalSensitivity: 50,
        riyaVoicePreset: 'Kore',
        relationshipMode: 'Supportive Partner',
        purpose: [],
        consentAudio: false
    });

    const nextStep = () => setStep(s => s + 1);

    const handleFinalSubmit = () => {
        const newProfile: QuantumProfile = {
            id: `QT-${new Date().getFullYear()}${Math.floor(Math.random()*10000)}`,
            isActivated: true,
            activatedAt: new Date().toISOString(),
            displayName: formData.displayName || 'User',
            languages: ['English'], 
            interests: [],
            emotionalPersonality: ['Adaptive'],
            emotionalSensitivity: formData.emotionalSensitivity || 50,
            conversationDepth: 'normal',
            behaviorRestrictions: { avoidSensitive: false, strictMoral: true },
            riyaVoicePreset: formData.riyaVoicePreset || 'Kore',
            voicePitch: formData.voicePitch || 1.0,
            voiceSpeed: formData.voiceSpeed || 1.0,
            voiceEmotion: formData.voiceEmotion || 'affectionate',
            voiceBreath: formData.voiceBreath !== undefined ? formData.voiceBreath : 35,
            relationshipMode: formData.relationshipMode || 'Supportive Partner',
            purpose: formData.purpose || [],
            usageFrequency: 'daily',
            advancedPrefs: { memoryRetention: true, moodTracking: true, dailyGreetings: true },
            consentAudio: formData.consentAudio || false,
            photoPrivacy: 'private',
            voiceConsent: true,
            strikes: 0,
            isSuspended: false,
            suspensionEndTime: null,
            isBanned: false,
            lastViolationDate: null,
            ...formData 
        } as QuantumProfile;
        
        onComplete(newProfile);
    };

    const renderStep = () => {
        switch(step) {
            case 1: // Welcome
                return (
                    <div className="text-center space-y-6 animate-fade-in-up">
                        <SifraLogo size="md" showText={false} />
                        <h2 className="text-2xl font-bold text-white tracking-tighter">Identity Initialization</h2>
                        <p className="text-[#A0A0B0]">We need to calibrate the Quantum Engine to match your personality.</p>
                        <button onClick={nextStep} className="w-full py-3 rounded-xl bg-[#3BB7FF] text-[#0D0D16] font-bold mt-4 shadow-lg shadow-blue-500/20">Start Calibration</button>
                    </div>
                );
            case 2: // User Blueprint
                return (
                    <div className="space-y-4 animate-fade-in-up">
                        <h2 className="text-xl font-bold text-white tracking-tight">Step 1: Your Blueprint</h2>
                        <div>
                            <label className="text-xs text-[#A0A0B0]">Display Name</label>
                            <input 
                                value={formData.displayName} 
                                onChange={e => setFormData({...formData, displayName: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white mt-1 outline-none focus:border-[#B45CFF]"
                            />
                        </div>
                        <button onClick={nextStep} className="w-full py-3 rounded-xl bg-gradient-to-r from-[#B45CFF] to-[#3BB7FF] text-white font-bold">Next</button>
                    </div>
                );
            case 3: // Emotional Matrix
                return (
                    <div className="space-y-6 animate-fade-in-up">
                         <h2 className="text-xl font-bold text-white tracking-tight">Step 2: Emotional Matrix</h2>
                         <div>
                            <label className="text-xs text-[#A0A0B0] flex justify-between">
                                <span>Emotional Sensitivity</span>
                                <span>{formData.emotionalSensitivity}%</span>
                            </label>
                            <input 
                                type="range" min="0" max="100" 
                                value={formData.emotionalSensitivity}
                                onChange={e => setFormData({...formData, emotionalSensitivity: parseInt(e.target.value)})}
                                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer mt-2 accent-[#B45CFF]"
                            />
                         </div>
                         <button onClick={nextStep} className="w-full py-3 rounded-xl bg-gradient-to-r from-[#B45CFF] to-[#3BB7FF] text-white font-bold">Next</button>
                    </div>
                );
            case 4: // Voice Setup
                return (
                    <div className="space-y-4 animate-fade-in-up">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white tracking-tight">Step 3: Riya Voice Lab</h2>
                            <span className="text-[10px] text-cyan-400 font-mono">SSML Ready</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {['Kore', 'Charon', 'Puck', 'Aoede'].map(v => (
                                <button 
                                    key={v}
                                    onClick={() => setFormData({...formData, riyaVoicePreset: v})}
                                    className={`p-3 rounded-xl border text-xs font-bold transition-all ${formData.riyaVoicePreset === v ? 'border-[#3BB7FF] bg-[#3BB7FF]/15 text-white shadow-[0_0_15px_rgba(59,183,255,0.2)]' : 'border-white/10 text-[#A0A0B0] hover:bg-white/5'}`}
                                >
                                    {v}
                                </button>
                            ))}
                        </div>

                        {/* Sliders for Pitch and Speed */}
                        <div className="space-y-3 pt-2">
                            <div>
                                <div className="flex justify-between text-xs text-[#A0A0B0] mb-1">
                                    <span>Vocal Pitch</span>
                                    <span className="text-cyan-300 font-mono">{(formData.voicePitch || 1.0).toFixed(2)}x</span>
                                </div>
                                <input 
                                    type="range" min="0.6" max="1.6" step="0.05"
                                    value={formData.voicePitch || 1.0}
                                    onChange={e => setFormData({...formData, voicePitch: parseFloat(e.target.value)})}
                                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#3BB7FF]"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between text-xs text-[#A0A0B0] mb-1">
                                    <span>Speech Speed</span>
                                    <span className="text-[#B45CFF] font-mono">{(formData.voiceSpeed || 1.0).toFixed(2)}x</span>
                                </div>
                                <input 
                                    type="range" min="0.7" max="1.5" step="0.05"
                                    value={formData.voiceSpeed || 1.0}
                                    onChange={e => setFormData({...formData, voiceSpeed: parseFloat(e.target.value)})}
                                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#B45CFF]"
                                />
                            </div>
                        </div>

                        <button onClick={nextStep} className="w-full py-3 rounded-xl bg-gradient-to-r from-[#B45CFF] to-[#3BB7FF] text-white font-bold mt-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                            Confirm Voice Calibration
                        </button>
                    </div>
                );
            case 5: // Relationship
                 return (
                    <div className="space-y-4 animate-fade-in-up">
                        <h2 className="text-xl font-bold text-white tracking-tight">Step 4: Relationship Mode</h2>
                        <div className="space-y-2">
                            {['Supportive Partner', 'Best Friend', 'Mentor', 'Sibling'].map(r => (
                                <button 
                                    key={r}
                                    onClick={() => setFormData({...formData, relationshipMode: r})}
                                    className={`w-full p-4 text-left rounded-lg border ${formData.relationshipMode === r ? 'border-[#B45CFF] bg-[#B45CFF]/10 text-white' : 'border-white/10 text-[#A0A0B0]'}`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                        <button onClick={nextStep} className="w-full py-3 rounded-xl bg-gradient-to-r from-[#B45CFF] to-[#3BB7FF] text-white font-bold">Next</button>
                    </div>
                );
            case 6: // Purpose
                 return (
                    <div className="space-y-4 animate-fade-in-up">
                        <h2 className="text-xl font-bold text-white tracking-tight">Step 5: Primary Purpose</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {['Companionship', 'Productivity', 'Mental Health', 'Learning'].map(p => (
                                <button 
                                    key={p} 
                                    onClick={() => {
                                        const current = formData.purpose || [];
                                        const exists = current.includes(p);
                                        setFormData({
                                            ...formData, 
                                            purpose: exists ? current.filter(x => x !== p) : [...current, p]
                                        });
                                    }}
                                    className={`p-3 rounded-lg border text-xs font-semibold ${formData.purpose?.includes(p) ? 'border-[#3BB7FF] bg-[#3BB7FF]/10 text-white' : 'border-white/10 text-[#A0A0B0]'}`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                        <button onClick={nextStep} className="w-full py-3 rounded-xl bg-gradient-to-r from-[#B45CFF] to-[#3BB7FF] text-white font-bold mt-4">Next</button>
                    </div>
                );
            case 7: // T&C & Activation
                return (
                    <div className="space-y-4 animate-fade-in-up">
                        <h2 className="text-xl font-bold text-white tracking-tight">Step 6: Protocol</h2>
                         <div className="p-4 bg-white/5 rounded-lg text-xs text-[#A0A0B0] h-24 overflow-y-auto">
                            By activating SIFRA, you accept the Quantum Terms. Emotional reliance is a simulated experience.
                        </div>
                        <label className="flex items-center gap-3">
                            <input 
                                type="checkbox" 
                                checked={formData.consentAudio}
                                onChange={e => setFormData({...formData, consentAudio: e.target.checked})}
                                className="accent-[#B45CFF] w-5 h-5"
                            />
                            <span className="text-sm text-white">I accept all terms.</span>
                        </label>
                        <button 
                            onClick={handleFinalSubmit} 
                            disabled={!formData.consentAudio}
                            className="w-full py-3 rounded-xl bg-[#3BB7FF] text-[#0D0D16] font-bold shadow-[0_0_20px_#3BB7FF] disabled:opacity-50"
                        >
                            ACTIVATE QUANTUM CORE
                        </button>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center ${THEME.gradients.main} p-6`}>
            <div className="w-full max-w-md bg-[#12051F]/90 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
                {renderStep()}
                <div className="flex justify-center gap-2 mt-6">
                    {[1,2,3,4,5,6,7].map(i => (
                        <div key={i} className={`h-1 rounded-full transition-all ${i <= step ? 'w-4 bg-[#B45CFF]' : 'w-2 bg-white/10'}`} />
                    ))}
                </div>
            </div>
        </div>
    );
};


// --- 4. VOICE STUDIO (SPLIT SECTIONS) ---
const QuantumVoiceStudio: React.FC<{ onClose: () => void; userProfile: UserProfile; onUpdate: (p: UserProfile) => void }> = ({ onClose, userProfile, onUpdate }) => {
    const qp = userProfile.quantumProfile || {} as QuantumProfile;
    const [previewing, setPreviewing] = useState<string | null>(null);
    const previewContextRef = useRef<AudioContext | null>(null);

    const playPreview = async (voiceId: string) => {
        setPreviewing(voiceId);
        await safeCloseAudioContext(previewContextRef.current);
        
        const audio = await generateSampleSpeech(voiceId);
        if (audio) {
            previewContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            const ctx = previewContextRef.current;
            try {
                const buffer = await decodeAudioData(decode(audio), ctx, 24000, 1);
                const source = ctx.createBufferSource();
                source.buffer = buffer;
                source.connect(ctx.destination);
                source.start();
                source.onended = () => {
                    if (previewContextRef.current === ctx) setPreviewing(null);
                };
            } catch (e) {
                console.warn("Playback error", e);
                setPreviewing(null);
            }
        } else {
             setPreviewing(null);
        }
    };

    useEffect(() => {
        return () => { safeCloseAudioContext(previewContextRef.current); };
    }, []);

    const handleSelect = (id: string) => {
        if (userProfile.quantumProfile) {
             const updatedProfile = { ...userProfile, quantumProfile: { ...userProfile.quantumProfile, riyaVoicePreset: id } };
             onUpdate(updatedProfile);
        }
    };

    const VoiceCard: React.FC<{ v: VoiceProfile }> = ({ v }) => (
        <div onClick={() => handleSelect(v.id)} className={`p-4 rounded-2xl border cursor-pointer transition-all ${qp.riyaVoicePreset === v.id ? 'bg-[#B45CFF]/10 border-[#B45CFF]' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h3 className="font-bold text-white text-sm">{v.name}</h3>
                    <p className="text-[10px] text-[#A0A0B0]">{v.ageGroup}</p>
                </div>
                {qp.riyaVoicePreset === v.id && <CheckCircleIcon className="w-5 h-5 text-[#B45CFF]" />}
            </div>
            <p className="text-xs text-[#A0A0B0] mb-3 line-clamp-1">{v.description}</p>
            <button 
                onClick={(e) => { e.stopPropagation(); playPreview(v.id); }}
                className="flex items-center gap-2 text-[10px] font-bold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
                <SpeakerWaveIcon className={`w-3 h-3 ${previewing === v.id ? 'text-[#3BB7FF] animate-pulse' : ''}`} /> 
                {previewing === v.id ? 'Playing...' : 'Preview'}
            </button>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 bg-[#0D0D16] flex flex-col">
            <div className="p-6 border-b border-white/5 flex items-center gap-4 bg-[#0D0D16]/90 backdrop-blur-md sticky top-0">
                <button onClick={onClose}><ArrowLeftIcon className="text-white" /></button>
                <h2 className="text-lg font-bold text-white">Voice Studio</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div>
                    <h3 className="text-xs font-bold text-[#B45CFF] uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#B45CFF]"></span> Female Voices
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {SIFRA_ADVANCED_VOICES.filter(v => v.gender === 'female').map(v => <VoiceCard key={v.id} v={v} />)}
                    </div>
                </div>

                <div>
                     <h3 className="text-xs font-bold text-[#3BB7FF] uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#3BB7FF]"></span> Male Voices
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {SIFRA_ADVANCED_VOICES.filter(v => v.gender === 'male').map(v => <VoiceCard key={v.id} v={v} />)}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 5. LIVE ORB ---
const QuantumOrbOverlay: React.FC<{ onClose: () => void; qp: QuantumProfile }> = ({ onClose, qp }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [status, setStatus] = useState('Initializing Quantum Core...');
    const [isMicOn, setIsMicOn] = useState(true);
    
    // Core Refs
    const sessionRef = useRef<any | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    
    const nextAudioStartTimeRef = useRef(0);
    const audioQueueRef = useRef<AudioBufferSourceNode[]>([]);
    
    const smoothedVolumeRef = useRef(0);
    const rotationRef = useRef(0);
    const animationFrameRef = useRef<number>();

    const activeVoice = SIFRA_ADVANCED_VOICES.find(v => v.id === qp.riyaVoicePreset) || SIFRA_ADVANCED_VOICES[0];

    const cleanup = useCallback(async () => {
        if (sessionRef.current) {
            try { await sessionRef.current.close(); } catch (e) { console.warn(e); }
            sessionRef.current = null;
        }
        
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => {
                track.stop();
                track.enabled = false;
            });
            streamRef.current = null;
        }

        audioQueueRef.current.forEach(node => {
            try { node.stop(); } catch (e) {}
        });
        audioQueueRef.current = [];

        await safeCloseAudioContext(audioContextRef.current);
        audioContextRef.current = null;

        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }, []);

    const playAudioQueue = async (base64: string) => {
        if (!audioContextRef.current) return;
        const ctx = audioContextRef.current;
        try {
            const buffer = await decodeAudioData(decode(base64), ctx, 24000, 1);
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            const currentTime = ctx.currentTime;
            const startTime = Math.max(currentTime, nextAudioStartTimeRef.current);
            source.start(startTime);
            nextAudioStartTimeRef.current = startTime + buffer.duration;
            audioQueueRef.current.push(source);
            source.onended = () => {
                audioQueueRef.current = audioQueueRef.current.filter(s => s !== source);
            };
        } catch (error) {
            console.error("Audio playback error:", error);
        }
    };

    const toggleMic = () => {
        if (streamRef.current) {
            streamRef.current.getAudioTracks().forEach(track => {
                track.enabled = !isMicOn;
            });
            setIsMicOn(!isMicOn);
        }
    };

    useEffect(() => {
        let isMounted = true;
        const start = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } 
                });
                if (!isMounted) {
                    stream.getTracks().forEach(t => t.stop());
                    return;
                }
                streamRef.current = stream;

                // Fix: Initializing GoogleGenAI with API key from environment strictly.
                const ai = new GoogleGenAI({ apiKey: (process.env.API_KEY || process.env.GEMINI_API_KEY as string) });
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                const ctx = audioContextRef.current;
                const source = ctx.createMediaStreamSource(stream);
                const processor = ctx.createScriptProcessor(4096, 1, 1);
                analyserRef.current = ctx.createAnalyser();
                source.connect(analyserRef.current);
                analyserRef.current.connect(processor);
                processor.connect(ctx.destination);

                processor.onaudioprocess = (e) => {
                    if (!sessionRef.current || !stream.getAudioTracks()[0].enabled) return;
                    const inputData = e.inputBuffer.getChannelData(0);
                    sessionRef.current.sendRealtimeInput({ media: createBlob(inputData) });
                };

                const session = await ai.live.connect({
                    model: 'gemini-3.8-live',
                    callbacks: {
                        onopen: () => { if (isMounted) setStatus('Quantum Engine Active'); },
                        onmessage: (msg: LiveServerMessage) => {
                            if (!isMounted) return;
                            const audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                            if (audio) playAudioQueue(audio);
                        },
                        onclose: () => { if (isMounted) cleanup(); },
                        onerror: () => { if (isMounted) setStatus('Connection Failed'); }
                    },
                    config: {
                        responseModalities: [Modality.AUDIO],
                        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: qp.riyaVoicePreset || 'Kore' } } },
                        systemInstruction: `You are Riya, an intelligent, empathetic, and personal AI companion operating in SIFRA Dual Mode.
User: ${qp.displayName}.
Personality Mode: ${qp.relationshipMode || 'Supportive Partner'}.
Vocal Tuning:
- Emotion: ${qp.voiceEmotion || 'affectionate'}
- Pitch scaling: ${qp.voicePitch || 1.0}x
- Tempo/Rate: ${qp.voiceSpeed || 1.0}x
- Breath & Human micro-pauses: ${qp.voiceBreath || 35}% intensity.
Speak with warmth, natural cadence, and genuine caring presence.`
                    }
                });
                sessionRef.current = session;
            } catch (e) { 
                console.error(e); 
                setStatus("Mic Access Denied");
            }
        };
        start();
        return () => { isMounted = false; cleanup(); };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            let volume = 0;
            if (analyserRef.current && isMicOn) {
                const data = new Uint8Array(analyserRef.current.frequencyBinCount);
                analyserRef.current.getByteTimeDomainData(data);
                let sum = 0;
                for(let i=0; i<data.length; i++) {
                    const v = (data[i] - 128) / 128;
                    sum += v*v;
                }
                volume = Math.sqrt(sum / data.length);
            }
            if (volume < 0.02) volume = 0;
            smoothedVolumeRef.current += (volume - smoothedVolumeRef.current) * 0.1;
            const baseRadius = 80;
            const dynamicRadius = baseRadius + (smoothedVolumeRef.current * 300);
            rotationRef.current += 0.005;

            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(rotationRef.current);
            ctx.strokeStyle = 'rgba(59, 183, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.setLineDash([20, 15]);
            ctx.beginPath(); ctx.arc(0, 0, baseRadius + 40, 0, Math.PI * 2); ctx.stroke();
            ctx.restore();

            const gradient = ctx.createRadialGradient(cx, cy, dynamicRadius * 0.1, cx, cy, dynamicRadius);
            gradient.addColorStop(0, '#FFFFFF');
            gradient.addColorStop(0.3, '#B45CFF');
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.beginPath(); ctx.arc(cx, cy, dynamicRadius, 0, Math.PI * 2); ctx.fill();

            ctx.fillStyle = '#0D0D16';
            ctx.beginPath(); ctx.arc(cx, cy, baseRadius * 0.8, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = isMicOn ? '#3BB7FF' : '#FF4B4B';
            ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
            animationFrameRef.current = requestAnimationFrame(render);
        };
        render();
    }, [isMicOn]);

    return (
        <div className="fixed inset-0 z-[100] bg-[#0D0D16] flex flex-col items-center justify-between py-12">
            <canvas ref={canvasRef} className="absolute inset-0" />
            <div className="relative z-10 flex flex-col items-center">
                <SifraLogo size="sm" showText={false} />
                <h1 className="text-3xl font-bold tracking-[0.3em] text-white mt-4">SIFRA</h1>
                <p className="text-[10px] text-[#3BB7FF] tracking-widest uppercase">{status}</p>
            </div>
            <div className="relative z-10">
                <button onClick={toggleMic} className={`w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all ${isMicOn ? 'bg-white/10 border-[#3BB7FF] text-[#3BB7FF]' : 'bg-red-500/20 border-red-500 text-red-500'}`}>
                    {isMicOn ? <MicrophoneIcon className="w-8 h-8" /> : <MicrophoneSlashIcon className="w-8 h-8" />}
                </button>
            </div>
            <div className="relative z-10 flex flex-col items-center mb-10 w-full px-8">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 w-full max-w-sm flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#2B0A3D] to-[#B45CFF] flex items-center justify-center"><SpeakerWaveIcon className="w-5 h-5 text-white" /></div>
                    <div className="flex-1">
                        <p className="text-[10px] text-[#A0A0B0] uppercase tracking-wide">Voice Module</p>
                        <p className="text-sm font-bold text-white">{activeVoice.name}</p>
                    </div>
                </div>
                <button onClick={() => { cleanup(); onClose(); }} className="mt-8 p-4 bg-red-500/20 rounded-full border border-red-500/50 hover:bg-red-500/40 transition-all"><XMarkIcon className="text-white w-6 h-6" /></button>
            </div>
        </div>
    );
};

// --- SMALLER COMPONENTS ---
const QuantumHeader: React.FC<{ userProfile: UserProfile; onMenuClick: () => void; onProfileClick: () => void }> = ({ userProfile, onMenuClick, onProfileClick }) => (
    <div className="h-[82px] px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-xl bg-[#0D0D16]/60 border-b border-white/5">
        <button onClick={onProfileClick} className="flex items-center gap-3 group">
            <div className="relative">
                <div className="w-[42px] h-[42px] rounded-full p-[1.5px] bg-gradient-to-tr from-[#B45CFF] to-[#3BB7FF] shadow-[0_0_15px_rgba(180,92,255,0.3)]">
                    <img src={userProfile.avatar || `https://ui-avatars.com/api/?name=${userProfile.name}`} className="w-full h-full rounded-full object-cover border border-[#0D0D16]" alt=""/>
                </div>
            </div>
            <div className="flex flex-col items-start">
                <span className="text-[10px] text-[#A0A0B0] font-medium tracking-wide">Hi, {userProfile.nickname || userProfile.name?.split(' ')[0]}</span>
                <span className="text-[12px] text-white font-semibold">Profile</span>
            </div>
        </button>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-[#3BB7FF]/20">
            <SifraLogo size="sm" showText={false} className="scale-50 -ml-4" />
            <span className="text-[10px] font-bold text-[#3BB7FF] tracking-wide uppercase">Quantum Leap</span>
        </div>
        <div className="flex items-center gap-4">
             <button onClick={onMenuClick} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center border border-white/10"><EllipsisVerticalIcon className="w-5 h-5 text-white" /></button>
        </div>
    </div>
);

const QuantumSidebar: React.FC<{ isOpen: boolean; onClose: () => void; userProfile: UserProfile; onNavigate: (view: string) => void; onLogout: () => void }> = ({ isOpen, onClose, userProfile, onNavigate, onLogout }) => (
    <AnimatePresence>
        {isOpen && (
            <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm" />
                <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="fixed inset-y-0 right-0 z-[70] w-80 bg-[#12051F]/95 backdrop-blur-2xl border-l border-white/10 flex flex-col p-6">
                    <div className="flex justify-between items-center mb-8"><h2 className="text-xs font-bold text-[#B45CFF] uppercase">Menu</h2><button onClick={onClose}><XMarkIcon className="text-white/50" /></button></div>
                    <div className="flex-1 space-y-2">
                        {[
                            { l: 'Dashboard', i: <CubeTransparentIcon />, id: 'home' },
                            { l: 'Voice Studio', i: <MicrophoneIcon />, id: 'voice' },
                            { l: 'Persona System', i: <UserIcon />, id: 'persona' },
                            { l: 'Developer Options', i: <CodeBracketIcon />, id: 'developer' },
                        ].map(item => (
                            <button key={item.id} onClick={() => { onNavigate(item.id); onClose(); }} className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 text-[#C1C2C4] hover:text-white"><div className="w-5 h-5">{item.i}</div><span className="text-sm font-medium">{item.l}</span></button>
                        ))}
                    </div>
                    <button onClick={onLogout} className="flex gap-2 text-red-400 text-sm font-semibold"><LogoutIcon className="w-4 h-4" /> Log Out</button>
                </motion.div>
            </>
        )}
    </AnimatePresence>
);

const QuantumStatusCard: React.FC<{ userProfile: UserProfile, onActivate: () => void }> = ({ userProfile, onActivate }) => (
    <div className="relative w-full h-48 rounded-[24px] overflow-hidden border border-[#B45CFF]/30 shadow-lg group bg-[#12051F]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#2B0A3D] to-[#12051F]"></div>
        <div className="relative z-10 p-6 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
                <div>
                     <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div><span className="text-[10px] font-bold text-green-400 uppercase">System Online</span></div>
                     <h3 className="text-xl font-bold text-white">Quantum Dashboard</h3>
                </div>
                <div onClick={onActivate} className="w-10 h-10 rounded-full border border-[#3BB7FF]/50 flex items-center justify-center cursor-pointer hover:bg-[#3BB7FF]/10"><BoltIcon className="w-5 h-5 text-[#3BB7FF]" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div><p className="text-[10px] text-[#A0A0B0] uppercase">Identity</p><p className="text-sm text-white font-bold">{userProfile.name}</p></div>
                <div><p className="text-[10px] text-[#A0A0B0] uppercase">Quantum ID</p><p className="text-sm text-[#3BB7FF] font-mono">{userProfile.quantumProfile?.id}</p></div>
            </div>
        </div>
    </div>
);

const ToolCard: React.FC<{ icon: React.ReactNode; title: string; subtitle: string; color: string; onClick: () => void }> = ({ icon, title, subtitle, color, onClick }) => (
    <button onClick={onClick} className="flex flex-col p-4 rounded-[20px] bg-white/5 border border-white/5 hover:border-[#B45CFF]/40 transition-all text-left">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${color} bg-opacity-20 text-white border border-white/10`}>{icon}</div>
        <h4 className="text-sm font-bold text-white">{title}</h4>
        <p className="text-[10px] text-[#A0A0B0]">{subtitle}</p>
    </button>
);

const QuantumBottomNav: React.FC<{ activeTab: string; onTabChange: (t: string) => void; onCenterClick: () => void }> = ({ activeTab, onTabChange, onCenterClick }) => (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md h-[70px] bg-[#12051F]/80 backdrop-blur-xl border border-white/10 rounded-[35px] shadow-lg flex items-center justify-evenly px-2 z-40">
        <button onClick={() => onTabChange('home')} className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-[#B45CFF]' : 'text-[#A0A0B0]'}`}><CubeTransparentIcon className="w-6 h-6" /><span className="text-[9px] uppercase">Home</span></button>
        <button onClick={() => onTabChange('persona')} className={`flex flex-col items-center gap-1 ${activeTab === 'persona' ? 'text-[#B45CFF]' : 'text-[#A0A0B0]'}`}><UserIcon className="w-6 h-6" /><span className="text-[9px] uppercase">Persona</span></button>
        <button onClick={onCenterClick} className="relative -top-6"><div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#2B0A3D] to-[#B45CFF] border-[4px] border-[#0D0D16] flex items-center justify-center shadow-lg"><SparklesIcon className="w-7 h-7 text-white" /></div></button>
        <button onClick={() => onTabChange('voice')} className={`flex flex-col items-center gap-1 ${activeTab === 'voice' ? 'text-[#B45CFF]' : 'text-[#A0A0B0]'}`}><MicrophoneIcon className="w-6 h-6" /><span className="text-[9px] uppercase">Studio</span></button>
        <button onClick={() => onTabChange('developer')} className={`flex flex-col items-center gap-1 ${activeTab === 'developer' ? 'text-[#B45CFF]' : 'text-[#A0A0B0]'}`}><CodeBracketIcon className="w-6 h-6" /><span className="text-[9px] uppercase">Dev</span></button>
    </div>
);

const DualModeView: React.FC<{ userProfile: UserProfile; onUpdateProfile: (p: UserProfile) => void; onClose: () => void; }> = ({ userProfile, onUpdateProfile, onClose }) => {
    const [viewState, setViewState] = useState<'splash' | 'onboarding' | 'post_splash' | 'home'>('splash');
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeView, setActiveView] = useState('home');
    const [orbActive, setOrbActive] = useState(false);
    const hasActiveProfile = userProfile.quantumProfile?.isActivated;

    const handleSplashComplete = () => {
        if (hasActiveProfile) setViewState('home');
        else setViewState('onboarding');
    };

    if (viewState === 'splash') return <QuantumSplash onComplete={handleSplashComplete} />;
    if (viewState === 'onboarding') return <QuantumOnboarding userProfile={userProfile} onComplete={(qp) => { onUpdateProfile({ ...userProfile, quantumProfile: qp }); setViewState('post_splash'); }} />;
    if (viewState === 'post_splash') return <QuantumPostOnboardingSplash userName={userProfile.quantumProfile?.displayName || userProfile.name || 'User'} onComplete={() => setViewState('home')} />;

    return (
        <div className={`relative min-h-screen w-full ${THEME.gradients.main} text-white font-sans overflow-hidden`}>
            <QuantumHeader userProfile={userProfile} onMenuClick={() => setMenuOpen(true)} onProfileClick={() => setActiveView('developer')} />
            <QuantumSidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} userProfile={userProfile} onNavigate={(v) => { if(v==='orb') setOrbActive(true); else setActiveView(v); }} onLogout={onClose} />
            <div className="pb-32 overflow-y-auto h-[calc(100vh-82px)]">
                {activeView === 'home' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6">
                        <div className="mb-8 mt-2">
                            <h1 className="text-3xl font-black mb-1 tracking-tighter">Welcome to <span className="text-[#B45CFF]">SIFRA</span></h1>
                            <p className="text-[#A0A0B0] text-sm uppercase font-bold tracking-widest">Quantum Interaction Hub</p>
                        </div>
                        <div className="mb-8"><QuantumStatusCard userProfile={userProfile} onActivate={() => setOrbActive(true)} /></div>
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <ToolCard icon={<MicrophoneIcon className="w-5 h-5" />} title="Voice Studio" subtitle="Customize Tone" color="bg-[#3BB7FF]" onClick={() => setActiveView('voice')} />
                            <ToolCard icon={<UserIcon className="w-5 h-5" />} title="Persona System" subtitle="Identity & Modes" color="bg-[#B45CFF]" onClick={() => setActiveView('persona')} />
                            <ToolCard icon={<SparklesIcon className="w-5 h-5" />} title="Quantum Orb" subtitle="Animation Control" color="bg-[#FF4B4B]" onClick={() => setOrbActive(true)} />
                            <ToolCard icon={<CodeBracketIcon className="w-5 h-5" />} title="Developer Options" subtitle="Edit Profile & System" color="bg-[#10B981]" onClick={() => setActiveView('developer')} />
                        </div>
                    </motion.div>
                )}
                {activeView === 'voice' && <VoiceStudioView userProfile={userProfile} onUpdateProfile={onUpdateProfile} onClose={() => setActiveView('home')} />}
            </div>
            <QuantumBottomNav activeTab={activeView} onTabChange={setActiveView} onCenterClick={() => setOrbActive(true)} />
            <AnimatePresence>{orbActive && <QuantumOrbOverlay qp={userProfile.quantumProfile!} onClose={() => setOrbActive(false)} />}</AnimatePresence>
        </div>
    );
};

export default DualModeView;
