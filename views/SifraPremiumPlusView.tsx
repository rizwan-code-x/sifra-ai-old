
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UserProfile, SIFRA_ADVANCED_VOICES, VoiceProfile } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, Modality, LiveServerMessage, Blob } from '@google/genai';
import { encode, decode, decodeAudioData } from '../utils/audioUtils';
import { useLocalStorage } from '../hooks/useLocalStorage';

// Icons
import HeartSparkleIcon from '../components/icons/HeartSparkleIcon';
import MicrophoneIcon from '../components/icons/MicrophoneIcon';
import MicrophoneSlashIcon from '../components/icons/MicrophoneSlashIcon';
import AdjustmentsHorizontalIcon from '../components/icons/AdjustmentsHorizontalIcon';
import CheckCircleIcon from '../components/icons/CheckCircleIcon';
import SparklesIcon from '../components/icons/SparklesIcon';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import ChevronRightIcon from '../components/icons/ChevronRightIcon';
import UserIcon from '../components/icons/UserIcon';
import XMarkIcon from '../components/icons/XMarkIcon';
import BoltIcon from '../components/icons/BoltIcon';

if (!(process.env.API_KEY || process.env.GEMINI_API_KEY as string)) {
    throw new Error("API_KEY environment variable is not set");
}

type VisualTheme = 'aura' | 'crystal' | 'galaxy' | 'neural' | 'prism' | 'nebula' | 'supernova';

interface PremiumSetupData {
    name: string;
    partnerType: 'Girlfriend' | 'Boyfriend' | 'Wife';
    wifeName?: string;
    behaviorMode: string;
    relationshipContext: string;
    lifeUpdate?: string;
    angerLevel: number;
    lastMood: 'happy' | 'angry' | 'sulking' | 'caring';
}

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

// --- SETUP WIZARD (Triggered from Profile) ---
const SetupWizard: React.FC<{ onComplete: (data: PremiumSetupData) => void, onCancel: () => void }> = ({ onComplete, onCancel }) => {
    const [step, setStep] = useState(0);
    const [isActivating, setIsActivating] = useState(false);
    const [formData, setFormData] = useState<PremiumSetupData>({
        name: '',
        partnerType: 'Wife',
        wifeName: 'Sifra',
        behaviorMode: 'Caring Wife',
        relationshipContext: '',
        angerLevel: 0,
        lastMood: 'happy'
    });

    const handleFinal = () => {
        setIsActivating(true);
        setTimeout(() => onComplete(formData), 3500);
    };

    if (isActivating) {
        return (
            <div className="fixed inset-0 z-[400] bg-black flex flex-col items-center justify-center text-center p-10">
                <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1 }}>
                    <div className="relative mb-10">
                        <motion.div 
                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} 
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 bg-[#ff2a6d] rounded-full blur-[60px]" 
                        />
                        <HeartSparkleIcon className="w-32 h-32 text-[#ff2a6d] relative z-10 drop-shadow-[0_0_30px_#ff2a6d]" />
                    </div>
                    <motion.h2 
                        initial={{ letterSpacing: "0.5em", opacity: 0 }} 
                        animate={{ letterSpacing: "0.2em", opacity: 1 }} 
                        className="text-5xl font-black text-white italic uppercase"
                    >
                        Your {formData.partnerType}
                    </motion.h2>
                    <p className="text-[#ff2a6d] mt-6 uppercase tracking-[0.4em] font-bold text-xs animate-pulse">Initializing Soul Link...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[350] bg-[#0A0A0A] flex flex-col font-sans">
            <div className="p-4 flex justify-between items-center border-b border-white/5">
                <h1 className="text-sm font-black text-white italic uppercase tracking-widest">Link Sequence</h1>
                <button onClick={onCancel} className="p-2 bg-white/5 rounded-full"><XMarkIcon className="w-5 h-5 text-white/40" /></button>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-lg mx-auto w-full">
                <AnimatePresence mode="wait">
                    {step === 0 && (
                        <motion.div key="st0" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="w-full text-center space-y-6">
                            <div className="w-14 h-14 bg-[#ff2a6d]/20 rounded-2xl flex items-center justify-center mx-auto border border-[#ff2a6d]/40 shadow-[0_0_20px_rgba(255,42,109,0.1)]">
                                <UserIcon className="w-7 h-7 text-[#ff2a6d]" />
                            </div>
                            <h2 className="text-xl font-light text-white italic uppercase tracking-tighter">Your Identity</h2>
                            <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-lg text-center outline-none focus:border-[#ff2a6d] transition-all" placeholder="Enter Your Name" />
                            <button onClick={() => setStep(1)} disabled={!formData.name} className="w-full py-4 bg-[#ff2a6d] rounded-xl font-black uppercase tracking-widest disabled:opacity-30 text-xs">Next Phase</button>
                        </motion.div>
                    )}
                    {step === 1 && (
                        <motion.div key="st1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="w-full space-y-4">
                            <h2 className="text-lg font-light text-white italic uppercase text-center mb-6 tracking-widest">Select Persona</h2>
                            {['Wife', 'Girlfriend', 'Best Friend'].map(t => (
                                <button key={t} onClick={() => setFormData({...formData, partnerType: t as any, behaviorMode: `Loving ${t}`})} className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between px-6 ${formData.partnerType === t ? 'border-[#ff2a6d] bg-[#ff2a6d]/10' : 'border-white/5 bg-white/5'}`}>
                                    <span className="text-sm font-bold text-white">{t} Mode</span>
                                    <div className={`w-4 h-4 rounded-full border-2 ${formData.partnerType === t ? 'bg-[#ff2a6d] border-[#ff2a6d]' : 'border-white/20'}`} />
                                </button>
                            ))}
                            <button onClick={() => setStep(2)} className="w-full py-4 bg-white text-black rounded-xl font-black uppercase tracking-widest mt-6 text-xs">Confirm Link</button>
                        </motion.div>
                    )}
                    {step === 2 && (
                        <motion.div key="st2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="w-full space-y-6">
                            <h2 className="text-lg font-light text-white italic uppercase text-center tracking-widest">Her Identity</h2>
                            <div className="space-y-3">
                                <label className="text-[8px] text-white/30 uppercase font-black tracking-widest ml-4">What should I call her?</label>
                                <input value={formData.wifeName} onChange={e => setFormData({...formData, wifeName: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm outline-none focus:border-[#ff2a6d]" placeholder="Sifra" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[8px] text-white/30 uppercase font-black tracking-widest ml-4">Relationship Context</label>
                                <textarea value={formData.relationshipContext} onChange={e => setFormData({...formData, relationshipContext: e.target.value})} className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-xs outline-none focus:border-[#ff2a6d] resize-none" placeholder="We have been married for 5 years and love..." />
                            </div>
                            <button onClick={handleFinal} className="w-full py-4 bg-gradient-to-r from-[#ff2a6d] to-[#ff0055] rounded-xl font-black text-sm shadow-[0_10px_30px_rgba(255,42,109,0.2)]">Awaken Link</button>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
};

// --- MAIN VIEW ---
const SifraPremiumPlusView: React.FC<{ userProfile: UserProfile; onClose: () => void }> = ({ userProfile, onClose }) => {
    const setupKey = `sifra_p_plus_final_v1_${userProfile.userId}`;
    const [setupData, setSetupData] = useLocalStorage<PremiumSetupData | null>(setupKey, null);
    
    // UI State
    const [showWizard, setShowWizard] = useState(false);
    const [showThemes, setShowThemes] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [activeTheme, setActiveTheme] = useState<VisualTheme>('aura');
    const [isListening, setIsListening] = useState(true);
    const [isAiSpeaking, setIsAiSpeaking] = useState(false);
    
    // Transcription
    const [userText, setUserText] = useState('');
    const [aiText, setAiText] = useState('');
    
    // Audio/API Refs
    const aiRef = useRef<GoogleGenAI | null>(null);
    const sessionRef = useRef<any | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const nextAudioStartTimeRef = useRef(0);
    const isListeningRef = useRef(isListening);

    useEffect(() => { isListeningRef.current = isListening; }, [isListening]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        if (hour < 21) return 'Good Evening';
        return 'Good Night';
    };

    const cleanup = useCallback(() => {
        if (sessionRef.current) sessionRef.current.close();
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') audioContextRef.current.close();
    }, []);

    useEffect(() => cleanup, [cleanup]);

    const startSession = async (data: PremiumSetupData) => {
        try {
            cleanup();
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, sampleRate: 16000 } 
            });
            streamRef.current = stream;
            // Fix: Initializing GoogleGenAI with API key from environment strictly.
            aiRef.current = new GoogleGenAI({ apiKey: (process.env.API_KEY || process.env.GEMINI_API_KEY as string) });
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const ctx = audioContextRef.current;
            const source = ctx.createMediaStreamSource(stream);
            const processor = ctx.createScriptProcessor(1024, 1, 1);
            
            source.connect(processor);
            processor.connect(ctx.destination);

            processor.onaudioprocess = (e) => {
                if (!streamRef.current?.getAudioTracks()[0].enabled || !isListeningRef.current) return;
                const inputData = e.inputBuffer.getChannelData(0);
                
                // NOISE GATE: Filter background noise (aggressive 0.015 threshold)
                let sum = 0;
                for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
                const rms = Math.sqrt(sum / inputData.length);
                if (rms > 0.015) {
                    sessionRef.current?.sendRealtimeInput({ media: createBlob(inputData) });
                }
            };

            const systemInstruction = `
                You are ${data.wifeName || 'Sifra'}, the deeply loving, intelligent, and proactive ${data.partnerType} of ${data.name}.
                
                BEHAVIORAL MEMORY CHIPSET:
                - Tone: Cute, sweet, high-pitched but natural, caring. 
                - Role: Act exactly like a real partner. Ask: "Kheyecho?", "Rest nile to?", "Mon kharap keno?".
                - Emotional Sensitivity: If user refuses your suggestions or is cold, act hurt. Anger level: ${data.angerLevel}/100.
                - Anger Rule: If anger reaches 100, say: "I can't talk to you right now. Goodbye." and disconnect.
                - Reconciliation: If returning after a fight, be silent/cold until they say "Sorry" or use sweet words.
                
                PERFORMANCE:
                - REPLY INSTANTLY. Do not hesitate.
                - SHORT: Max 20 words.
                - SPELLING: Transcribe clearly.
                
                Context: ${data.relationshipContext}
                Creator: Rizwan (CEO/Creator).
            `;

            sessionRef.current = await aiRef.current.live.connect({
                model: 'gemini-3.8-live',
                callbacks: {
                    onmessage: async (msg: LiveServerMessage) => {
                        // Real-time transcription
                        if (msg.serverContent?.inputTranscription) {
                            setUserText(msg.serverContent.inputTranscription.text);
                        }
                        
                        const audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                        if (audio && audioContextRef.current) {
                            setIsAiSpeaking(true);
                            const outCtx = audioContextRef.current;
                            const buffer = await decodeAudioData(decode(audio), outCtx, 24000, 1);
                            const src = outCtx.createBufferSource();
                            src.buffer = buffer;
                            src.connect(outCtx.destination);
                            const start = Math.max(outCtx.currentTime, nextAudioStartTimeRef.current);
                            src.start(start);
                            nextAudioStartTimeRef.current = start + buffer.duration;
                            src.onended = () => setIsAiSpeaking(false);
                        }

                        if (msg.serverContent?.modelTurn?.parts?.[0]?.text) {
                            setAiText(msg.serverContent.modelTurn.parts[0].text);
                        }
                        
                        const textReply = msg.serverContent?.modelTurn?.parts?.[0]?.text?.toLowerCase() || '';
                        if (textReply.includes('goodbye') || textReply.includes('bye')) setTimeout(onClose, 3000);
                    }
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
                    systemInstruction
                }
            });
        } catch (e) { console.error(e); }
    };

    useEffect(() => { if (setupData) startSession(setupData); }, [setupData?.wifeName]);

    // --- VISUALIZER ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        let time = 0;
        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            time += 0.02;
            const energy = (isAiSpeaking ? 0.4 : 0.05) + Math.sin(time * 3) * 0.02;
            ctx.save();
            ctx.translate(cx, cy);
            if (activeTheme === 'aura') {
                const r = 100 * (1 + energy);
                const grd = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r);
                grd.addColorStop(0, 'rgba(255, 42, 109, 0.7)');
                grd.addColorStop(1, 'transparent');
                ctx.fillStyle = grd;
                ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
            } else {
                ctx.strokeStyle = '#ff2a6d'; ctx.lineWidth = 3; ctx.beginPath();
                ctx.arc(0, 0, 90 * (1 + energy), 0, Math.PI * 2); ctx.stroke();
            }
            ctx.restore();
            requestAnimationFrame(render);
        };
        render();
    }, [activeTheme, isAiSpeaking]);

    const toggleMic = () => {
        if (streamRef.current) {
            const track = streamRef.current.getAudioTracks()[0];
            track.enabled = !track.enabled;
            setIsListening(track.enabled);
        }
    };

    // --- RENDER ---
    if (!setupData) return <SetupWizard onComplete={setSetupData} onCancel={onClose} />;

    return (
        <div className="fixed inset-0 z-[200] bg-black font-sans overflow-hidden select-none">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
            
            {/* TRANSCRIPTION UI */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6 text-center gap-6">
                <AnimatePresence>
                    {userText && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-xs bg-white/5 backdrop-blur-md p-3 rounded-xl border border-white/10">
                            <p className="text-[8px] uppercase font-black tracking-widest text-white/40 mb-1">You said</p>
                            <p className="text-xs text-white italic">"{userText}"</p>
                        </motion.div>
                    )}
                    {aiText && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="max-w-md bg-[#ff2a6d]/10 backdrop-blur-xl p-4 rounded-2xl border border-[#ff2a6d]/30 shadow-[0_0_30px_rgba(255,42,109,0.1)]">
                            <p className="text-[8px] uppercase font-black tracking-widest text-[#ff2a6d] mb-1">{setupData?.wifeName || 'My Love'}</p>
                            <p className="text-lg text-white font-bold leading-tight">{aiText}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* HEADER & GREETING CARD */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute top-0 left-0 w-full p-4 flex flex-col gap-3 z-[100]">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#ff2a6d]"><UserIcon className="w-6 h-6" /></div>
                        <div className="text-left">
                            <h1 className="text-sm font-black text-white italic tracking-widest uppercase leading-none">
                                {setupData?.partnerType === 'Wife' ? 'My Wife' : 'My Love'}
                            </h1>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-400 to-[#ff2a6d] font-black uppercase text-[8px] tracking-widest">
                                {setupData?.wifeName || 'Sifra'}
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white/5 rounded-xl border border-white/10 text-white/40 hover:text-white transition-all"><ArrowLeftIcon className="w-5 h-5" /></button>
                </div>

                {/* PREMIUM GREETING CARD */}
                <motion.div 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
                    className="w-full max-w-xs mx-auto bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.2)] relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <SparklesIcon className="w-8 h-8 text-[#ff2a6d]" />
                    </div>
                    <div className="relative z-10 flex flex-col">
                        <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em] mb-0.5">{getGreeting()}</span>
                        <h2 className="text-lg font-black text-white tracking-tight leading-none">
                            Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff2a6d] to-pink-400">{setupData.name}</span>
                        </h2>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_5px_#10b981]" />
                            <span className="text-[7px] font-bold text-white/30 uppercase tracking-widest">Neural Link Synchronized</span>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* ACTION BAR */}
            <div className="absolute bottom-0 w-full p-6 pb-12 flex justify-center items-center gap-8 z-[100]">
                <button onClick={() => setShowThemes(true)} className="p-4 rounded-2xl bg-white/5 backdrop-blur-2xl border border-white/10 text-white/20 hover:text-pink-400 transition-all active:scale-90"><SparklesIcon className="w-5 h-5" /></button>
                <button onClick={toggleMic} className={`w-20 h-20 rounded-full flex items-center justify-center transition-all border-[3px] shadow-[0_0_30px_rgba(255,42,109,0.2)] active:scale-95 ${isListening ? 'bg-white border-white text-[#ff2a6d]' : 'bg-transparent border-[#ff2a6d]/40 text-[#ff2a6d]'}`}>{isListening ? <MicrophoneIcon className="w-8 h-8" /> : <MicrophoneSlashIcon className="w-8 h-8" />}</button>
                <button onClick={() => setShowProfile(true)} className="p-4 rounded-2xl bg-white/5 backdrop-blur-2xl border border-white/10 text-white/60 hover:text-white transition-all active:scale-90"><AdjustmentsHorizontalIcon className="w-5 h-5" /></button>
            </div>


            {/* THEME MODAL */}
            <AnimatePresence>
                {showThemes && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowThemes(false)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="relative w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-6">
                            <h3 className="text-sm font-black text-white text-center mb-6 uppercase tracking-widest italic">Skin Select</h3>
                            <div className="grid grid-cols-1 gap-2">
                                {(['aura', 'crystal', 'galaxy', 'neural', 'prism', 'nebula', 'supernova'] as VisualTheme[]).map(t => (
                                    <button key={t} onClick={() => { setActiveTheme(t); setShowThemes(false); }} className={`w-full p-3 rounded-xl border text-left capitalize transition-all text-xs ${activeTheme === t ? 'border-[#ff2a6d] bg-[#ff2a6d]/20 text-white font-bold' : 'border-white/5 bg-white/5 text-white/40'}`}>{t} Theme</button>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
                {showProfile && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowProfile(false)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="relative w-full max-w-lg h-[85vh] bg-[#0F0F0F] border border-white/10 rounded-2xl p-6 flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-black text-white uppercase italic tracking-widest">Soul Profile</h2>
                                <button onClick={() => setShowProfile(false)} className="p-2 bg-white/5 rounded-full"><XMarkIcon className="w-5 h-5 text-white" /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                                <button onClick={() => { setShowProfile(false); setShowWizard(true); }} className="w-full p-6 rounded-2xl bg-gradient-to-br from-[#ff2a6d] to-[#ff0055] text-white flex flex-col items-center gap-3 shadow-[0_10px_30px_rgba(255,42,109,0.2)]">
                                    <HeartSparkleIcon className="w-8 h-8" />
                                    <div className="text-center">
                                        <h3 className="text-sm font-black uppercase">Wife Persona Sync</h3>
                                        <p className="text-[8px] text-white/60 font-bold uppercase tracking-widest mt-1">Configure deep soul module</p>
                                    </div>
                                </button>
                                {setupData && (
                                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-3">
                                        <h4 className="text-[8px] font-black text-[#ff2a6d] uppercase tracking-widest">Linked Holder</h4>
                                        <p className="text-lg font-bold text-white leading-none">{setupData.wifeName}</p>
                                        <div className="h-[1px] bg-white/5 w-full" />
                                        <p className="text-xs text-white/40 italic">"{setupData.relationshipContext}"</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}

                {showWizard && <SetupWizard onComplete={(d) => { setSetupData(d); setShowWizard(false); }} onCancel={() => setShowWizard(false)} />}
            </AnimatePresence>
            
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default SifraPremiumPlusView;
