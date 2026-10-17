import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Volume2, VolumeX, Phone, PhoneOff, 
  FileText, X, ChevronLeft, Sparkles, Copy, Check, 
  RotateCcw, Globe, AlertCircle, Headphones, Zap,
  Command, HelpCircle, ArrowRight
} from 'lucide-react';
import { UserProfile } from '../types';
import { 
  generateSpeech, 
  generateEmotionSpeech, 
  generateEmotionAwareVoiceResponse, 
  detectTextEmotion, 
  getTimeAwareGreeting,
  UserEmotionState 
} from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audioUtils';

interface VoiceAssistantViewProps {
  userProfile?: UserProfile;
  onClose: () => void;
  onAction?: (action: string) => void;
}

interface ChatTurn {
  id: string;
  sender: 'user' | 'sifra';
  text: string;
  timestamp: string;
  tags?: string[];
  emotion?: UserEmotionState;
}

const EMOTION_CONFIG: Record<UserEmotionState, { label: string; icon: string; badgeBg: string; textColor: string }> = {
  happy: { label: 'আনন্দিত (Happy)', icon: '😊', badgeBg: 'bg-emerald-50 border-emerald-200/90', textColor: 'text-emerald-800' },
  laughing: { label: 'হাস্যোজ্জ্বল (Laughing)', icon: '😄', badgeBg: 'bg-amber-50 border-amber-200/90', textColor: 'text-amber-800' },
  excited: { label: 'উৎসাহিত (Excited)', icon: '🚀', badgeBg: 'bg-purple-50 border-purple-200/90', textColor: 'text-purple-800' },
  sad: { label: 'সহানুভূতিশীল (Empathetic)', icon: '💙', badgeBg: 'bg-sky-50 border-sky-200/90', textColor: 'text-sky-800' },
  serious: { label: 'গম্ভীর ও সুনির্দিষ্ট (Serious)', icon: '⚖️', badgeBg: 'bg-slate-100 border-slate-300/90', textColor: 'text-slate-800' },
  frustrated: { label: 'ধৈর্যশীল (Patient)', icon: '🕊️', badgeBg: 'bg-rose-50 border-rose-200/90', textColor: 'text-rose-800' },
  calm: { label: 'শান্ত (Calm)', icon: '✨', badgeBg: 'bg-indigo-50 border-indigo-200/90', textColor: 'text-indigo-800' },
  neutral: { label: 'লাইভ ভয়েস (Live Voice)', icon: '🎙️', badgeBg: 'bg-purple-50 border-purple-200/90', textColor: 'text-purple-800' }
};

export const VoiceAssistantView: React.FC<VoiceAssistantViewProps> = ({
  userProfile,
  onClose,
}) => {
  // Session State
  const [sessionActive, setSessionActive] = useState<boolean>(true);
  const [assistantState, setAssistantState] = useState<'idle' | 'listening' | 'speaking'>('listening');
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState<boolean>(false);
  const [language, setLanguage] = useState<'bn-IN' | 'bn-BD' | 'en-US'>('bn-IN'); // Standard Bengali
  const [callDuration, setCallDuration] = useState<number>(0);
  const [showTranscriptModal, setShowTranscriptModal] = useState<boolean>(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(20);
  const [copiedTranscript, setCopiedTranscript] = useState<boolean>(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Emotional Intelligence & Transcripts State
  const [detectedEmotion, setDetectedEmotion] = useState<UserEmotionState>('neutral');
  const [interimText, setInterimText] = useState<string>('');
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [contextualTags, setContextualTags] = useState<string[]>([]);

  // Audio Pipeline & Gain Node Refs for Pop-Free Audio & Ultra-Fast Response
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const vadTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSpeakingRef = useRef<boolean>(false);
  const isMicMutedRef = useRef<boolean>(false);
  const isSpeakerMutedRef = useRef<boolean>(false);
  const sessionActiveRef = useRef<boolean>(true);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  const userProfileRef = useRef<UserProfile | undefined>(userProfile);
  const messagesRef = useRef<ChatTurn[]>([]);
  const introTriggeredRef = useRef<boolean>(false);

  useEffect(() => {
    userProfileRef.current = userProfile;
  }, [userProfile]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    isMicMutedRef.current = isMicMuted;
  }, [isMicMuted]);

  // Pre-warm AudioContext & Gain Node eagerly for ultra-fast, pop-free speech playback
  useEffect(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx({ sampleRate: 24000 });
        audioContextRef.current = ctx;
        const gain = ctx.createGain();
        gain.connect(ctx.destination);
        gainNodeRef.current = gain;
      }
    } catch (e) {
      console.warn('AudioContext prewarm warning:', e);
    }
  }, []);

  // Clean pop-free audio stopping helper
  const stopAudioSourceCleanly = useCallback(() => {
    if (audioSourceRef.current) {
      try {
        if (gainNodeRef.current && audioContextRef.current && audioContextRef.current.state === 'running') {
          gainNodeRef.current.gain.setValueAtTime(gainNodeRef.current.gain.value, audioContextRef.current.currentTime);
          gainNodeRef.current.gain.linearRampToValueAtTime(0.0001, audioContextRef.current.currentTime + 0.012);
          const srcToStop = audioSourceRef.current;
          setTimeout(() => {
            try { srcToStop.stop(); } catch (e) {}
          }, 15);
        } else {
          audioSourceRef.current.stop();
        }
      } catch (e) {
        // ignore
      }
      audioSourceRef.current = null;
    }
  }, []);

  useEffect(() => {
    isSpeakerMutedRef.current = isSpeakerMuted;
    if (isSpeakerMuted) {
      stopAudioSourceCleanly();
    }
  }, [isSpeakerMuted, stopAudioSourceCleanly]);

  useEffect(() => {
    sessionActiveRef.current = sessionActive;
  }, [sessionActive]);

  // Timer: Increments call duration every second when session is active
  useEffect(() => {
    if (!sessionActive) return;
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionActive]);

  // Format seconds into MM:SS
  const formattedDuration = useMemo(() => {
    const mins = Math.floor(callDuration / 60);
    const secs = callDuration % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [callDuration]);

  // Auto-scroll transcript container
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interimText]);

  // Stop all microphone & audio tracks strictly
  const stopAllMicrophoneTracks = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      mediaStreamRef.current = null;
    }
    stopAudioSourceCleanly();
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try { audioContextRef.current.close(); } catch (e) { /* ignore */ }
      audioContextRef.current = null;
    }
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onresult = null;
      try { recognitionRef.current.abort(); } catch (e) { /* ignore */ }
      recognitionRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (vadTimerRef.current) {
      clearTimeout(vadTimerRef.current);
      vadTimerRef.current = null;
    }
  }, [stopAudioSourceCleanly]);

  // Synthesize and speak assistant reply using emotion-aware Gemini TTS without pops or artifacts
  const speakReply = useCallback(async (textToSpeak: string, emotion: UserEmotionState = 'neutral') => {
    if (!sessionActiveRef.current || isSpeakerMutedRef.current) {
      setAssistantState('listening');
      return;
    }

    stopAudioSourceCleanly();

    setAssistantState('speaking');
    isSpeakingRef.current = true;

    // Pause recognition while speaking so microphone doesn't echo output
    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } catch (e) {
      // Ignore
    }

    try {
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioCtx({ sampleRate: 24000 });
        const gain = audioContextRef.current.createGain();
        gain.connect(audioContextRef.current.destination);
        gainNodeRef.current = gain;
      }
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const audioBase64 = await generateEmotionSpeech(textToSpeak, emotion, 'Kore');
      if (audioBase64 && audioContextRef.current && sessionActiveRef.current) {
        const audioBuffer = await decodeAudioData(decode(audioBase64), audioContextRef.current, 24000, 1);
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;

        if (gainNodeRef.current) {
          gainNodeRef.current.gain.setValueAtTime(1.0, audioContextRef.current.currentTime);
          source.connect(gainNodeRef.current);
        } else {
          source.connect(audioContextRef.current.destination);
        }

        source.onended = () => {
          isSpeakingRef.current = false;
          setAssistantState('listening');
          if (!isMicMutedRef.current && sessionActiveRef.current && recognitionRef.current) {
            try { recognitionRef.current.start(); } catch (e) { /* ignore */ }
          }
        };

        audioSourceRef.current = source;
        source.start(0);
      } else {
        isSpeakingRef.current = false;
        setAssistantState('listening');
        if (!isMicMutedRef.current && sessionActiveRef.current && recognitionRef.current) {
          try { recognitionRef.current.start(); } catch (e) { /* ignore */ }
        }
      }
    } catch (err) {
      console.error('TTS playback error:', err);
      isSpeakingRef.current = false;
      setAssistantState('listening');
      if (!isMicMutedRef.current && sessionActiveRef.current && recognitionRef.current) {
        try { recognitionRef.current.start(); } catch (e) { /* ignore */ }
      }
    }
  }, [stopAudioSourceCleanly]);

  // Automatic SIFRA Introduction on Startup (Time-Aware Greeting, NO Developer Name automatically)
  useEffect(() => {
    if (sessionActive && !introTriggeredRef.current && messages.length === 0) {
      introTriggeredRef.current = true;
      const { greetingBn, greetingEn } = getTimeAwareGreeting();
      
      const isEnglish = language === 'en-US';
      const introText = isEnglish
        ? `${greetingEn} Hi! I'm SIFRA, your AI voice assistant. How are you today, and how can I help you?`
        : `${greetingBn} হাই! আমি শিপ্রা, আপনার এআই ভয়েস অ্যাসিস্ট্যান্ট। আজকে আপনি কেমন আছেন, আর কীভাবে আমি সাহায্য করতে পারি?`;
      
      const introTurn: ChatTurn = {
        id: `sifra-intro-${Date.now()}`,
        sender: 'sifra',
        text: introText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tags: ['শুভেচ্ছা: ভয়েস অ্যাসিস্ট্যান্ট'],
        emotion: 'happy'
      };

      setMessages([introTurn]);
      setContextualTags(['শুভেচ্ছা: ভয়েস অ্যাসিস্ট্যান্ট']);
      speakReply(introText, 'happy');
    }
  }, [sessionActive, speakReply, messages.length, language]);

  // Handler for user speech turn with real-time emotion intelligence
  const handleUserSpeechTurnRef = useRef<(text: string) => Promise<void>>(async () => {});
  handleUserSpeechTurnRef.current = async (spokenText: string) => {
    const cleaned = spokenText.trim();
    if (!cleaned) return;

    // Detect text emotion & combine with dynamic live emotion
    const textEmotion = await detectTextEmotion(cleaned);
    const activeEmotion: UserEmotionState = textEmotion !== 'neutral' ? textEmotion : detectedEmotion;
    setDetectedEmotion(activeEmotion);

    const userTurn: ChatTurn = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: cleaned,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      emotion: activeEmotion
    };

    setMessages(prev => [...prev, userTurn]);
    setInterimText('');

    const newTags: string[] = [];
    if (/কাজ|টাস্ক|লিস্ট|রুটিন|task|schedule/i.test(cleaned)) newTags.push('বিষয়: দৈনিক কাজ');
    else if (/আবহাওয়া|বৃষ্টি|রোদ|weather/i.test(cleaned)) newTags.push('বিষয়: আবহাওয়ার বার্তা');
    else if (/ভ্রমণ|ট্যুর|প্ল্যান|দার্জিলিং|পাহাড়/i.test(cleaned)) newTags.push('বিষয়: ট্রাভেল গাইড');
    else if (/রিজওয়ান|রওনক|ডেভেলপার|developer|creator/i.test(cleaned)) newTags.push('বিষয়: ডেভেলপার ইনফো');
    else newTags.push('বিষয়: কথপোকথন');
    
    newTags.push(`অনুভূতি: ${EMOTION_CONFIG[activeEmotion]?.label || 'স্বাভাবিক'}`);
    setContextualTags(newTags);

    try {
      const historyForApi = messagesRef.current.map(m => ({
        role: m.sender === 'user' ? ('user' as const) : ('model' as const),
        text: m.text
      }));

      const { text: assistantText, emotion: resEmotion } = await generateEmotionAwareVoiceResponse(
        cleaned,
        activeEmotion,
        historyForApi,
        userProfileRef.current?.name || 'Rizwan'
      );

      setDetectedEmotion(resEmotion);

      const sifraTurn: ChatTurn = {
        id: `sifra-${Date.now()}`,
        sender: 'sifra',
        text: assistantText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tags: newTags,
        emotion: resEmotion
      };

      setMessages(prev => [...prev, sifraTurn]);
      speakReply(assistantText, resEmotion);
    } catch (err) {
      console.error('Voice assistant error:', err);
      const fallbackReply = 'আমি আপনার কথা বুঝতে পেরেছি। বলুন, আপনাকে কীভাবে সাহায্য করব?';
      setMessages(prev => [...prev, {
        id: `sifra-${Date.now()}`,
        sender: 'sifra',
        text: fallbackReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      speakReply(fallbackReply, 'neutral');
    }
  };

  // Main Audio & Speech Recognition Initializer (Runs ONCE on mount)
  useEffect(() => {
    let recognition: any = null;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setPermissionError('আপনার ব্রাউজারে স্পিচ রিকগনিশন সমর্থিত নয়। দয়া করে গুগল ক্রোম ব্যবহার করুন।');
      return;
    }

    try {
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;
      recognitionRef.current = recognition;

      recognition.onresult = (event: any) => {
        // Interruption: If SIFRA was speaking, halt playback immediately!
        if (isSpeakingRef.current) {
          if (audioSourceRef.current) {
            try { audioSourceRef.current.stop(); } catch (e) {}
            audioSourceRef.current = null;
          }
          isSpeakingRef.current = false;
          setAssistantState('listening');
        }

        let currentInterim = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPart;
          } else {
            currentInterim += transcriptPart;
          }
        }

        if (currentInterim) {
          setInterimText(currentInterim);
          setAssistantState('listening');
        }

        if (finalTranscript) {
          setInterimText(finalTranscript);
          if (vadTimerRef.current) clearTimeout(vadTimerRef.current);
          handleUserSpeechTurnRef.current(finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'no-speech') return;
        if (event.error === 'language-not-supported' && recognition.lang !== 'bn-IN') {
          recognition.lang = 'bn-IN';
          try { recognition.start(); } catch (e) {}
        }
        if (event.error === 'not-allowed') {
          setPermissionError('মাইক্রোফোন ব্যবহারের অনুমতি দিন।');
        }
      };

      recognition.onend = () => {
        if (sessionActiveRef.current && !isMicMutedRef.current && !isSpeakingRef.current) {
          try {
            recognition.start();
          } catch (e) {
            // Already active
          }
        }
      };

      recognition.start();
      setAssistantState('listening');
    } catch (e) {
      console.warn('Recognition start exception:', e);
    }

    // Audio reactive visualizer stream
    navigator.mediaDevices?.getUserMedia({ audio: true })
      .then(stream => {
        mediaStreamRef.current = stream;
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          analyserRef.current = analyser;

          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);

          const updateVolume = () => {
            if (!sessionActiveRef.current) return;

            if (isSpeakingRef.current) {
              const dynamicSpeechLevel = 35 + Math.sin(Date.now() / 120) * 25 + Math.cos(Date.now() / 80) * 15;
              setAudioLevel(Math.min(100, Math.max(15, dynamicSpeechLevel)));
            } else if (!isMicMutedRef.current && analyserRef.current) {
              analyserRef.current.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
              }
              const average = sum / dataArray.length;
              const normalized = Math.min(100, Math.max(8, (average / 128) * 100));
              setAudioLevel(normalized);

              // Continuous audio pitch & frequency burst analysis for live laughter & excitement detection
              if (average > 40) {
                const highFreqs = dataArray.slice(12, 32).reduce((a, b) => a + b, 0);
                const lowFreqs = dataArray.slice(0, 12).reduce((a, b) => a + b, 0);
                if (highFreqs > lowFreqs * 1.25) {
                  setDetectedEmotion('laughing');
                } else if (average > 65) {
                  setDetectedEmotion('excited');
                }
              }
            } else {
              setAudioLevel(8);
            }

            animationFrameRef.current = requestAnimationFrame(updateVolume);
          };

          updateVolume();
        }
      })
      .catch(err => {
        console.warn('Mic stream access error:', err);
      });

    // Explicit cleanup on unmount
    return () => {
      sessionActiveRef.current = false;
      stopAllMicrophoneTracks();
    };
  }, [language, stopAllMicrophoneTracks]);

  // Mic Toggle Action
  const handleToggleMic = () => {
    setIsMicMuted(prev => {
      const next = !prev;
      if (next) {
        if (recognitionRef.current) {
          try { recognitionRef.current.stop(); } catch (e) { /* ignore */ }
        }
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getAudioTracks().forEach(track => { track.enabled = false; });
        }
        setAssistantState('idle');
      } else {
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getAudioTracks().forEach(track => { track.enabled = true; });
        }
        if (recognitionRef.current && !isSpeakingRef.current) {
          try { recognitionRef.current.start(); } catch (e) { /* ignore */ }
        }
        setAssistantState('listening');
      }
      return next;
    });
  };

  // Speaker Toggle Action
  const handleToggleSpeaker = () => {
    setIsSpeakerMuted(prev => {
      const next = !prev;
      if (next) {
        if (audioSourceRef.current) {
          try { audioSourceRef.current.stop(); } catch (e) {}
          audioSourceRef.current = null;
        }
      }
      return next;
    });
  };

  // Safe End Session Action - Strictly turns OFF microphone
  const handleEndSession = () => {
    setSessionActive(false);
    sessionActiveRef.current = false;
    stopAllMicrophoneTracks();
    onClose();
  };

  // Copy full transcript
  const handleCopyTranscript = () => {
    const text = messages.map(m => `${m.sender === 'user' ? 'Caller' : 'SIFRA'}: ${m.text}`).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopiedTranscript(true);
    setTimeout(() => setCopiedTranscript(false), 2000);
  };

  // Generate 26 symmetric vertical equalizer bars reacting dynamically
  const equalizerBars = useMemo(() => {
    const barCount = 26;
    const bars = [];
    const intensity = audioLevel / 100;

    for (let i = 0; i < barCount; i++) {
      const centerDistance = Math.abs(i - barCount / 2) / (barCount / 2);
      const bellCurve = Math.cos(centerDistance * (Math.PI / 2.2));
      const jitter = Math.sin((i * 1.5) + (callDuration * 4)) * 0.3 + 0.7;
      let minHeight = 4;
      let maxHeight = 34;

      if (assistantState === 'idle' || isMicMuted) {
        bars.push(minHeight);
      } else {
        const height = minHeight + (bellCurve * intensity * maxHeight * jitter);
        bars.push(Math.max(minHeight, Math.min(38, height)));
      }
    }
    return bars;
  }, [audioLevel, assistantState, isMicMuted, callDuration]);

  // Sound-wave ring scale values calculated from audio intensity
  const waveScale1 = useMemo(() => 1 + (audioLevel / 100) * 0.35, [audioLevel]);
  const waveScale2 = useMemo(() => 1 + (audioLevel / 100) * 0.65, [audioLevel]);
  const waveOpacity = useMemo(() => Math.min(0.85, 0.25 + (audioLevel / 100) * 0.6), [audioLevel]);

  const lastUserTurn = useMemo(() => {
    const userMsgs = messages.filter(m => m.sender === 'user');
    return userMsgs[userMsgs.length - 1];
  }, [messages]);

  const lastSifraTurn = useMemo(() => {
    const sifraMsgs = messages.filter(m => m.sender === 'sifra');
    return sifraMsgs[sifraMsgs.length - 1];
  }, [messages]);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#fbfaff] via-[#ffffff] to-[#f4f2fa] flex flex-col justify-between overflow-hidden select-none font-sans text-slate-800">
      
      {/* Soft Purple Ambient Glow Background Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[460px] h-[340px] bg-purple-400/12 rounded-full blur-[95px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-[300px] h-[280px] bg-indigo-300/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Top Header Navigation */}
      <header className="relative z-20 flex items-center justify-between px-5 pt-4 sm:pt-6">
        <button
          onClick={handleEndSession}
          aria-label="Back to previous screen"
          className="w-10 h-10 rounded-full bg-white/80 border border-purple-100 shadow-sm flex items-center justify-center text-purple-900 hover:bg-purple-50 active:scale-95 transition-all"
        >
          <ChevronLeft className="w-5 h-5 text-purple-800" />
        </button>

        {/* Live Status & Emotion Indicator Pill */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-xs backdrop-blur-md transition-all ${EMOTION_CONFIG[detectedEmotion]?.badgeBg || 'bg-white/80 border-purple-100/80'}`}>
          <span className="text-xs">{EMOTION_CONFIG[detectedEmotion]?.icon || '🎙️'}</span>
          <span className={`text-[10px] font-extrabold uppercase tracking-wider ${EMOTION_CONFIG[detectedEmotion]?.textColor || 'text-purple-900'}`}>
            {assistantState === 'speaking' ? 'SIFRA Speaking' : EMOTION_CONFIG[detectedEmotion]?.label || 'Listening / Live'}
          </span>
        </div>

        {/* Header Right Actions: Voice Shortcuts & Language Toggle */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowShortcutsModal(true)}
            className="flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-100/90 border border-amber-200/90 px-2.5 py-1 rounded-full hover:bg-amber-200/90 transition-all shadow-2xs active:scale-95"
            title="Available Voice Commands"
          >
            <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            <span>Shortcuts</span>
          </button>

          <button
            onClick={() => setLanguage(l => l === 'bn-IN' ? 'bn-BD' : l === 'bn-BD' ? 'en-US' : 'bn-IN')}
            className="flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50/80 border border-purple-200/60 px-2.5 py-1 rounded-full hover:bg-purple-100 transition-colors shadow-2xs"
            title="Switch Dialect / Language"
          >
            <Globe className="w-3.5 h-3.5 text-purple-600" />
            <span>{language === 'bn-IN' ? 'বাংলা' : language === 'bn-BD' ? 'বাংলা (BD)' : 'English'}</span>
          </button>
        </div>
      </header>

      {/* Permission Warning if Microphone Blocked */}
      {permissionError && (
        <div className="mx-6 mt-2 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 relative z-30 shadow-sm">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span className="flex-1">{permissionError}</span>
          <button onClick={() => setPermissionError(null)} className="p-1 hover:bg-rose-100 rounded-lg">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Interactive Stage */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-between px-5 pt-2 pb-24 overflow-y-auto no-scrollbar">

        {/* Section 1: Professional Female Avatar with 4 Animated Side Sound-Wave Rings */}
        <div className="flex flex-col items-center text-center mt-2 sm:mt-4 w-full">
          
          <div className="relative flex items-center justify-center my-3 sm:my-4">
            
            {/* LEFT SIDE: 2 Animated Curved Sound-Wave Arcs */}
            <div className="absolute right-full mr-1 sm:mr-3 flex items-center justify-center pointer-events-none">
              <motion.div 
                animate={{
                  scaleX: waveScale2,
                  scaleY: waveScale2,
                  opacity: assistantState === 'idle' ? 0.15 : waveOpacity * 0.6,
                }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="w-20 sm:w-28 h-28 sm:h-36 rounded-full border-l-[3px] border-t-[1.5px] border-b-[1.5px] border-purple-400/50 -rotate-12 blur-[0.3px]"
                style={{
                  filter: 'drop-shadow(-4px 0px 8px rgba(168, 85, 247, 0.25))',
                }}
              />
              <motion.div 
                animate={{
                  scaleX: waveScale1,
                  scaleY: waveScale1,
                  opacity: assistantState === 'idle' ? 0.3 : waveOpacity,
                }}
                transition={{ duration: 0.12, ease: 'easeOut' }}
                className="absolute right-0 w-14 sm:w-20 h-22 sm:h-28 rounded-full border-l-[3.5px] border-t-[2px] border-b-[2px] border-purple-500/70 -rotate-6"
                style={{
                  filter: 'drop-shadow(-2px 0px 6px rgba(168, 85, 247, 0.3))',
                }}
              />
            </div>

            {/* Ambient Background Aura Glow behind Avatar */}
            <motion.div
              animate={{
                scale: [1, 1.08, 1],
                opacity: assistantState === 'speaking' || assistantState === 'listening' ? [0.35, 0.6, 0.35] : 0.2,
              }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
              className="absolute w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-purple-500/25 via-indigo-500/20 to-pink-400/20 blur-xl pointer-events-none"
            />

            {/* Stationary Circular Avatar Frame (Stable & Centered) */}
            <div className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-b from-white via-purple-50 to-purple-200 shadow-[0_12px_30px_rgba(147,51,234,0.18)] border border-purple-100 flex items-center justify-center overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80"
                alt="SIFRA AI Assistant Avatar"
                className="w-full h-full object-cover rounded-full select-none pointer-events-none"
                loading="eager"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80";
                }}
              />
            </div>

            {/* RIGHT SIDE: 2 Animated Curved Sound-Wave Arcs */}
            <div className="absolute left-full ml-1 sm:ml-3 flex items-center justify-center pointer-events-none">
              <motion.div 
                animate={{
                  scaleX: waveScale1,
                  scaleY: waveScale1,
                  opacity: assistantState === 'idle' ? 0.3 : waveOpacity,
                }}
                transition={{ duration: 0.12, ease: 'easeOut' }}
                className="absolute left-0 w-14 sm:w-20 h-22 sm:h-28 rounded-full border-r-[3.5px] border-t-[2px] border-b-[2px] border-purple-500/70 rotate-6"
                style={{
                  filter: 'drop-shadow(2px 0px 6px rgba(168, 85, 247, 0.3))',
                }}
              />
              <motion.div 
                animate={{
                  scaleX: waveScale2,
                  scaleY: waveScale2,
                  opacity: assistantState === 'idle' ? 0.15 : waveOpacity * 0.6,
                }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="w-20 sm:w-28 h-28 sm:h-36 rounded-full border-r-[3px] border-t-[1.5px] border-b-[1.5px] border-purple-400/50 rotate-12 blur-[0.3px]"
                style={{
                  filter: 'drop-shadow(4px 0px 8px rgba(168, 85, 247, 0.25))',
                }}
              />
            </div>

          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            SIFRA (শিপ্রা)
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5 tracking-wide">
            +880 1700-SIFRA • Neural Live Voice
          </p>

          <div className="mt-1.5 flex flex-col items-center gap-1">
            <span className="text-xs sm:text-sm font-bold text-purple-600 tracking-wider">
              {formattedDuration}
            </span>
            <button
              onClick={() => setShowShortcutsModal(true)}
              className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100/90 hover:bg-purple-200/90 border border-purple-200/80 text-purple-900 text-[11px] font-bold transition-all active:scale-95 shadow-2xs group"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400 group-hover:scale-110 transition-transform" />
              <span>Voice Shortcuts (ভয়েস কমান্ড)</span>
            </button>
          </div>

          {/* Dynamic Frequency Waveform Bars */}
          <div className="flex items-center justify-center gap-[3px] sm:gap-[4px] h-10 mt-3 px-4">
            {equalizerBars.map((barHeight, idx) => (
              <motion.div
                key={idx}
                animate={{ height: `${barHeight}px` }}
                transition={{ duration: 0.08, ease: 'linear' }}
                className="w-[2.5px] sm:w-[3px] rounded-full bg-gradient-to-t from-purple-700 via-indigo-600 to-violet-400 shadow-2xs"
                style={{
                  opacity: assistantState === 'idle' ? 0.3 : 0.85,
                }}
              />
            ))}
          </div>

        </div>

        {/* Section 2: Live Conversation Transcript Card (Clean - Shows ONLY real spoken words) */}
        <div className="w-full max-w-sm sm:max-w-md my-4">
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-white/95 backdrop-blur-xl rounded-[28px] p-5 sm:p-6 shadow-[0_12px_40px_rgba(130,60,230,0.08)] border border-purple-100/70 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50/50 rounded-full blur-2xl pointer-events-none" />

            {/* Conversation Messages - Empty until actual speech happens */}
            <div className="space-y-3.5 max-h-[160px] sm:max-h-[190px] overflow-y-auto no-scrollbar pr-1">
              
              {messages.length === 0 && !interimText && (
                <div className="py-4 flex flex-col items-center justify-center text-center opacity-40">
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
                </div>
              )}

              {/* User Spoken Words */}
              {interimText && assistantState === 'listening' && (
                <div className="text-left">
                  <span className="text-xs sm:text-sm font-black text-indigo-950">Caller - </span>
                  <span className="text-xs sm:text-sm text-purple-700 italic font-medium animate-pulse">
                    {interimText} ...
                  </span>
                </div>
              )}

              {lastUserTurn && (
                <div className="text-left">
                  <span className="text-xs sm:text-sm font-black text-indigo-950">Caller - </span>
                  <span className="text-xs sm:text-sm font-normal text-slate-700 leading-relaxed">
                    {lastUserTurn.text}
                  </span>
                </div>
              )}

              {/* SIFRA's Reply */}
              {lastSifraTurn && (
                <div className="text-left pt-1">
                  <span className="text-xs sm:text-sm font-black text-purple-700">SIFRA - </span>
                  <span className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed">
                    {lastSifraTurn.text}
                  </span>
                </div>
              )}

              <div ref={transcriptEndRef} />
            </div>

            {/* Contextual Chips / Badges - only shown once conversation starts */}
            {contextualTags.length > 0 && (
              <div className="mt-4 pt-3 border-t border-purple-50 flex flex-wrap items-center justify-center gap-2">
                {contextualTags.map((tag, i) => (
                  <span 
                    key={i}
                    className="px-3 py-1 rounded-full bg-purple-50/70 border border-purple-100/80 text-[10px] font-semibold text-purple-800 shadow-2xs backdrop-blur-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

          </motion.div>
        </div>

      </main>

      {/* Floating Bottom Control Bar */}
      <footer className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[92%] max-w-sm bg-white/95 backdrop-blur-2xl border border-gray-100/90 rounded-full px-4 py-2.5 shadow-[0_20px_50px_rgba(90,40,180,0.16)] flex items-center justify-between z-40">
        
        {/* 1. Mute / Unmute Microphone Button */}
        <button
          onClick={handleToggleMic}
          aria-label={isMicMuted ? "Unmute Microphone" : "Mute Microphone"}
          title={isMicMuted ? "Unmute Microphone" : "Mute Microphone"}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90 ${
            isMicMuted 
              ? 'bg-rose-50 text-rose-600 border border-rose-200' 
              : 'bg-purple-50/80 hover:bg-purple-100/80 border border-purple-100/70 text-purple-800'
          }`}
        >
          {isMicMuted ? <MicOff className="w-5 h-5 text-rose-500" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* 2. Speaker Audio Output Button */}
        <button
          onClick={handleToggleSpeaker}
          aria-label={isSpeakerMuted ? "Unmute Speaker" : "Mute Speaker"}
          title={isSpeakerMuted ? "Unmute Speaker" : "Mute Speaker"}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90 ${
            isSpeakerMuted 
              ? 'bg-rose-50 text-rose-600 border border-rose-200' 
              : 'bg-purple-50/80 hover:bg-purple-100/80 border border-purple-100/70 text-purple-800'
          }`}
        >
          {isSpeakerMuted ? <VolumeX className="w-5 h-5 text-rose-500" /> : <Volume2 className="w-5 h-5" />}
        </button>

        {/* 3. Center Highlighted Purple Call / Voice Action Button */}
        <button
          onClick={() => {
            if (assistantState === 'speaking') {
              if (audioSourceRef.current) {
                try { audioSourceRef.current.stop(); } catch (e) {}
                audioSourceRef.current = null;
              }
              isSpeakingRef.current = false;
              setAssistantState('listening');
            } else if (assistantState === 'idle') {
              handleToggleMic();
            } else if (interimText) {
              handleUserSpeechTurnRef.current(interimText);
            }
          }}
          aria-label="Active Voice Conversation Hub"
          title="Voice Session Active"
          className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-purple-700 via-indigo-600 to-violet-500 text-white shadow-[0_8px_25px_rgba(147,51,234,0.45)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all group"
        >
          <span className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping pointer-events-none" />
          <Phone className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
        </button>

        {/* 4. Transcript / Conversation History Modal Button */}
        <button
          onClick={() => setShowTranscriptModal(true)}
          aria-label="View Full Transcript"
          title="Transcript & Conversation Notes"
          className="w-11 h-11 rounded-full bg-purple-50/80 hover:bg-purple-100/80 border border-purple-100/70 text-purple-800 flex items-center justify-center transition-all active:scale-90"
        >
          <FileText className="w-5 h-5" />
        </button>

        {/* 5. End Session Crimson Red Button (Releases Mic Strictly) */}
        <button
          onClick={handleEndSession}
          aria-label="End Session"
          title="End Live Voice Call"
          className="w-11 h-11 rounded-full bg-[#E11D48] hover:bg-rose-700 text-white shadow-[0_8px_20px_rgba(225,29,72,0.35)] flex items-center justify-center active:scale-90 transition-all"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

      </footer>

      {/* Full Transcript Slide-over Modal */}
      <AnimatePresence>
        {showTranscriptModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="w-full sm:max-w-lg bg-white rounded-t-[32px] sm:rounded-[32px] max-h-[85vh] flex flex-col shadow-2xl border border-purple-100 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-purple-100/80 flex items-center justify-between bg-purple-50/40">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-xs">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">কথোপকথনের সম্পূর্ণ বিবরণ (Transcript)</h3>
                    <p className="text-[10px] text-slate-500">Duration: {formattedDuration} • SIFRA Neural</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCopyTranscript}
                    className="p-2 rounded-full hover:bg-purple-100 text-purple-700 transition-colors"
                    title="Copy Transcript"
                  >
                    {copiedTranscript ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setShowTranscriptModal(false)}
                    className="p-2 rounded-full hover:bg-purple-100 text-slate-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto space-y-4 flex-1">
                {messages.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-8">এখনো কোনো কথোপকথন রেকর্ড করা হয়নি।</p>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400 font-semibold">
                        <span>{m.sender === 'user' ? 'আপনি (Caller)' : 'SIFRA'}</span>
                        <span>•</span>
                        <span>{m.timestamp}</span>
                      </div>
                      <div
                        className={`p-3.5 rounded-2xl max-w-[85%] text-xs sm:text-sm leading-relaxed ${
                          m.sender === 'user'
                            ? 'bg-purple-700 text-white rounded-br-xs'
                            : 'bg-purple-50 text-slate-800 border border-purple-100 rounded-bl-xs font-medium'
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="px-6 py-3 border-t border-purple-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
                <span>মোট মেসেজ: {messages.length}</span>
                <button
                  onClick={() => setShowTranscriptModal(false)}
                  className="px-4 py-1.5 rounded-xl bg-purple-600 text-white font-semibold text-xs hover:bg-purple-700 transition-colors"
                >
                  বন্ধ করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Voice Shortcuts Overlay Drawer */}
        {showShortcutsModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="w-full sm:max-w-xl bg-white rounded-t-[32px] sm:rounded-[32px] max-h-[85vh] flex flex-col shadow-2xl border border-purple-100 overflow-hidden"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-purple-100 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                    <Zap className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">ভয়েস শর্টকাট ও কম্যান্ডসমূহ (Voice Shortcuts)</h3>
                    <p className="text-[11px] font-medium text-slate-500">যেকোনো কম্যান্ডে ট্যাপ করুন অথবা মুখে বলুন</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowShortcutsModal(false)}
                  className="p-2 rounded-full hover:bg-purple-100/60 text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categorized Shortcut Grid */}
              <div className="p-5 overflow-y-auto space-y-5 flex-1 no-scrollbar">
                {[
                  {
                    category: 'আবহাওয়া ও জলবায়ু (Weather)',
                    badge: 'Sifra Sky',
                    color: 'from-amber-500/10 to-orange-500/10 border-amber-200/80',
                    commands: [
                      { bangla: 'আজকের আবহাওয়া কেমন?', english: 'How is the weather today?' },
                      { bangla: 'আজকে কি বৃষ্টি হবে?', english: 'Will it rain today?' },
                      { bangla: 'বাতাসের গতি ও আর্দ্রতা কত?', english: 'Wind speed & humidity' },
                    ]
                  },
                  {
                    category: 'ম্যাপস ও দিকনির্দেশনা (Maps)',
                    badge: 'Sifra Earth',
                    color: 'from-emerald-500/10 to-teal-500/10 border-emerald-200/80',
                    commands: [
                      { bangla: 'নিকটস্থ হাসপাতাল দেখাও', english: 'Find nearby hospitals' },
                      { bangla: 'কাছে ফার্মেসি কোথায় আছে?', english: 'Find nearest pharmacy' },
                      { bangla: 'ঢাকা যাওয়ার রাস্তা দেখাও', english: 'Show directions to Dhaka' },
                    ]
                  },
                  {
                    category: 'সিস্টেম ও টুলস (System Tools)',
                    badge: 'Essentials',
                    color: 'from-purple-500/10 to-indigo-500/10 border-purple-200/80',
                    commands: [
                      { bangla: 'ক্যালকুলেটর খুলে দাও', english: 'Open Sifra Calculator' },
                      { bangla: 'ঘড়ির এলার্ম সেট করো', english: 'Open Clock & Alarm' },
                      { bangla: 'আজকের দৈনিক কাজ দেখাও', english: 'Open Daily Tasks' },
                    ]
                  },
                  {
                    category: 'স্মার্ট প্রশ্ন ও সহায়িকা (AI Insights)',
                    badge: 'Neural AI',
                    color: 'from-sky-500/10 to-blue-500/10 border-sky-200/80',
                    commands: [
                      { bangla: 'শিপ্রা তুমি কি কি করতে পারো?', english: 'What can SIFRA do?' },
                      { bangla: 'আজকের একটি দারুণ উক্তি বলো', english: 'Share a motivational quote' },
                      { bangla: 'আমাকে একটি মজার তথ্য বলো', english: 'Tell me a fun tech fact' },
                    ]
                  }
                ].map((section, sIdx) => (
                  <div key={sIdx} className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-bold text-slate-800 tracking-tight">{section.category}</span>
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                        {section.badge}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {section.commands.map((cmd, cIdx) => (
                        <button
                          key={cIdx}
                          onClick={() => {
                            setShowShortcutsModal(false);
                            if (handleUserSpeechTurnRef.current) {
                              handleUserSpeechTurnRef.current(cmd.bangla);
                            }
                          }}
                          className={`p-3 rounded-2xl bg-gradient-to-br ${section.color} border text-left flex flex-col justify-between hover:scale-[1.02] active:scale-95 transition-all shadow-2xs group cursor-pointer`}
                        >
                          <div className="flex items-start justify-between w-full mb-1">
                            <span className="text-xs font-bold text-slate-900 leading-snug group-hover:text-purple-700 transition-colors">
                              "{cmd.bangla}"
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1 mt-0.5" />
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {cmd.english}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-6 py-3.5 border-t border-purple-100 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1.5 text-[11px] font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  কম্যান্ডে চাপ দিলে শিপ্রা সাথে সাথে উত্তর দেবে
                </span>
                <button
                  onClick={() => setShowShortcutsModal(false)}
                  className="px-4 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors"
                >
                  বন্ধ করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default VoiceAssistantView;
