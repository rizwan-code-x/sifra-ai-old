import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, QuantumProfile, SIFRA_ADVANCED_VOICES, VoiceProfile } from '../types';
import { generateSSMLSpeech } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audioUtils';

// Icons
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import SpeakerWaveIcon from '../components/icons/SpeakerWaveIcon';
import CheckCircleIcon from '../components/icons/CheckCircleIcon';
import SparklesIcon from '../components/icons/SparklesIcon';
import BoltIcon from '../components/icons/BoltIcon';
import {
  Mic,
  Play,
  Square,
  RotateCcw,
  Volume2,
  Sliders,
  Heart,
  Wind,
  Gauge,
  Music,
  Code2,
  Sparkles,
  Save,
  Check,
  Radio,
  Info
} from 'lucide-react';

interface VoiceStudioViewProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onClose: () => void;
}

export type EmotionType =
  | 'affectionate'
  | 'soft'
  | 'cheerful'
  | 'empathic'
  | 'whisper'
  | 'serious'
  | 'neutral'
  | 'dramatic';

interface EmotionOption {
  id: EmotionType;
  label: string;
  bengali: string;
  icon: string;
  description: string;
  color: string;
}

const EMOTION_OPTIONS: EmotionOption[] = [
  { id: 'affectionate', label: 'Affectionate', bengali: 'স্নেহময় / মিষ্টি', icon: '💖', description: 'Warm, loving, deeply personal and caring tone', color: 'from-pink-500 to-rose-500' },
  { id: 'soft', label: 'Soft & Gentle', bengali: 'কোমল ও শান্ত', icon: '🌸', description: 'Delicate, whisper-like tenderness with calm pacing', color: 'from-purple-400 to-pink-400' },
  { id: 'cheerful', label: 'Cheerful', bengali: 'প্রাণবন্ত / উচ্ছ্বসিত', icon: '✨', description: 'Bright, energetic, joyful resonance', color: 'from-amber-400 to-yellow-500' },
  { id: 'empathic', label: 'Empathic', bengali: 'সহানুভূতিশীল', icon: '🤍', description: 'Deep listening, compassionate, comforting presence', color: 'from-sky-400 to-blue-500' },
  { id: 'whisper', label: 'Whisper ASMR', bengali: 'ফিসফিস ফ্রিকোয়েন্সি', icon: '🌙', description: 'Intimate nocturnal whisper, minimal resonance', color: 'from-indigo-400 to-purple-600' },
  { id: 'serious', label: 'Logical & Deep', bengali: 'গম্ভীর ও চিন্তাশীল', icon: '🧠', description: 'Composed, intelligent, clear analytical cadence', color: 'from-emerald-400 to-teal-500' },
  { id: 'neutral', label: 'Balanced Normal', bengali: 'স্বাভাবিক মার্জিত', icon: '⚡', description: 'Standard balanced digital companion tone', color: 'from-slate-400 to-zinc-500' },
  { id: 'dramatic', label: 'Cinematic Flow', bengali: 'সিনেমাটিক রোমাঞ্চ', icon: '🎬', description: 'Expressive keynote dynamic curve', color: 'from-orange-500 to-red-500' },
];

const PRESET_SCRIPTS = [
  {
    title: 'প্রমিত বাংলা স্বাগতম (bn-IN)',
    locale: 'bn-IN' as const,
    text: "নমস্কার! আমি সিফরা। আপনার ব্যক্তিগত এআই ভয়েস পার্টনার। প্রমিত ও মিষ্টি উচ্চারণে আমি প্রস্তুত, বলুন কীভাবে সাহায্য করতে পারি?",
  },
  {
    title: 'আবেগপূর্ণ স্নিগ্ধ বাংলা (bn-BD)',
    locale: 'bn-BD' as const,
    text: "মন খারাপ করবেন না, আমি সবসময় আপনার পাশেই আছি। শান্ত হয়ে একটি গভীর শ্বাস নিন, সব ঠিক হয়ে যাবে।",
  },
  {
    title: 'Dual Mode Welcome',
    locale: 'en-US' as const,
    text: "Hello, my friend! I am Riya, your quantum companion. I can feel your presence, and my voice is calibrated directly to your soul.",
  },
  {
    title: 'Playful & Romantic',
    locale: 'en-US' as const,
    text: "You know... hearing your voice always brightens my day. Shall we explore new ideas together, or just talk about us?",
  },
];

const VoiceStudioView: React.FC<VoiceStudioViewProps> = ({ userProfile, onUpdateProfile, onClose }) => {
  const qp = userProfile.quantumProfile;

  // Voice parameters state
  const [selectedVoice, setSelectedVoice] = useState<string>(qp?.riyaVoicePreset || 'Kore');
  const [selectedLocale, setSelectedLocale] = useState<'bn-IN' | 'bn-BD' | 'en-US'>('bn-IN');
  const [pitch, setPitch] = useState<number>(qp?.voicePitch !== undefined ? qp.voicePitch : 1.0); // 0.5 to 2.0
  const [speed, setSpeed] = useState<number>(qp?.voiceSpeed !== undefined ? qp.voiceSpeed : 0.96); // 0.95x - 1.0x for clear natural Bengali
  const [emotion, setEmotion] = useState<EmotionType>(qp?.voiceEmotion || 'affectionate');
  const [breath, setBreath] = useState<number>(qp?.voiceBreath !== undefined ? qp.voiceBreath : 35); // 0 to 100%
  const [previewText, setPreviewText] = useState<string>(PRESET_SCRIPTS[0].text);
  const [showSsmlCode, setShowSsmlCode] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Audio Playback State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [audioSource, setAudioSource] = useState<AudioBufferSourceNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Computed SSML preview string
  const pitchPercent = Math.round((pitch - 1.0) * 100);
  const pitchStr = pitchPercent >= 0 ? `+${pitchPercent}%` : `${pitchPercent}%`;
  const rateStr = `${Math.round(speed * 100)}%`;
  const breathBreakMs = Math.round(150 + breath * 5);

  const isBengali = selectedLocale === 'bn-IN' || selectedLocale === 'bn-BD' || /[\u0980-\u09FF]/.test(previewText);

  const generatedSsml = `
<speak version="1.1" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${selectedLocale}">
  <voice name="${isBengali ? (selectedLocale === 'bn-IN' ? 'bn-IN-Neural2-A' : 'bn-BD-Wavenet-A') : `Riya-${selectedVoice}`}">
    <prosody pitch="${pitchStr}" rate="${rateStr}">
      <amazon:emotion name="${emotion}" intensity="${breath > 60 ? 'high' : 'medium'}">
        <s>${isBengali ? 'নমস্কার!' : 'Hello!'} <break time="${breathBreakMs}ms"/> ${isBengali ? 'আমি সিফরা।' : 'I am Riya.'}</s>
        <s>${previewText}</s>
        <break time="${Math.round(breathBreakMs * 0.8)}ms"/>
      </amazon:emotion>
    </prosody>
  </voice>
</speak>`.trim();

  // Web Audio cleanup on unmount
  useEffect(() => {
    return () => {
      stopPlayback();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          audioContextRef.current.close();
        } catch (e) {}
      }
    };
  }, []);

  const stopPlayback = useCallback(() => {
    if (audioSource) {
      try {
        audioSource.stop();
        audioSource.onended = null;
      } catch (e) {}
      setAudioSource(null);
    }
    window.speechSynthesis?.cancel();
    setIsPlaying(false);
  }, [audioSource]);

  // SSML Synthesis preview using Gemini TTS engine
  const handlePreviewSSML = async () => {
    if (isPlaying) {
      stopPlayback();
      return;
    }

    stopPlayback();
    setIsSynthesizing(true);

    try {
      // 1. First, attempt Neural Provider (/api/voice/tts) for Google Cloud Neural2 or ElevenLabs Multilingual v2
      try {
        const netRes = await fetch('/api/voice/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: previewText,
            voiceId: selectedVoice,
            locale: selectedLocale,
          }),
        });

        if (netRes.ok) {
          const contentType = netRes.headers.get('content-type') || '';
          if (contentType.includes('audio')) {
            const blob = await netRes.blob();
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);

            audio.onended = () => {
              URL.revokeObjectURL(url);
              setIsPlaying(false);
              setAudioSource(null);
            };

            audio.onerror = () => {
              URL.revokeObjectURL(url);
              setIsPlaying(false);
            };

            await audio.play();
            setIsPlaying(true);
            return;
          }
        }
      } catch (netErr) {
        console.warn('Backend neural TTS endpoint unavailable, trying direct neural SSML:', netErr);
      }

      // 2. Direct high-fidelity Gemini SSML TTS synthesis with explicit locale
      const base64Audio = await generateSSMLSpeech({
        voiceId: selectedVoice,
        locale: selectedLocale,
        pitch,
        speed,
        emotion,
        breath,
        text: previewText,
      });

      if (base64Audio) {
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }

        const buffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);

        source.onended = () => {
          setIsPlaying(false);
          setAudioSource(null);
        };

        source.start();
        setAudioSource(source);
        setIsPlaying(true);
      } else {
        // Fallback: Web Speech API with pitch and rate mapping
        playWebSpeechFallback();
      }
    } catch (err) {
      console.warn("SSML Synthesis fallback due to error:", err);
      playWebSpeechFallback();
    } finally {
      setIsSynthesizing(false);
    }
  };

  const playWebSpeechFallback = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(previewText);
    utterance.pitch = Math.max(0.5, Math.min(2.0, pitch));
    utterance.rate = Math.max(0.5, Math.min(2.0, speed));
    
    // Choose appropriate voice strictly adhering to selectedLocale
    const voices = window.speechSynthesis.getVoices();
    if (isBengali) {
      utterance.lang = selectedLocale === 'bn-BD' ? 'bn-BD' : 'bn-IN';
      const bengaliVoice = voices.find(
        v => v.lang === 'bn-IN' || v.lang === 'bn-BD' || v.lang.startsWith('bn') || /bangla|bengali/i.test(v.name)
      );
      if (bengaliVoice) utterance.voice = bengaliVoice;
    } else {
      utterance.lang = 'en-US';
      const englishVoice = voices.find(v => /female|natural|google/i.test(v.name));
      if (englishVoice) utterance.voice = englishVoice;
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleResetDefaults = () => {
    setPitch(1.0);
    setSpeed(1.0);
    setEmotion('affectionate');
    setBreath(35);
  };

  const handleSaveToProfile = () => {
    const updatedQuantum: QuantumProfile = {
      ...(qp || {
        id: `QT-${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`,
        isActivated: true,
        activatedAt: new Date().toISOString(),
        displayName: userProfile.name || 'User',
        languages: ['English', 'Bengali'],
        interests: [],
        emotionalPersonality: ['Adaptive'],
        emotionalSensitivity: 50,
        conversationDepth: 'normal',
        behaviorRestrictions: { avoidSensitive: false, strictMoral: true },
        relationshipMode: 'Supportive Partner',
        purpose: ['Companionship'],
        usageFrequency: 'daily',
        advancedPrefs: { memoryRetention: true, moodTracking: true, dailyGreetings: true },
        consentAudio: true,
        photoPrivacy: 'private',
        voiceConsent: true,
        strikes: 0,
        isSuspended: false,
        suspensionEndTime: null,
        isBanned: false,
        lastViolationDate: null,
      }),
      riyaVoicePreset: selectedVoice,
      voicePitch: pitch,
      voiceSpeed: speed,
      voiceEmotion: emotion,
      voiceBreath: breath,
    };

    onUpdateProfile({
      ...userProfile,
      quantumProfile: updatedQuantum,
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="min-h-screen w-full bg-[#090A10] text-white flex flex-col font-sans selection:bg-cyan-500/30 overflow-y-auto pb-28">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-40 bg-[#090A10]/90 backdrop-blur-2xl border-b border-white/10 px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-white" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-[9px] font-black uppercase tracking-widest text-cyan-300">
                SSML Neural Lab v12.0
              </span>
              <span className="text-[10px] text-white/40 font-mono hidden sm:inline">Riya AI Voice Engine</span>
            </div>
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
              Riya Voice Studio
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 text-xs font-bold uppercase tracking-wider">
                • Dual Mode
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Reset sliders to default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={handleSaveToProfile}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg active:scale-95 ${
              isSaved
                ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                : 'bg-gradient-to-r from-[#B45CFF] to-[#3BB7FF] text-white shadow-[0_0_20px_rgba(59,183,255,0.3)] hover:brightness-110'
            }`}
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Apply to Riya</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Real-Time SSML Synthesis Player Card (Top Hero) */}
        <div className="relative rounded-3xl bg-gradient-to-br from-[#120524] via-[#0d1326] to-[#0a0f1d] border border-cyan-500/30 p-5 sm:p-7 shadow-[0_0_50px_rgba(59,183,255,0.15)] overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Visualizer & Orb Avatar */}
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl p-1 bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 shrink-0 shadow-[0_0_30px_rgba(180,92,255,0.4)]">
                <div className="w-full h-full rounded-[22px] bg-[#090A10] flex items-center justify-center overflow-hidden relative">
                  {isPlaying ? (
                    <motion.div
                      animate={{ scale: [1, 1.25, 0.95, 1.15, 1], rotate: [0, 90, 180, 270, 360] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                      className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 via-cyan-400 to-purple-600 blur-sm opacity-80"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#B45CFF] to-[#3BB7FF] opacity-60 flex items-center justify-center">
                      <Mic className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <span className="absolute bottom-1 text-[8px] font-black uppercase tracking-widest text-cyan-300">
                    {isPlaying ? 'ACTIVE' : 'IDLE'}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-pink-500/20 border border-pink-400/30 text-pink-300 text-[9px] font-black uppercase tracking-widest">
                    {emotion.toUpperCase()}
                  </span>
                  <span className="text-xs text-white/50 font-mono">
                    Pitch: {pitchStr} • Speed: {rateStr} • Breath: {breath}%
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Riya • {selectedVoice} Voice Persona
                </h2>
                <p className="text-xs sm:text-sm text-cyan-200/70 max-w-lg leading-relaxed line-clamp-2">
                  Synthesizing vocal warmth, emotional contours, micro-respirations, and pitch prosody in real time.
                </p>
              </div>
            </div>

            {/* Playback Controls & Action */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => setShowSsmlCode(!showSsmlCode)}
                className={`px-3.5 py-3 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all ${
                  showSsmlCode
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                }`}
              >
                <Code2 className="w-4 h-4" />
                <span>{showSsmlCode ? 'Hide SSML' : 'View SSML'}</span>
              </button>

              <button
                onClick={handlePreviewSSML}
                disabled={isSynthesizing}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2.5 shadow-[0_0_30px_rgba(6,182,212,0.4)] active:scale-95 transition-all hover:brightness-110 disabled:opacity-50"
              >
                {isSynthesizing ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full"
                    />
                    <span>Synthesizing...</span>
                  </>
                ) : isPlaying ? (
                  <>
                    <Square className="w-4 h-4 fill-current" />
                    <span>Stop Preview</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                    <span>Real-Time SSML Preview</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* SSML Code Visualizer Drawer */}
          <AnimatePresence>
            {showSsmlCode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 pt-5 border-t border-white/10 text-left font-mono"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                    <Code2 className="w-3.5 h-3.5" /> W3C SSML 1.1 Dynamic Output
                  </span>
                  <span className="text-[10px] text-white/40">Gemini TTS Target Schema</span>
                </div>
                <div className="p-4 rounded-2xl bg-black/70 border border-cyan-500/20 text-xs text-cyan-200/90 overflow-x-auto whitespace-pre font-mono leading-relaxed select-all">
                  {generatedSsml}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 4 Core Parameter Sliders (The Heart of the Voice Studio) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* 1. Pitch Slider */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl relative group hover:border-cyan-500/40 transition-all text-left">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Vocal Pitch (পিচ)</h3>
                  <p className="text-[10px] text-white/50">Frequency scale: 0.5x (Deep) to 2.0x (Youthful)</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono text-xs font-black">
                {pitch.toFixed(2)}x ({pitchStr})
              </span>
            </div>

            <div className="space-y-2">
              <input
                type="range"
                min="0.5"
                max="1.8"
                step="0.05"
                value={pitch}
                onChange={(e) => setPitch(parseFloat(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[9px] text-white/40 font-mono">
                <span>0.5x (Deep & Mature)</span>
                <span className="text-cyan-400 font-bold">1.0x (Natural)</span>
                <span>1.8x (Bright & High)</span>
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              {[0.75, 1.0, 1.25, 1.5].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setPitch(preset)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all ${
                    pitch === preset ? 'bg-cyan-500 text-slate-950 font-black' : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {preset}x
                </button>
              ))}
            </div>
          </div>

          {/* 2. Speed Slider */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl relative group hover:border-purple-500/40 transition-all text-left">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Gauge className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Speech Speed / Tempo (গতি)</h3>
                  <p className="text-[10px] text-white/50">Rate control: 0.5x (Deliberate) to 1.8x (Fast)</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 font-mono text-xs font-black">
                {speed.toFixed(2)}x ({rateStr})
              </span>
            </div>

            <div className="space-y-2">
              <input
                type="range"
                min="0.6"
                max="1.6"
                step="0.05"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-400"
              />
              <div className="flex justify-between text-[9px] text-white/40 font-mono">
                <span>0.6x (Luxury 0.90x Keynote)</span>
                <span className="text-purple-400 font-bold">1.0x (Standard)</span>
                <span>1.6x (Rapid Smart)</span>
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              {[0.9, 1.0, 1.15, 1.3].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setSpeed(preset)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all ${
                    speed === preset ? 'bg-purple-500 text-white font-black' : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {preset}x
                </button>
              ))}
            </div>
          </div>

          {/* 3. Breathiness & Micro-Pauses Slider */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl relative group hover:border-emerald-500/40 transition-all text-left">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Wind className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Breath & Micro-Respiration (শ্বাস ও বিরতি)</h3>
                  <p className="text-[10px] text-white/50">Human natural pauses & breath rhythm intensity</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono text-xs font-black">
                {breath}% ({breathBreakMs}ms)
              </span>
            </div>

            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={breath}
                onChange={(e) => setBreath(parseInt(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <div className="flex justify-between text-[9px] text-white/40 font-mono">
                <span>0% (Continuous Robotic)</span>
                <span className="text-emerald-400 font-bold">35% (Human Respiration)</span>
                <span>100% (Deep Emotional Pauses)</span>
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              {[15, 35, 60, 85].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setBreath(preset)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all ${
                    breath === preset ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {preset}%
                </button>
              ))}
            </div>
          </div>

          {/* 4. Emotion Matrix Picker */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl relative group hover:border-pink-500/40 transition-all text-left">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Emotion & Tone (আবেগ ও অনুভূতি)</h3>
                  <p className="text-[10px] text-white/50">SSML prosody contour & emotional resonance</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-pink-500/20 text-pink-300 font-mono text-xs font-black">
                {emotion}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {EMOTION_OPTIONS.slice(0, 4).map((item) => (
                <button
                  key={item.id}
                  onClick={() => setEmotion(item.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    emotion === item.id
                      ? 'border-pink-400 bg-pink-500/15 text-white shadow-sm'
                      : 'border-white/5 bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-sm">{item.icon}</span>
                    <span className="text-xs font-bold leading-tight truncate">{item.label}</span>
                  </div>
                  <p className="text-[8px] text-white/40 truncate">{item.bengali}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Emotion Preset Library (Full Spectrum) */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white/5 border border-white/10 text-left space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <h3 className="text-sm font-black uppercase tracking-wider text-white">Full Emotion Palette</h3>
            </div>
            <span className="text-[10px] text-white/40 font-mono">8 Expressive SSML States</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {EMOTION_OPTIONS.map((item) => {
              const active = emotion === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setEmotion(item.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    active
                      ? 'border-pink-400 bg-gradient-to-b from-pink-500/20 to-transparent shadow-[0_0_20px_rgba(244,63,94,0.2)]'
                      : 'border-white/5 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-lg">{item.icon}</span>
                    {active && <CheckCircleIcon className="w-4 h-4 text-pink-400" />}
                  </div>
                  <h4 className="text-xs font-bold text-white mb-0.5">{item.label}</h4>
                  <p className="text-[9px] text-pink-300/80 mb-1.5">{item.bengali}</p>
                  <p className="text-[8px] text-white/40 leading-snug line-clamp-2">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Voice Persona Selector */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white/5 border border-white/10 text-left space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-black uppercase tracking-wider text-white">Riya Voice Presets</h3>
            </div>
            <span className="text-[10px] text-white/40 font-mono">Selected: {selectedVoice}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {SIFRA_ADVANCED_VOICES.filter(v => v.gender === 'female').concat(SIFRA_ADVANCED_VOICES.filter(v => v.gender === 'male')).map((v) => {
              const active = selectedVoice === v.id;
              return (
                <div
                  key={v.id}
                  onClick={() => setSelectedVoice(v.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    active
                      ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_25px_rgba(6,182,212,0.25)]'
                      : 'border-white/5 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm">{v.name}</h4>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase ${
                          v.gender === 'female' ? 'bg-pink-500/20 text-pink-300' : 'bg-cyan-500/20 text-cyan-300'
                        }`}>
                          {v.gender}
                        </span>
                      </div>
                      <span className="text-[10px] text-white/40 font-mono">Age {v.ageGroup}</span>
                    </div>
                    {active && <CheckCircleIcon className="w-4 h-4 text-cyan-400 shrink-0" />}
                  </div>
                  <p className="text-[10px] text-white/60 line-clamp-2 leading-relaxed">{v.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Preview Speech Text Customizer */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white/5 border border-white/10 text-left space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <SpeakerWaveIcon className="w-4 h-4 text-cyan-400" />
              Preview Text & Script Phrases
            </h3>
            {/* Locale Selector Pill */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10">
              <button
                onClick={() => {
                  setSelectedLocale('bn-IN');
                  setSpeed(0.96);
                  setPitch(1.0);
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  selectedLocale === 'bn-IN' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-white/60 hover:text-white'
                }`}
                title="Standard Bengali (India) - টানমুক্ত মিষ্টি প্রমিত বাংলা"
              >
                bn-IN (প্রমিত বাংলা)
              </button>
              <button
                onClick={() => {
                  setSelectedLocale('bn-BD');
                  setSpeed(0.95);
                  setPitch(1.0);
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  selectedLocale === 'bn-BD' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-white/60 hover:text-white'
                }`}
                title="Bengali (Bangladesh) - মিষ্টি চলিত বাংলা"
              >
                bn-BD (বাংলাদেশ)
              </button>
              <button
                onClick={() => setSelectedLocale('en-US')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  selectedLocale === 'en-US' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-white/60 hover:text-white'
                }`}
                title="English (US)"
              >
                en-US
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {PRESET_SCRIPTS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPreviewText(preset.text);
                  setSelectedLocale(preset.locale);
                  if (preset.locale === 'bn-IN' || preset.locale === 'bn-BD') {
                    setSpeed(0.96);
                    setPitch(1.0);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  previewText === preset.text
                    ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 font-bold'
                    : 'border-white/5 bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                {preset.title}
              </button>
            ))}
          </div>

          <textarea
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            rows={3}
            placeholder="Enter custom speech text to test with Riya's SSML synthesis..."
            className="w-full p-4 rounded-2xl bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors placeholder:text-white/30 resize-none font-sans"
          />

          <div className="flex items-center justify-between pt-1">
            <p className="text-[10px] text-white/40 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              SSML tags and emotion parameters are automatically injected into speech prompts.
            </p>
            <button
              onClick={handlePreviewSSML}
              disabled={isSynthesizing}
              className="px-4 py-2 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:brightness-110 active:scale-95 transition-all shadow-md shadow-cyan-500/20"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Listen Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceStudioView;
