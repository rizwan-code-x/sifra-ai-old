import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Play, 
    Pause, 
    RotateCcw, 
    Copy, 
    Check, 
    Download, 
    Volume2, 
    VolumeX, 
    Sparkles, 
    Radio, 
    Sliders, 
    Mic, 
    Headphones, 
    X, 
    Music, 
    Clock, 
    FileText,
    Languages
} from 'lucide-react';

export interface ScriptSection {
    id: number;
    timecode: string;
    startSeconds: number;
    endSeconds: number;
    actTitle: string;
    sfxDirection: string;
    voiceoverTone: string;
    voiceoverLines: string[];
    bengaliMeaning: string;
}

export const SCRIPT_SECTIONS: ScriptSection[] = [
    {
        id: 1,
        timecode: '[00:00 - 00:08]',
        startSeconds: 0,
        endSeconds: 8,
        actTitle: 'The Hook',
        sfxDirection: 'Low, rumbling sub-bass. A soft, ambient synth pad begins to swell. The sound of digital clutter (beeps, static) fades out quickly into complete silence.',
        voiceoverTone: 'Calm, Confident, Deliberate',
        voiceoverLines: [
            '"In a world full of apps..."',
            '(Brief pause for 1 second)',
            '"...we built something different."'
        ],
        bengaliMeaning: 'অ্যাপে ভরা এই দুনিয়ায়... আমরা এমন কিছু বানিয়েছি যা সম্পূর্ণ আলাদা।'
    },
    {
        id: 2,
        timecode: '[00:08 - 00:20]',
        startSeconds: 8,
        endSeconds: 20,
        actTitle: 'The Reveal',
        sfxDirection: 'A sudden, elegant cinematic "whoosh" leading into a warm, futuristic melodic beat.',
        voiceoverTone: 'Inspiring, Premium, Visionary',
        voiceoverLines: [
            '"Introducing... Sifra."',
            '(Pause)',
            '"Your Personal AI Ecosystem. A smarter way to think... create... organize... and grow."'
        ],
        bengaliMeaning: 'উপস্থাপন করছি... সিফরা। আপনার ব্যক্তিগত এআই ইকোসিস্টেম। চিন্তা করা, তৈরি করা, গুছিয়ে রাখা এবং এগিয়ে যাওয়ার আরও স্মার্ট এক উপায়।'
    },
    {
        id: 3,
        timecode: '[00:20 - 00:35]',
        startSeconds: 20,
        endSeconds: 35,
        actTitle: 'The Power & Ecosystem',
        sfxDirection: 'Music builds up slightly, adding a rhythmic, high-tech pulse. Light digital ticking in the background.',
        voiceoverTone: 'Dynamic, Clear, Sophisticated',
        voiceoverLines: [
            '"Chat with advanced AI. Search faster. Manage your tasks. Access tools, knowledge, history, planning, and productivity... all from one intelligent platform."',
            '(Short pause, change tone to sophisticated)',
            '"Designed with elegance. Powered by intelligence. Built for creators, students, professionals, and visionaries."'
        ],
        bengaliMeaning: 'উন্নত এআই দিয়ে চ্যাট করুন, দ্রুত সার্চ করুন, কাজ ম্যানেজ করুন। এক বুদ্ধিমান প্ল্যাটফর্মে সবকিছু। আভিজাত্যে ডিজাইন করা, বুদ্ধিমত্তায় চালিত।'
    },
    {
        id: 4,
        timecode: '[00:35 - 00:46]',
        startSeconds: 35,
        endSeconds: 46,
        actTitle: 'The Core Features',
        sfxDirection: 'Music reaches its peak maturity—smooth, orchestral strings blending with ambient electronic tones.',
        voiceoverTone: 'Rhythmic, Impactful, Authoritative',
        voiceoverLines: [
            '"From Neural Chat... to Galaxy Voice."',
            '(Micro-pause)',
            '"From Quantum Leaf... to the complete Sifra Core ecosystem."',
            '(Micro-pause)',
            '"Everything works together... seamlessly. One account. One ecosystem. Unlimited possibilities."'
        ],
        bengaliMeaning: 'নিউরাল চ্যাট থেকে গ্যালাক্সি ভয়েস... কোয়ান্টাম লিফ থেকে সিফরা কোর ইকোসিস্টেম। সবকিছু এক সুতোয় গাঁথা। এক অ্যাকাউন্ট, এক ইকোসিস্টেম, সীমাহীন সম্ভাবনা।'
    },
    {
        id: 5,
        timecode: '[00:46 - 00:60]',
        startSeconds: 46,
        endSeconds: 60,
        actTitle: 'The Climax & Outro',
        sfxDirection: 'Music drops out, leaving only a powerful, echoing ambient pad + [Soft Digital Chime] + [Deep Sub-bass Drop] (Visual Logo Reveal Moment).',
        voiceoverTone: 'Deep, Resonant, Whispered, Iconic',
        voiceoverLines: [
            '"This is not just another application. This is your digital operating system."',
            '(Pause)',
            '"This... is Sifra."',
            '— Final Tagline (Deeply Resonant): —',
            '"Think Beyond. Live Smarter."',
            '(Final beat)',
            '"Sifra — One Intelligence. Infinite Possibilities."'
        ],
        bengaliMeaning: 'এটি কেবল আরেকটি অ্যাপ নয়। এটি আপনার ডিজিটাল অপারেটিং সিস্টেম। এটিই... সিফরা। চিন্তা করুন সীমানা ছাড়িয়ে, বাঁচুন আরও বুদ্ধিমত্তার সাথে।'
    }
];

const RAW_FULL_SCRIPT = `AUDIO SCRIPT: SIFRA — The Future of Personal Intelligence
Duration: 45–60 Seconds
Voice Type: Deep, Clean, Premium (Male/Female)
Pace: 0.90x (Deliberate, measured, and luxurious)
Tone: Apple Launch Event meets Futuristic Sci-Fi

[00:00 - 00:08] The Hook
 * [SFX]: Low, rumbling sub-bass. A soft, ambient synth pad begins to swell. The sound of digital clutter (beeps, static) fades out quickly into complete silence.
 * [Voiceover - Calm, Confident]:
> "In a world full of apps..."
> (Brief pause for 1 second)
> "...we built something different."

[00:08 - 00:20] The Reveal
 * [SFX]: A sudden, elegant cinematic "whoosh" leading into a warm, futuristic melodic beat.
 * [Voiceover - Inspiring, Premium]:
> "Introducing... Sifra."
> (Pause)
> "Your Personal AI Ecosystem. A smarter way to think... create... organize... and grow."

[00:20 - 00:35] The Power & Ecosystem
 * [SFX]: Music builds up slightly, adding a rhythmic, high-tech pulse. Light digital ticking in the background.
 * [Voiceover - Dynamic, Clear]:
> "Chat with advanced AI. Search faster. Manage your tasks. Access tools, knowledge, history, planning, and productivity... all from one intelligent platform."
> (Short pause, change tone to sophisticated)
> "Designed with elegance. Powered by intelligence. Built for creators, students, professionals, and visionaries."

[00:35 - 00:46] The Core Features
 * [SFX]: Music reaches its peak maturity—smooth, orchestral strings blending with ambient electronic tones.
 * [Voiceover - Rhythmic, Impactful]:
> "From Neural Chat... to Galaxy Voice."
> (Micro-pause)
> "From Quantum Leaf... to the complete Sifra Core ecosystem."
> (Micro-pause)
> "Everything works together... seamlessly. One account. One ecosystem. Unlimited possibilities."

[00:46 - 00:60] The Climax & Outro
 * [SFX]: Music drops out, leaving only a powerful, echoing ambient pad.
 * [Voiceover - Deep, Authoritative, Memorable]:
> "This is not just another application. This is your digital operating system."
> (Pause)
> "This... is Sifra."

 * [SFX]: [Soft Digital Chime] + [Deep Sub-bass Drop] (Visual Logo Reveal Moment)
 * [Voiceover - Final Tagline, Whispered or Deeply Resonant]:
> "Think Beyond. Live Smarter."
> (Final beat)
> "Sifra — One Intelligence. Infinite Possibilities."

💡 Production Notes for the Sound Engineer:
 * Voice Processing: Use a high-quality condenser mic effect with a warm proximity effect (crisp highs, deep lows) to get that "luxury tech commercial" vibe.
 * Pacing: Ensure the voiceover artist doesn't rush. The magic of this script lies in the silence and pauses between sentences.
 * Mixing: Voiceover 0dB, Ambient BGM -14dB, Sub-bass drop -8dB with master sidechain compression.`;

interface CinematicAudioScriptModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CinematicAudioScriptModal: React.FC<CinematicAudioScriptModalProps> = ({
    isOpen,
    onClose,
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [copied, setCopied] = useState(false);
    const [copiedVoOnly, setCopiedVoOnly] = useState(false);
    const [voiceGender, setVoiceGender] = useState<'male' | 'female'>('male');
    const [bgmEnabled, setBgmEnabled] = useState(true);
    const [showBengali, setShowBengali] = useState(false);
    const [activeSectionId, setActiveSectionId] = useState(1);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const bgmGainRef = useRef<GainNode | null>(null);
    const oscNodesRef = useRef<OscillatorNode[]>([]);

    const totalDuration = 60;

    // Determine active section based on currentTime
    useEffect(() => {
        const found = SCRIPT_SECTIONS.find(
            s => currentTime >= s.startSeconds && currentTime < s.endSeconds
        );
        if (found) {
            setActiveSectionId(found.id);
        } else if (currentTime >= 60) {
            setActiveSectionId(5);
        }
    }, [currentTime]);

    // Synthesize Ambient Sci-Fi Sub-bass Pad via Web Audio API
    const startCinematicBgm = () => {
        if (!bgmEnabled) return;
        try {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = audioCtxRef.current || new AudioCtx();
            audioCtxRef.current = ctx;

            if (ctx.state === 'suspended') {
                ctx.resume();
            }

            // Master BGM gain
            const masterGain = ctx.createGain();
            masterGain.gain.setValueAtTime(0.12, ctx.currentTime);
            masterGain.connect(ctx.destination);
            bgmGainRef.current = masterGain;

            // Low sub-bass drone oscillator (55Hz / 45Hz)
            const subOsc = ctx.createOscillator();
            subOsc.type = 'sine';
            subOsc.frequency.setValueAtTime(55, ctx.currentTime);

            const subFilter = ctx.createBiquadFilter();
            subFilter.type = 'lowpass';
            subFilter.frequency.setValueAtTime(110, ctx.currentTime);

            subOsc.connect(subFilter);
            subFilter.connect(masterGain);
            subOsc.start();

            // Ambient warm synth pad (Harmonic 5th - 165Hz)
            const padOsc = ctx.createOscillator();
            padOsc.type = 'triangle';
            padOsc.frequency.setValueAtTime(164.81, ctx.currentTime); // E3

            const padFilter = ctx.createBiquadFilter();
            padFilter.type = 'lowpass';
            padFilter.frequency.setValueAtTime(320, ctx.currentTime);

            const padGain = ctx.createGain();
            padGain.gain.setValueAtTime(0.04, ctx.currentTime);

            padOsc.connect(padFilter);
            padFilter.connect(padGain);
            padGain.connect(masterGain);
            padOsc.start();

            oscNodesRef.current = [subOsc, padOsc];
        } catch (e) {
            console.warn('Cinematic BGM synth not available:', e);
        }
    };

    const stopCinematicBgm = () => {
        try {
            oscNodesRef.current.forEach(node => {
                try {
                    node.stop();
                    node.disconnect();
                } catch (err) {}
            });
            oscNodesRef.current = [];
            if (bgmGainRef.current) {
                bgmGainRef.current.disconnect();
                bgmGainRef.current = null;
            }
        } catch (e) {}
    };

    // Clean text for TTS
    const getCleanVoiceoverText = (lines: string[]) => {
        return lines
            .join(' ')
            .replace(/[()]/g, '')
            .replace(/—[^—]+—/g, '')
            .replace(/"/g, '')
            .replace(/Brief pause for \d+ second/g, '')
            .replace(/Pause/g, '')
            .replace(/Micro-pause/g, '')
            .replace(/Short pause, change tone to sophisticated/g, '')
            .replace(/Final Tagline/g, '')
            .replace(/Final beat/g, '')
            .trim();
    };

    // Speak a specific section with speech synthesis calibrated at 0.90x pace
    const speakSectionVoiceover = (section: ScriptSection) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();

        const rawText = getCleanVoiceoverText(section.voiceoverLines);
        const utterance = new SpeechSynthesisUtterance(rawText);
        utterance.lang = 'en-US';
        utterance.rate = 0.90; // Luxury deliberate pace
        utterance.pitch = voiceGender === 'male' ? 0.88 : 1.05; // Deep or Elegant

        const voices = window.speechSynthesis.getVoices() || [];
        if (voiceGender === 'male') {
            const maleVoice = voices.find(
                v => (v.name.includes('David') || v.name.includes('Guy') || v.name.includes('Natural') || v.name.includes('Male')) && v.lang.startsWith('en')
            );
            if (maleVoice) utterance.voice = maleVoice;
        } else {
            const femaleVoice = voices.find(
                v => (v.name.includes('Samantha') || v.name.includes('Zira') || v.name.includes('Jenny') || v.name.includes('Natural')) && v.lang.startsWith('en')
            );
            if (femaleVoice) utterance.voice = femaleVoice;
        }

        window.speechSynthesis.speak(utterance);
    };

    // Main Play/Pause Toggle
    const handleTogglePlay = () => {
        if (isPlaying) {
            // Pause
            setIsPlaying(false);
            if (timerRef.current) clearInterval(timerRef.current);
            stopCinematicBgm();
            if (window.speechSynthesis) window.speechSynthesis.cancel();
        } else {
            // Play
            setIsPlaying(true);
            startCinematicBgm();

            // Speak current active section
            const currentSection = SCRIPT_SECTIONS.find(
                s => currentTime >= s.startSeconds && currentTime < s.endSeconds
            ) || SCRIPT_SECTIONS[0];
            speakSectionVoiceover(currentSection);

            timerRef.current = setInterval(() => {
                setCurrentTime(prev => {
                    const next = prev + 1;
                    if (next >= totalDuration) {
                        setIsPlaying(false);
                        stopCinematicBgm();
                        if (timerRef.current) clearInterval(timerRef.current);
                        return totalDuration;
                    }

                    // Check if new section entered, trigger VO
                    const newSection = SCRIPT_SECTIONS.find(s => s.startSeconds === next);
                    if (newSection) {
                        speakSectionVoiceover(newSection);
                    }

                    return next;
                });
            }, 1000);
        }
    };

    const handleReset = () => {
        setIsPlaying(false);
        if (timerRef.current) clearInterval(timerRef.current);
        setCurrentTime(0);
        setActiveSectionId(1);
        stopCinematicBgm();
        if (window.speechSynthesis) window.speechSynthesis.cancel();
    };

    const handleJumpToSection = (section: ScriptSection) => {
        setCurrentTime(section.startSeconds);
        setActiveSectionId(section.id);
        if (isPlaying) {
            speakSectionVoiceover(section);
        }
    };

    // Copy handlers
    const handleCopyFullScript = async () => {
        try {
            await navigator.clipboard.writeText(RAW_FULL_SCRIPT);
            setCopied(true);
            setTimeout(() => setCopied(false), 2200);
        } catch (e) {}
    };

    const handleCopyVoOnly = async () => {
        try {
            const voOnly = SCRIPT_SECTIONS.map(s => 
                `${s.actTitle} (${s.timecode}):\n` + 
                s.voiceoverLines.filter(l => l.startsWith('"')).join('\n')
            ).join('\n\n');
            await navigator.clipboard.writeText(voOnly);
            setCopiedVoOnly(true);
            setTimeout(() => setCopiedVoOnly(false), 2200);
        } catch (e) {}
    };

    const handleDownloadScript = () => {
        const element = document.createElement('a');
        const file = new Blob([RAW_FULL_SCRIPT], { type: 'text/markdown' });
        element.href = URL.createObjectURL(file);
        element.download = 'SIFRA_Cinematic_Audio_Script_45_60s.md';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    // Cleanup on unmount or close
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            stopCinematicBgm();
            if (window.speechSynthesis) window.speechSynthesis.cancel();
        };
    }, []);

    if (!isOpen) return null;

    const formatSec = (sec: number) => {
        const m = Math.floor(sec / 60).toString().padStart(2, '0');
        const s = (sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[350] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 overflow-hidden select-none">
                <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 15 }}
                    className="w-full max-w-4xl max-h-[92vh] bg-[#030712] border border-cyan-500/30 rounded-3xl shadow-[0_0_80px_rgba(6,182,212,0.18)] flex flex-col overflow-hidden text-white font-sans"
                >
                    {/* Top Header Bar */}
                    <header className="px-5 sm:px-8 py-4 border-b border-white/10 bg-white/[0.02] flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[1.5px] shadow-md flex items-center justify-center">
                                <div className="w-full h-full rounded-2xl bg-[#030712] flex items-center justify-center">
                                    <Radio className="w-5 h-5 text-cyan-300 animate-pulse" />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[8px] font-black uppercase tracking-widest border border-cyan-400/30">
                                        Cinematic Audio Script
                                    </span>
                                    <span className="text-[10px] text-white/40 font-mono">45–60 Seconds</span>
                                </div>
                                <h2 className="text-sm sm:text-base font-black tracking-tight text-white mt-0.5">
                                    SIFRA — The Future of Personal Intelligence
                                </h2>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Toggle Bengali translation */}
                            <button
                                onClick={() => setShowBengali(!showBengali)}
                                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                                    showBengali 
                                        ? 'bg-amber-500/20 border-amber-400/50 text-amber-200' 
                                        : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                                }`}
                                title="Toggle Bengali Translation"
                            >
                                <Languages className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">বাংলা অনুবাদ</span>
                            </button>

                            {/* Close Modal */}
                            <button
                                onClick={() => {
                                    handleReset();
                                    onClose();
                                }}
                                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </header>

                    {/* Metadata & Audio Control Stage */}
                    <div className="px-5 sm:px-8 py-4 bg-gradient-to-b from-white/[0.03] to-transparent border-b border-white/10 shrink-0 flex flex-col gap-3">
                        {/* Audio Specs Badges */}
                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-medium text-white/70">
                            <span className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 flex items-center gap-1.5">
                                <Clock className="w-3 h-3 text-cyan-400" />
                                Duration: <strong className="text-white">45–60s</strong>
                            </span>
                            <span className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 flex items-center gap-1.5">
                                <Mic className="w-3 h-3 text-amber-400" />
                                Voice: <strong className="text-white">Deep, Clean, Premium</strong>
                            </span>
                            <span className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 flex items-center gap-1.5">
                                <Sliders className="w-3 h-3 text-emerald-400" />
                                Pace: <strong className="text-white">0.90x Deliberate</strong>
                            </span>
                            <span className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3 text-indigo-400" />
                                Tone: <strong className="text-white">Apple Launch × Sci-Fi</strong>
                            </span>
                        </div>

                        {/* Interactive Playback Scrubber & Action Bar */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#060c1e] border border-cyan-500/20 shadow-inner">
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                {/* Master Play/Pause Button */}
                                <button
                                    onClick={handleTogglePlay}
                                    className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg active:scale-95 transition-all ${
                                        isPlaying 
                                            ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                                            : 'bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.4)]'
                                    }`}
                                >
                                    {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                                    <span>{isPlaying ? 'Pause Audio Preview' : 'Play Cinematic Preview'}</span>
                                </button>

                                {/* Reset Button */}
                                <button
                                    onClick={handleReset}
                                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white transition-all active:scale-95"
                                    title="Reset Timeline"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </button>

                                {/* Time Indicator */}
                                <div className="font-mono text-xs font-black text-cyan-300 ml-1">
                                    {formatSec(currentTime)} <span className="text-white/40">/ 01:00</span>
                                </div>
                            </div>

                            {/* Voiceover Settings & Sound Controls */}
                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                                {/* Voice Actor Gender */}
                                <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10 text-[10px]">
                                    <button
                                        onClick={() => setVoiceGender('male')}
                                        className={`px-2 py-1 rounded-lg transition-all ${
                                            voiceGender === 'male' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-white/50'
                                        }`}
                                    >
                                        Male Keynote
                                    </button>
                                    <button
                                        onClick={() => setVoiceGender('female')}
                                        className={`px-2 py-1 rounded-lg transition-all ${
                                            voiceGender === 'female' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-white/50'
                                        }`}
                                    >
                                        Female Luxury
                                    </button>
                                </div>

                                {/* BGM Synth Toggle */}
                                <button
                                    onClick={() => {
                                        setBgmEnabled(!bgmEnabled);
                                        if (isPlaying && bgmEnabled) stopCinematicBgm();
                                        if (isPlaying && !bgmEnabled) startCinematicBgm();
                                    }}
                                    className={`p-2 rounded-xl border text-xs flex items-center gap-1 transition-all ${
                                        bgmEnabled 
                                            ? 'bg-indigo-500/20 border-indigo-400/40 text-indigo-300' 
                                            : 'bg-white/5 border-white/10 text-white/40'
                                    }`}
                                    title="Cinematic Sub-bass Synth BGM"
                                >
                                    {bgmEnabled ? <Music className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                                    <span className="text-[10px] hidden md:inline">Sci-Fi BGM</span>
                                </button>
                            </div>
                        </div>

                        {/* Visual Progress Bar with Act Markers */}
                        <div className="relative w-full h-2 bg-white/10 rounded-full overflow-hidden cursor-pointer">
                            <div
                                className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-amber-400 rounded-full transition-all duration-300"
                                style={{ width: `${(currentTime / totalDuration) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Scrollable Script Body */}
                    <div className="flex-1 overflow-y-auto premium-scroll p-5 sm:p-8 flex flex-col gap-6">
                        {SCRIPT_SECTIONS.map((section) => {
                            const isActive = activeSectionId === section.id;

                            return (
                                <motion.div
                                    key={section.id}
                                    onClick={() => handleJumpToSection(section)}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`p-5 sm:p-6 rounded-3xl border transition-all cursor-pointer relative overflow-hidden group ${
                                        isActive
                                            ? 'bg-[#0a1329] border-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/40'
                                            : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
                                    }`}
                                >
                                    {/* Active Pulse Pill */}
                                    {isActive && (
                                        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-400/20 border border-cyan-400/40 text-[9px] font-black uppercase tracking-wider text-cyan-300">
                                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                                            <span>Active Teleprompter</span>
                                        </div>
                                    )}

                                    {/* Section Heading & Timecode */}
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="font-mono text-xs font-black px-2.5 py-1 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-300">
                                            {section.timecode}
                                        </span>
                                        <h3 className="text-base font-black text-white tracking-tight">
                                            Act {section.id}: {section.actTitle}
                                        </h3>
                                        <span className="text-[10px] text-white/40 italic hidden sm:inline">
                                            Tone: {section.voiceoverTone}
                                        </span>
                                    </div>

                                    {/* SFX Direction Cue */}
                                    <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200/90 flex items-start gap-2.5 mb-4">
                                        <Headphones className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                                        <div>
                                            <strong className="text-[10px] font-black uppercase tracking-wider text-indigo-300 block mb-0.5">
                                                [SFX / BGM Direction]:
                                            </strong>
                                            <p className="leading-relaxed">{section.sfxDirection}</p>
                                        </div>
                                    </div>

                                    {/* Voiceover Dialogue Lines */}
                                    <div className="pl-3 border-l-2 border-cyan-400/50 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Mic className="w-3.5 h-3.5 text-cyan-400" />
                                            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300">
                                                [Voiceover - {section.voiceoverTone}]:
                                            </span>
                                        </div>

                                        {section.voiceoverLines.map((line, lIdx) => (
                                            <p
                                                key={lIdx}
                                                className={`text-sm sm:text-base leading-relaxed ${
                                                    line.startsWith('"')
                                                        ? 'font-bold text-white tracking-tight'
                                                        : 'text-xs text-amber-300/80 italic font-medium'
                                                }`}
                                            >
                                                {line}
                                            </p>
                                        ))}

                                        {/* Optional Bengali Translation */}
                                        {showBengali && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="mt-3 pt-3 border-t border-white/10 text-xs text-amber-200/90 leading-relaxed font-normal"
                                            >
                                                <strong className="text-[9px] font-bold text-amber-400 uppercase tracking-widest block mb-1">
                                                    বাংলা ভাবার্থ:
                                                </strong>
                                                <p>{section.bengaliMeaning}</p>
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}

                        {/* Sound Engineer Production Notes Card */}
                        <div className="p-5 sm:p-6 rounded-3xl bg-amber-500/[0.04] border border-amber-500/30 flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <Sliders className="w-4 h-4 text-amber-400" />
                                <h4 className="text-xs font-black uppercase tracking-widest text-amber-300">
                                    💡 Production Notes for the Sound Engineer & Voice Artist
                                </h4>
                            </div>
                            <ul className="text-xs text-white/70 space-y-2 leading-relaxed">
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-400 font-bold">•</span>
                                    <span>
                                        <strong className="text-white">Voice Processing:</strong> Use a high-quality condenser mic effect with a warm proximity effect (crisp highs, deep lows) to get that "luxury tech commercial" vibe.
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-400 font-bold">•</span>
                                    <span>
                                        <strong className="text-white">Pacing:</strong> Ensure the voiceover artist doesn't rush. The magic of this script lies in the deliberate 0.90x pace, breath management, and pauses between sentences.
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-400 font-bold">•</span>
                                    <span>
                                        <strong className="text-white">Acoustic Balance:</strong> Voiceover at 0dB, Ambient BGM pad at -14dB, and sub-bass impact hit at -8dB with subtle sidechain ducking.
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <footer className="px-5 sm:px-8 py-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between shrink-0 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                            {/* Copy Full Script */}
                            <button
                                onClick={handleCopyFullScript}
                                className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold flex items-center gap-2 active:scale-95 transition-all text-white/90"
                            >
                                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-300" />}
                                <span>{copied ? 'Copied Entire Script!' : 'Copy Full Script'}</span>
                            </button>

                            {/* Copy VO Only */}
                            <button
                                onClick={handleCopyVoOnly}
                                className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold flex items-center gap-2 active:scale-95 transition-all text-white/70 hover:text-white"
                            >
                                {copiedVoOnly ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Mic className="w-3.5 h-3.5 text-amber-400" />}
                                <span>{copiedVoOnly ? 'Copied VO Lines!' : 'Copy VO Only'}</span>
                            </button>

                            {/* Download Markdown file */}
                            <button
                                onClick={handleDownloadScript}
                                className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold flex items-center gap-2 active:scale-95 transition-all text-white/70 hover:text-white"
                            >
                                <Download className="w-3.5 h-3.5 text-indigo-400" />
                                <span>Download (.md)</span>
                            </button>
                        </div>

                        <div className="text-[10px] text-white/40 font-mono">
                            SIFRA Core Production Assets © 2026
                        </div>
                    </footer>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CinematicAudioScriptModal;
