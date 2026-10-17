
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UserProfile, ProSettings, ProModeId } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { encode, decode, decodeAudioData } from '../utils/audioUtils';

// Icons
import XMarkIcon from '../components/icons/XMarkIcon';
import MicrophoneIcon from '../components/icons/MicrophoneIcon';
import MicrophoneSlashIcon from '../components/icons/MicrophoneSlashIcon';
import UserIcon from '../components/icons/UserIcon';
import BoltIcon from '../components/icons/BoltIcon';
import CheckCircleIcon from '../components/icons/CheckCircleIcon';
import SpeakerWaveIcon from '../components/icons/SpeakerWaveIcon';
import SparklesIcon from '../components/icons/SparklesIcon';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import BookmarkSquareIcon from '../components/icons/BookmarkSquareIcon';
import PlusCircleIcon from '../components/icons/PlusCircleIcon';
import SifraLogo from '../components/SifraLogo';

if (!(process.env.API_KEY || process.env.GEMINI_API_KEY as string)) {
    throw new Error("API_KEY environment variable is not set");
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

const PRO_MODES = [
    { id: 'male.sir', name: 'Professional Sir', type: 'Male', desc: 'Respectful, Formal, Neutral', color: 'bg-blue-500' },
    { id: 'male.buddy', name: 'Best Friend', type: 'Male', desc: 'Casual, Friendly, Brotherly', color: 'bg-teal-500' },
    { id: 'male.street', name: 'Street Smart', type: 'Male', desc: 'Safe Street Style, Bold', color: 'bg-indigo-500' },
    { id: 'female.maam', name: 'Professional Mam', type: 'Female', desc: 'Polite, Caring, Formal', color: 'bg-pink-500' },
    { id: 'female.bestie', name: 'Soft Bestie', type: 'Female', desc: 'Sweet, Supportive, Close', color: 'bg-rose-400' },
    { id: 'female.street', name: 'Bold Street', type: 'Female', desc: 'Playful, Energetic, Sharp', color: 'bg-purple-500' }
];

const ProSplash: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    useEffect(() => { setTimeout(onComplete, 2500); }, [onComplete]);

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0D0D16] overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#2B0A3D] via-[#0D0D16] to-black opacity-80" />
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.2, ease: "backOut" }} className="relative z-10">
                <SifraLogo size="xl" showText={true} />
                <div className="mt-4 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-center">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">PRO-ASSESSMENT MODE ACTIVE</span>
                </div>
            </motion.div>
        </div>
    );
};

const ProTalkSession: React.FC<{ userProfile: UserProfile, settings: ProSettings, onClose: () => void }> = ({ userProfile, settings, onClose }) => {
    const [status, setStatus] = useState('Initializing Secure Channel...');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isMicOn, setIsMicOn] = useState(true);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sessionRef = useRef<any | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const outputContextRef = useRef<AudioContext | null>(null);
    const activeMode = PRO_MODES.find(m => m.id === settings.activeModeId) || PRO_MODES[0];

    useEffect(() => {
        let mounted = true;
        const start = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                if (!mounted) { stream.getTracks().forEach(t => t.stop()); return; }
                streamRef.current = stream;
                // Fix: Initializing GoogleGenAI with API key from environment strictly.
                const ai = new GoogleGenAI({ apiKey: (process.env.API_KEY || process.env.GEMINI_API_KEY as string) });
                const session = await ai.live.connect({
                    model: 'gemini-3.8-live',
                    callbacks: {
                        onopen: () => setStatus('PROMODE Active'),
                        onmessage: (msg: LiveServerMessage) => {
                            const audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                            if (audio) {
                                setIsSpeaking(true);
                                if (!outputContextRef.current) outputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                                const outCtx = outputContextRef.current;
                                decodeAudioData(decode(audio), outCtx, 24000, 1).then(buffer => {
                                    const src = outCtx.createBufferSource(); src.buffer = buffer; src.connect(outCtx.destination); src.start();
                                    src.onended = () => setIsSpeaking(false);
                                });
                            }
                        },
                        onclose: () => onClose()
                    },
                    config: {
                        responseModalities: [Modality.AUDIO],
                        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
                        systemInstruction: `You are SIFRA PRO. Mode: ${activeMode.name}. Be respectful and precise.`
                    }
                });
                sessionRef.current = session;
            } catch (e) { setStatus('Connection Error'); }
        };
        start();
        return () => { mounted = false; streamRef.current?.getTracks().forEach(t => t.stop()); sessionRef.current?.close(); };
    }, []);

    return (
        <div className="fixed inset-0 z-[100] bg-[#0D0D16] flex flex-col items-center justify-center">
            <SifraLogo size="md" showText={false} className="mb-10" />
            <h2 className="text-3xl font-black text-white tracking-widest uppercase italic">{isSpeaking ? 'Sifra Speaking' : 'Listening...'}</h2>
            <p className="text-blue-400 text-xs font-bold uppercase mt-2 tracking-widest">{status}</p>
            <button onClick={onClose} className="mt-20 p-6 bg-red-500/20 rounded-full border border-red-500/50 text-white"><XMarkIcon /></button>
        </div>
    );
};

const SifraProView: React.FC<{ userProfile: UserProfile, onUpdateProfile: (p: UserProfile) => void, onClose: () => void }> = ({ userProfile, onUpdateProfile, onClose }) => {
    const [view, setView] = useState<'splash' | 'dashboard'>('splash');
    const [showTalk, setShowTalk] = useState(false);
    const settings = userProfile.sifraProSettings;

    if (view === 'splash') return <ProSplash onComplete={() => setView('dashboard')} />;

    return (
        <div className="fixed inset-0 z-40 bg-[#0D0D16] text-white overflow-hidden flex flex-col">
            <header className="h-14 flex items-center justify-between px-4 border-b border-white/5 bg-[#0D0D16]/80 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <SifraLogo size="xs" showText={false} />
                    <h1 className="text-sm font-black tracking-tighter italic uppercase">Sifra Pro</h1>
                </div>
                <button onClick={onClose} className="p-1.5 bg-white/5 rounded-lg"><ArrowLeftIcon className="w-4 h-4" /></button>
            </header>

            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <button 
                    onClick={() => setShowTalk(true)}
                    className="w-40 h-40 rounded-full bg-gradient-to-b from-[#2B0A3D] to-black border-2 border-[#B45CFF] shadow-[0_0_40px_rgba(180,92,255,0.2)] flex flex-col items-center justify-center group hover:scale-105 transition-transform"
                >
                    <MicrophoneIcon className="w-8 h-8 text-white mb-1.5 group-hover:text-[#3BB7FF]" />
                    <span className="text-[10px] font-black tracking-widest text-[#B45CFF] group-hover:text-white uppercase">Initialize Talk</span>
                </button>
            </div>

            <AnimatePresence>{showTalk && <ProTalkSession userProfile={userProfile} settings={settings!} onClose={() => setShowTalk(false)} />}</AnimatePresence>
        </div>
    );
};

export default SifraProView;
